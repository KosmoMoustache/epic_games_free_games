import type Database from '../../controller/Database.ts'
import WebhookBuilder from '../../controller/Webhook.ts'
import ActionRowComponent from '../../controller/webhook/ActionRowComponent.ts'
import ButtonComponent from '../../controller/webhook/ButtonComponent.ts'
import { get } from '../../services/env.ts'
import Logger from '../../services/logger.ts'
import {
  type ProviderName,
  PublishedStateType,
  PubStatus,
} from '../../types/types.ts'
import GameProvider from '../GameProvider.ts'
import SteamFetcher from './SteamFetcher.ts'
import SteamPromotionElement, {
  SteamPromotionType,
} from './SteamPromotionElement.ts'

export default class SteamProvider extends GameProvider {
  readonly name: ProviderName = 'steam'
  #logger = Logger.getLogger('SteamProvider')

  async run(db: Database, fetcher = new SteamFetcher()): Promise<boolean> {
    // The search endpoint already targets free games with a discount:
    //  - sort_by=_ASC, maxprice=free, specials=1, category1=998
    const rows = await fetcher.fetchAllSearchPages({}, 3)

    this.#logger.debug('Rows found', rows.length)

    const app_details = await fetcher.fetchAppDetailsForRows(rows)

    const elements = rows
      .map(
        row =>
          new SteamPromotionElement(row, app_details.get(row.appid) ?? null),
      )
      .filter(el => el.getType() === SteamPromotionType.FREE_TO_KEEP)

    const pending_publish: string[] = []
    for (const el of elements) {
      // Insert entry in database
      const res = await db.query.insert({
        provider: this.name,
        game_id: el.appid,
        game_name: el.title,
        pub_status: PubStatus.NONE,
        in_future: false,
        end_date: 0,
      })
      if (res.changes === 0) {
        this.#logger.debug('Already in database', el.appid, el.title)
        continue
      }
      pending_publish.push(el.appid)
    }

    this.#logger.debug('Elements to publish', pending_publish)
    if (pending_publish.length === 0) return false

    /**
     * WEBHOOK
     */
    const webhook = new WebhookBuilder({
      title: '[Steam]',
      username: 'Steam Deals',
      url: 'https://store.steampowered.com/',
    })

    let imageIndex = 0
    const imageTotal = pending_publish.length
    for (const appid of pending_publish) {
      const elements_for_app = elements.filter(el => el.appid === appid)
      for (const el of elements_for_app) {
        webhook.appendDescription(
          WebhookBuilder.formatSteamDescription(el.title, el.appid),
        )

        const header_image = el.app?.header_image
        if (header_image !== undefined) {
          webhook.addImages({
            url: `https://store.steampowered.com/app/${el.appid}`,
            image: { url: header_image },
          })
        }
        imageIndex++

        const db_entry = await db.query.getByGameId(this.name, el.appid)
        if (db_entry === undefined) {
          this.#logger.error(
            'Element not found in database',
            el.appid,
            el.title,
          )
          continue
        }
        await db.query.updatePubStatusById(
          db_entry.id,
          PublishedStateType.PUBLISHED,
        )
      }
    }

    this.#logger.debug('Steam image index', imageIndex, imageTotal)

    webhook.addComponent(
      new ActionRowComponent().addComponents([
        new ButtonComponent({
          style: ButtonComponent.ButtonStyle.LINK,
          emoji: {
            name: 'ℹ️',
          },
          label: "Plus d'informations",
          url: 'https://store.steampowered.com/',
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
}
