import * as dotenv from 'dotenv';
import axios from 'axios';
import DB, { openDB } from './db';
import API, { FetchParams, ResponseCached } from './handlers/api';
import { parseRawElement } from './handlers/result';
import { freeGamesPromotions, TableEntry } from './types';
import WebhookBuilder from './handlers/webhook';
import { date } from './utils';
import logger from './logger';

dotenv.config();

const freeGamesPromotions_url =
  'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions';

if (process.env.AXIOS_DEBUG === 'true') {
  axios.interceptors.request.use((request) => {
    logger.log('Starting Request', JSON.stringify(request, null, 2));
    return request;
  });
}

const api = new API(freeGamesPromotions_url, {
  locale: 'fr-FR',
  country: 'FR',
  allowCountries: 'FR',
});

(async () => {
  const db = new DB(await openDB());

  const options: FetchParams =
    process.env.NODE_ENV !== 'production'
      ? {}
      : { write: './src/freeGamesPromotions.json' };

  const result = await api.fetch<freeGamesPromotions>(options);

  const elements = result.data.data.Catalog.searchStore.elements;
  if (result.status != 200) {
    logger.warn('Error when fetching data', result);
  }
  if (result.statusText == 'Cached')
    logger.debug(
      'CachedAt:',
      new Date(
        Number(
          (result as unknown as ResponseCached<freeGamesPromotions>).cachedAt
        )
      )
    );

  const parsedElements = parseRawElement(
    elements /* elements.filter((el) => el.offerType == 'BASE_GAME') */
  );

  await DB.try(
    async () =>
      await Promise.all(
        parsedElements.map((vl) => {
          return db.insert(vl.id, vl);
        })
      )
  );

  const notPublished = await db.getNotPublished(false, {
    sql: 'OR inFuture = ?',
    data: [true],
  });

  const webhook = new WebhookBuilder();

  if (notPublished) {
    const notPublished_Total =
      notPublished.filter(
        (np2) =>
          (JSON.parse(np2.element).promotionalOffers ||
            JSON.parse(np2.element).upcomingPromotionalOffers) &&
          np2.inFuture != true
      ).length || notPublished.length;

    notPublished.forEach(async (np1, index) => {
      let e: TableEntry<true>['element'] = JSON.parse(np1.element);

      console.log(e);

      // If saved data is a Mystery Game, fetch the uncovered data
      if (e.title == 'Mystery Game') {
        const result = await api.fetch<freeGamesPromotions>();
        const elements = result.data.data.Catalog.searchStore.elements;
        const fetchedElement = elements.find((el) => el.id === e.id);

        if (fetchedElement) {
          e = parseRawElement([fetchedElement])[0];
          await db.updateById(e.id, e);
        }
      }

      if (
        e.upcomingPromotionalOffers &&
        e.upcomingPromotionalOffers.length >= 1 &&
        e.upcomingPromotionalOffers[0].inFuture &&
        np1.inFuture == false
      ) {
        logger.info('New upcoming game found: ', np1.element_id);

        webhook.description += '(Bientôt) ';
        webhook.description += `**${e.title}**: du ${date(
          e.upcomingPromotionalOffers[0].startDate
        )} au ${date(
          e.upcomingPromotionalOffers[0].endDate
        )} https://store.epicgames.com/fr/p/${e.pageSlug}\n`;

        webhook.addImages(
          WebhookBuilder.ImageEmbed(e.keyImages, index, notPublished_Total)
        );
        db.updateInFuture(e.id);
      } else if (e.promotionalOffers && e.promotionalOffers.length >= 1) {
        logger.info('New game found: ', np1.element_id);

        webhook.description += `**${e.title}**: du ${date(
          e.promotionalOffers[0].startDate
        )} au ${date(
          e.promotionalOffers[0].endDate
        )}\nhttps://store.epicgames.com/fr/p/${e.pageSlug}\n`;

        webhook.addImages(
          WebhookBuilder.ImageEmbed(e.keyImages, index, notPublished_Total)
        );
        db.updateInFuture(e.id, false);
      } else if (
        e.upcomingPromotionalOffers &&
        e.upcomingPromotionalOffers.length >= 1 &&
        np1.inFuture == true &&
        new Date(e.upcomingPromotionalOffers[0].startDate) < new Date()
      ) {
        logger.info('Upcoming game now available: ', np1.element_id);

        webhook.description += `**${e.title}**: du ${date(
          e.upcomingPromotionalOffers[0].startDate
        )} au ${date(
          e.upcomingPromotionalOffers[0].endDate
        )}\nhttps://store.epicgames.com/fr/p/${e.pageSlug}\n`;

        webhook.addImages(
          WebhookBuilder.ImageEmbed(e.keyImages, index, notPublished_Total)
        );
        db.updateInFuture(e.id, false);
      }

      db.updatePublishedState(e.id);
      webhook.timestamp = new Date().toISOString();
    });
    if (webhook.description.length > 1) {
      logger.info('Sending webhook', new Date().toISOString());
      await webhook.send(process.env.WEBHOOK_URL);
    }
  }
})();
