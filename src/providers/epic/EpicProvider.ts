import Database from '../../controller/Database.ts'
import WebhookBuilder from '../../controller/Webhook.ts'
import ActionRowComponent from '../../controller/webhook/ActionRowComponent.ts'
import ButtonComponent from '../../controller/webhook/ButtonComponent.ts'
import { debugDatabase, getUnixTimestamp } from '../../helpers/index.ts'
import { get } from '../../services/env.ts'
import Logger from '../../services/logger.ts'
import { FreeGamesPromotionsSchema } from '../../types/api/freeGamesPromotions.ts'
import { type ProviderName, PublishedStateType } from '../../types/types.ts'
import GameProvider from '../GameProvider.ts'
import APIClient from './APIClient.ts'
import Fetcher from './Fetcher.ts'
import { PromotionStatus } from './GameElement.ts'
import Parser from './Parser.ts'

const api_endpoint =
  'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions'

const request_params = {
  locale: 'fr-FR',
  country: 'FR',
  allowCountries: 'FR',
} as const

export default class EpicProvider extends GameProvider {
  readonly name: ProviderName = 'epic'
  #logger = Logger.getLogger('EpicProvider')

  async run(): Promise<boolean> {
    const db = new Database(await Database.open())

    const api = new APIClient(
      api_endpoint,
      request_params,
      FreeGamesPromotionsSchema,
      get('LOG_LEVEL') === 'debug',
    )

    // Parse resulted data
    const fetcher = new Fetcher(api, get('USE_CACHE'))
    const data = await fetcher.get()
    const elements = Parser.parseEpicGames(data)
    const els_id: string[] = []
    const pending_publish = { now: [] as string[], upcoming: [] as string[] }

    if (get('NODE_ENV') === 'development') await debugDatabase(db, this.#logger)

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      if (!element) {
        this.#logger.debug('Element not found', i)
        continue
      }
      if (element.hasPromotions() === false) {
        this.#logger.debug('No promotions', element.id, element.title)
        continue
      }

      // Insert entry in database
      try {
        const res = await db.query.insert({
          provider: this.name,
          game_id: element.id,
          game_name: element.title,
          published: PublishedStateType.NONE,
          in_future: element.getPromotionStatus() === PromotionStatus.UPCOMING,
          end_date: getUnixTimestamp(
            element.promotions.now?.endDate ||
              element.promotions.upcoming?.endDate,
          ),
        })
        if (res.changes === 0) {
          this.#logger.debug('Already in database', element.id, element.title)
        }
      } catch (err) {
        this.#logger.error('Unexpected error when inserting in database', err)
      }

      els_id.push(element.id)
    }

    this.#logger.debug('Elements to publish', els_id)

    for (const id in els_id) {
      const els = elements.filter(el => el.id === els_id[id])
      if (els.length === 0) {
        this.#logger.debug('Element not found', els_id[id])
        continue
      }
      for (const el of els) {
        if (el.getPromotionStatus() === PromotionStatus.AVAILABLE_NOW) {
          this.#logger.debug('Available now', el.id, el.title)
          const publishedState = await db.query.getPublishedState(
            this.name,
            el.id,
          )
          if (
            publishedState === PublishedStateType.NONE ||
            publishedState === PublishedStateType.PUBLISHED_UPCOMING
          ) {
            pending_publish.now.push(el.id)
          }
        }
        if (el.getPromotionStatus() === PromotionStatus.UPCOMING) {
          this.#logger.debug('Upcoming', el.id, el.title)
          const publishedState = await db.query.getPublishedState(
            this.name,
            el.id,
          )
          if (publishedState === PublishedStateType.NONE)
            pending_publish.upcoming.push(el.id)
        }
      }
    }

    /**
     * WEBHOOK
     */

    const webhook = new WebhookBuilder()
    let imageIndex = 0
    const imageTotal =
      pending_publish.now.length + pending_publish.upcoming.length

    // Now
    for (const id of pending_publish.now) {
      const els = elements.filter(el => el.id === id)
      for (const el of els) {
        webhook.appendDescription(
          WebhookBuilder.formatDescription(
            el.title,
            // biome-ignore lint/style/noNonNullAssertion: <>
            el.promotions.now!.startDate,
            // biome-ignore lint/style/noNonNullAssertion: <>
            el.promotions.now!.endDate,
            el.getSlug(),
          ),
        )

        webhook.addImages(
          WebhookBuilder.getImageFromIndexAndTotal(
            el.data.keyImages,
            imageIndex,
            imageTotal,
          ),
        )
        imageIndex++

        const db_entry = await db.query.getByGameId(this.name, el.id)
        if (db_entry === undefined) {
          this.#logger.error('Element not found in database', el.id, el.title)
          continue
        }
        await db.query.updatePublishedStateById(
          db_entry.id,
          PublishedStateType.PUBLISHED,
        )
      }
    }

    // Upcoming
    for (const el of pending_publish.upcoming) {
      const els = elements.filter(e => e.id === el)
      for (const el of els) {
        // Filter out Mystery Game
        if (el.title.includes('Mystery Game')) {
          this.#logger.debug('Skipping Mystery Game', el.id, el.title)
          continue
        }

        webhook.appendDescription(
          `*(Bientôt)* ${WebhookBuilder.formatDescription(
            el.title,
            // biome-ignore lint/style/noNonNullAssertion: <>
            el.promotions.upcoming!.startDate,
            // biome-ignore lint/style/noNonNullAssertion: <>
            el.promotions.upcoming!.endDate,
            el.getSlug(),
          )}`,
        )

        webhook.addImages(
          WebhookBuilder.getImageFromIndexAndTotal(
            el.data.keyImages,
            imageIndex,
            imageTotal,
          ),
        )
        imageIndex++

        const db_entry = await db.query.getByGameId(this.name, el.id)
        if (db_entry === undefined) {
          this.#logger.error('Element not found in database', el.id, el.title)
          continue
        }
        await db.query.updatePublishedStateById(
          db_entry.id,
          PublishedStateType.PUBLISHED_UPCOMING,
        )
      }
    }

    if (webhook.description.length > 1) {
      webhook.addComponent(
        new ActionRowComponent().addComponents([
          new ButtonComponent({
            style: ButtonComponent.ButtonStyle.LINK,
            emoji: {
              name: 'ℹ️',
            },
            label: "Plus d'informations",
            url: 'https://s.kosmo.ovh/egfg-add',
          }),
        ]),
      )
      this.#logger.info('Sending webhook')
      await webhook.send(new URL(get('WEBHOOK_URL'))).catch(err => {
        this.#logger.error('Error while sending webhook', err.message)
        this.#logger.error('raw webhook data:', webhook)
      })
      return true
    }
    return false
  }
}
