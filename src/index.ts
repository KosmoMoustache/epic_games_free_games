import axios from 'axios';
import DB, { openDB } from './db';
import API, { ResponseCached } from './handlers/api';
import { parseRawElement } from './handlers/result';
import { freeGamesPromotions, TableEntry } from './types';
import WebhookBuilder from './handlers/webhook';
import { date } from './utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const freeGamesPromotions_url =
  'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions';

if (process.env.AXIOS_DEBUG === 'true') {
  axios.interceptors.request.use((request) => {
    console.log('Starting Request', JSON.stringify(request, null, 2));
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

  const result = await api.fetch<freeGamesPromotions>({
    write: './src/freeGamesPromotions.json',
  });
  // await api.fetch<freeGamesPromotions>({
  //   cacheFile: './src/freeGamesPromotions.json',
  //   write:'./src/freeGamesPromotions.json'
  // });
  const elements = result.data.data.Catalog.searchStore.elements;
  if (result.status != 200) {
    console.warn('Error when fetching data', result);
  }
  if (result.statusText == 'Cached')
    console.debug(
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
      const e: TableEntry<true>['element'] = JSON.parse(np1.element);

      if (
        e.upcomingPromotionalOffers &&
        e.upcomingPromotionalOffers.length >= 1 &&
        e.upcomingPromotionalOffers[0].inFuture &&
        np1.inFuture == false
      ) {
        console.info('New upcoming game found: ', np1.element_id);

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
        console.info('New game found: ', np1.element_id);

        webhook.description += `**${e.title}**: du ${date(
          e.promotionalOffers[0].startDate
        )} au ${date(
          e.promotionalOffers[0].endDate
        )}\nhttps://store.epicgames.com/fr/p/${e.pageSlug}\n`;

        webhook.addImages(
          WebhookBuilder.ImageEmbed(e.keyImages, index, notPublished_Total)
        );
      } else if (
        e.upcomingPromotionalOffers &&
        e.upcomingPromotionalOffers.length >= 1 &&
        np1.inFuture == true &&
        new Date(e.upcomingPromotionalOffers[0].startDate) < new Date()
      ) {
        console.info('Upcoming game now available: ', np1.element_id);

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
      console.info('Sending webhook', new Date().toISOString());
      await webhook.send(process.env.WEBHOOK_URL);
    }
  }
})();
