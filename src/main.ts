import type API from './controller/API.ts'
import DB from './controller/Database.ts'
import { State } from './controller/GameElement.ts'
import Parser from './controller/Parser.ts'
import WebhookBuilder from './controller/Webhook.ts'
import { get } from './env.ts'
import logger from './logger.ts'
import type { SQLError } from './types/index.ts'
import { debugDatabase, getApiResult } from './utils.ts'

/**
 *
 * @param api API instance
 * @param USE_CACHE boolean if cache should be used
 * @returns true if webhook was sent false otherwise
 */
const main = async (api: API, USE_CACHE: boolean): Promise<boolean> => {
  const db = new DB(await DB.openDB())

  // Parse resulted data
  const elements = Parser.response(await getApiResult(api, USE_CACHE))
  const failed: string[] = [] // already in db
  const success: string[] = [] // new game

  if (get('NODE_ENV') === 'development') debugDatabase(db)

  //
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    if (!element) break

    try {
      await db.published.insert(element.id, element.title)
      success.push(element.id)
      failed.push(element.id)
    } catch (err) {
      if (DB.isSQLError(err) && DB.isDuplicateError(err as SQLError)) {
        failed.push(element.id)
        logger.info('Duplicate entry', {
          id: element.id,
          title: element.title,
        })
      } else {
        logger.error('Unexpected error when inserting in database', err)
      }
    }
  }

  const toPublish: string[] = []
  const upcomingToPublish: string[] = []

  for (let i = 0; i < failed.length; i++) {
    const id = failed[i]
    const _elements = elements.filter(el => el.id === id)

    for (let j = 0; j < _elements.length; j++) {
      const el = _elements[j]
      if (!el) break
      logger.debug('State', el.getState(), el.getIdTitle())
      if (el.getState() === State.AVAILABLE_NOW) {
        logger.debug('Available now', el.getIdTitle())
        const isPublished = await db.published.isPublished(el.id)
        if (isPublished === false) toPublish.push(el.id)
      }

      if (el.getState() === State.UPCOMING) {
        logger.debug('Upcoming', el.getIdTitle())
        const isPublished = await db.upcoming.isPublished(el.id)
        if (isPublished === false) upcomingToPublish.push(el.id)
      }
    }
  }

  /**
   * WEBHOOK
   */

  const webhook = new WebhookBuilder()
  let imageIndex = -1

  // Available now
  for (let i = 0; i < toPublish.length; i++) {
    const id = toPublish[i]
    const element = elements.filter(el => el.id === id)[0]
    if (!element) break
    webhook.description += WebhookBuilder.formatDescription(
      element.title,
      // biome-ignore lint/style/noNonNullAssertion: typing is hard
      element.promotions.promotionalOffers!.startDate,
      // biome-ignore lint/style/noNonNullAssertion: typing is hard
      element.promotions.promotionalOffers!.endDate,
      element.productSlug,
    )

    webhook.addImages(
      WebhookBuilder.getImageFromIndexAndTotal(
        element.keyImages,
        imageIndex++,
        toPublish.length,
      ),
    )

    await db.published.updatePublishedStateByGameId(element.id, true)
  }

  // upcoming now
  for (let i = 0; i < upcomingToPublish.length; i++) {
    const id = upcomingToPublish[i]
    const element = elements.filter(el => el.id === id)[0]
    if (!element) break
    // Skip sending webhook of mystery games
    if (element.title.includes('Mystery Game')) continue

    webhook.description += '*(Bientôt)* '
    webhook.description += WebhookBuilder.formatDescription(
      element.title,
      // biome-ignore lint/style/noNonNullAssertion: typing is hard
      element.promotions.upcomingPromotionalOffers!.startDate,
      // biome-ignore lint/style/noNonNullAssertion: typing is hard
      element.promotions.upcomingPromotionalOffers!.endDate,
    )

    webhook.addImages(
      WebhookBuilder.getImageFromIndexAndTotal(
        element.keyImages,
        imageIndex++,
        toPublish.length,
      ),
    )

    await db.upcoming.updatePublishedStateByGameId(element.id, true)
  }

  if (webhook.description.length > 1) {
    webhook.timestamp = new Date().toISOString()
    logger.info('Sending webhook')
    await webhook.send(get('WEBHOOK_URL'))
    return true
  }

  return false
}

export default main
