import Logger from '../services/logger.ts'
import type { Element } from '../types/types.ts'

type GameElementPromotion = {
  startDate: Date
  endDate: Date
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
  static logger = Logger.getLogger('GameElement')
  raw: Element
  data: Element<Date>

  id: Element['id']
  title: Element['title']

  promotions: GameElementPromotions = {
    now: null,
    upcoming: null,
  }

  constructor(element: Element) {
    this.raw = element
    this.data = GameElement.parse(element)
    this.id = element.id
    this.title = element.title

    this.extractPromotions()

    if (this.promotions.now == null && this.promotions.upcoming == null)
      GameElement.logger.debug('No valid promotions found for', this.title, this.id)
  }

  static parse(element: Element): Element<Date> {
    return {
      ...element,
      effectiveDate: new Date(element.effectiveDate),
      viewableDate: new Date(element.viewableDate),
      price: {
        ...element.price,
        lineOffers:
          element.price.lineOffers.length >= 1
            ? element.price.lineOffers.map(lineOffer => ({
                appliedRules:
                  lineOffer.appliedRules.length >= 1
                    ? lineOffer.appliedRules.map(rule => ({
                        ...rule,
                        endDate: new Date(rule.endDate),
                      }))
                    : [],
              }))
            : [],
      },
      promotions:
        element.promotions != null
          ? {
              promotionalOffers: element.promotions.promotionalOffers.map(
                promotionalOffer => ({
                  promotionalOffers: promotionalOffer.promotionalOffers.map(
                    offer => ({
                      ...offer,
                      startDate: new Date(offer.startDate),
                      endDate: new Date(offer.endDate),
                    }),
                  ),
                }),
              ),
              upcomingPromotionalOffers:
                element.promotions.upcomingPromotionalOffers?.map(
                  promotionalOffer => ({
                    promotionalOffers: promotionalOffer.promotionalOffers.map(
                      offer => ({
                        ...offer,
                        startDate: new Date(offer.startDate),
                        endDate: new Date(offer.endDate),
                      }),
                    ),
                  }),
                ),
            }
          : null,
    }
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
      this.promotions.now = {
        startDate: new Date(now.startDate),
        endDate: new Date(now.endDate),
        inFuture: new Date(now.startDate) > new Date(),
      }
    }

    if (
      promotions?.upcomingPromotionalOffers &&
      promotions?.upcomingPromotionalOffers?.length >= 1
    ) {
      const upcoming =
        promotions?.upcomingPromotionalOffers[0]?.promotionalOffers[0]
      if (upcoming && upcoming.discountSetting.discountPercentage === 0) {
        this.promotions.upcoming = {
          startDate: new Date(upcoming.startDate),
          endDate: new Date(upcoming.endDate),
          inFuture: new Date(upcoming.startDate) > new Date(),
        }
      }
    }
  }
}
