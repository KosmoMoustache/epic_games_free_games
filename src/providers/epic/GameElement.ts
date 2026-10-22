import Logger from '../../services/logger.ts'
import type { Element } from '../../types/api/epic.ts'

type GameElementPromotion = {
  startDate: Temporal.Instant
  endDate: Temporal.Instant
  inFuture: boolean
}
type GameElementPromotions = {
  now: GameElementPromotion | null
  upcoming: GameElementPromotion | null
}

export const PromotionStatus = {
  AVAILABLE_NOW: 0,
  UPCOMING: 1,
  NONE: 2,
} as const

export default class GameElement {
  static logger = Logger.getLogger('Epic/GameElement')
  raw: Element
  data: Element

  id: Element['id']
  title: Element['title']

  promotions: GameElementPromotions = {
    now: null,
    upcoming: null,
  }

  constructor(element: Element) {
    this.raw = element
    this.data = element
    this.id = element.id
    this.title = element.title

    this.extractPromotions()

    if (this.promotions.now == null && this.promotions.upcoming == null)
      GameElement.logger.debug(
        'No valid promotions found for',
        this.title,
        this.id,
      )
  }

  hasPromotions(this: GameElement): boolean {
    return (
      this.promotions &&
      (this.promotions.now != null || this.promotions.upcoming != null)
    )
  }

  getPromotionStatus(): (typeof PromotionStatus)[keyof typeof PromotionStatus] {
    if (this.promotions.now) return PromotionStatus.AVAILABLE_NOW
    if (this.promotions.upcoming) return PromotionStatus.UPCOMING
    return PromotionStatus.NONE
  }

  getSlug(): string {
    if (this.data.productSlug) return this.data.productSlug

    const mappings = Array.isArray(this.data.catalogNs.mappings)
      ? this.data.catalogNs.mappings
      : []
    if (mappings.length >= 1) {
      return mappings[0]?.pageSlug ?? this.id
    }

    const offerMappings = Array.isArray(this.data.offerMappings)
      ? this.data.offerMappings
      : []
    if (offerMappings.length >= 1) {
      return offerMappings[0]?.pageSlug ?? this.id
    }
    return this.id
  }

  /**
   * Extract the promotions from the element data
   * @param promotions The promotions data to extract from
   */
  private extractPromotions(promotions = this.data.promotions) {
    const now = promotions?.promotionalOffers[0]?.promotionalOffers[0]
    if (now && now.discountSetting.discountPercentage === 0) {
      const startDate = Temporal.Instant.from(now.startDate)
      this.promotions.now = {
        startDate,
        endDate: Temporal.Instant.from(now.endDate),
        inFuture:
          Temporal.Instant.compare(startDate, Temporal.Now.instant()) > 0,
      }
    }

    if (
      promotions?.upcomingPromotionalOffers &&
      promotions?.upcomingPromotionalOffers?.length >= 1
    ) {
      const upcoming =
        promotions?.upcomingPromotionalOffers[0]?.promotionalOffers[0]
      if (upcoming && upcoming.discountSetting.discountPercentage === 0) {
        const startDate = Temporal.Instant.from(upcoming.startDate)
        this.promotions.upcoming = {
          startDate,
          endDate: Temporal.Instant.from(upcoming.endDate),
          inFuture:
            Temporal.Instant.compare(startDate, Temporal.Now.instant()) > 0,
        }
      }
    }
  }
}
