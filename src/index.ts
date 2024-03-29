import * as dotenv from 'dotenv';
import DB from './controller/Database';
import { SQLError } from './types';
import logger from './logger';
import Parser from './controller/Parser';
import API from './controller/API';
import { State } from './controller/GameElement';
import WebhookBuilder from './controller/Webhook';
import { getApiResult } from './utils';

dotenv.config();

const USE_CACHE = false;

const api_endpoint =
  'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions';

const api = new API(
  api_endpoint,
  {
    locale: 'fr-FR',
    country: 'FR',
    allowCountries: 'FR',
  },
  process.env.AXIOS_DEBUG === 'true'
);

(async () => {
  const db = new DB(await DB.openDB());

  // Parse resulted data
  const elements = Parser.response(await getApiResult(api, USE_CACHE));
  const failed: string[] = []; // already in db
  const success: string[] = []; // new game

  //
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    try {
      await db.published.insert(element.id, element.title);
      success.push(element.id);
      failed.push(element.id);
    } catch (err) {
      if (DB.isSQLError(err) && DB.isDuplicateError(err as SQLError)) {
        failed.push(element.id);
        logger.info('Duplicate entry', element.id);
      } else {
        logger.error('Unexpected error', err);
      }
    }
  }

  const toPublish: string[] = [];
  const upcomingToPublish: string[] = [];

  for (let i = 0; i < failed.length; i++) {
    const id = failed[i];
    const _elements = elements.filter((el) => el.id == id);

    for (let j = 0; j < _elements.length; j++) {
      const el = _elements[j];
      if (el.getState() === State.AVAILABLE_NOW) {
        logger.debug('available now', el.id);
        const isPublished = await db.published.isPublished(el.id);
        if (isPublished === false) toPublish.push(el.id);
      }

      logger.debug(el.id, el.getState());
      if (el.getState() === State.UPCOMING) {
        logger.debug('upcoming', el.id);
        const isPublished = await db.upcoming.isPublished(el.id);
        if (isPublished === false) upcomingToPublish.push(el.id);
      }
    }
  }

  /**
   * WEBHOOK
   */

  const webhook = new WebhookBuilder();
  let imageIndex = -1;

  // Available now
  for (let i = 0; i < toPublish.length; i++) {
    const id = toPublish[i];
    const element = elements.filter((el) => el.id == id)[0];
    webhook.description += WebhookBuilder.formatDescription(
      element.title,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      element.promotions.promotionalOffers!.startDate,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      element.promotions.promotionalOffers!.endDate,
      element.productSlug
    );

    webhook.addImages(
      WebhookBuilder.ImageEmbed(
        element.keyImages,
        imageIndex++,
        toPublish.length
      )
    );

    await db.published.updatePublishedStateByGameId(element.id, true);
  }

  // upcoming now
  for (let i = 0; i < upcomingToPublish.length; i++) {
    const id = upcomingToPublish[i];
    const element = elements.filter((el) => el.id == id)[0];
    // Skip sending webhook of mystery games
    if (element.title.includes('Mystery Game')) continue;

    webhook.description += '*(Bientôt)* ';
    webhook.description += WebhookBuilder.formatDescription(
      element.title,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      element.promotions.upcomingPromotionalOffers!.startDate,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      element.promotions.upcomingPromotionalOffers!.endDate
    );

    webhook.addImages(
      WebhookBuilder.ImageEmbed(
        element.keyImages,
        imageIndex++,
        toPublish.length
      )
    );

    await db.upcoming.updatePublishedStateByGameId(element.id, true);
  }

  if (webhook.description.length > 1) {
    webhook.timestamp = new Date().toISOString();
    logger.info('Sending webhook');
    await webhook.send(process.env.WEBHOOK_URL);
  }
})();
