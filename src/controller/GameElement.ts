import type { element, keyImage } from '../types/index.ts'
import Parser from './Parser.ts'

export const State = {
  AVAILABLE_NOW: 0,
  UPCOMING: 1,
  NONE: 2,
} as const

export type GameElementJSON = {
  title: string
  id: string
  effectiveDate: Date
  offerType: string
  keyImages: keyImage[]
  productSlug: string
  price: {
    originalPrice: number
    discountPrice: number
  }
  promotions: {
    promotionalOffers: {
      startDate: Date
      endDate: Date
      discountPercentage: number
      inFuture: boolean
    } | null
    upcomingPromotionalOffers: {
      startDate: Date
      endDate: Date
      discountPercentage: number
      inFuture: boolean
    } | null
  }
}

export default class GameElement {
  title: string
  id: string
  effectiveDate: Date
  offerType: string
  keyImages: keyImage[]
  productSlug: string
  price: {
    originalPrice: number
    discountPrice: number
  }
  promotions: {
    promotionalOffers: {
      startDate: Date
      endDate: Date
      discountPercentage: number
      inFuture: boolean
    } | null

    upcomingPromotionalOffers: {
      startDate: Date
      endDate: Date
      discountPercentage: number
      inFuture: boolean
    } | null
  }
  raw: element

  constructor(element: element) {
    this.raw = element

    this.title = element.title
    this.id = element.id
    this.effectiveDate = new Date(element.effectiveDate)
    this.offerType = element.offerType
    this.keyImages = element.keyImages.filter(keyImage =>
      [
        'OfferImage',
        'OfferImageWide',
        'OfferImageTall',
        'DieselStoreFrontWide',
        'VaultClosed',
      ].includes(keyImage.type),
    )
    this.productSlug = Parser.getProductSlug(element)
    this.price = {
      originalPrice: element.price.totalPrice.originalPrice,
      discountPrice: element.price.totalPrice.discountPrice,
    }
    this.promotions = {
      promotionalOffers: null,
      upcomingPromotionalOffers: null,
    }
    if (element.promotions) {
      this.promotions = {
        promotionalOffers:
          Parser.getPromotionalOffers(
            element.promotions.promotionalOffers,
          )[0] || null,
        upcomingPromotionalOffers:
          Parser.getPromotionalOffers(
            element.promotions.upcomingPromotionalOffers,
          )[0] || null,
      }
    }
  }

  getState(): (typeof State)[keyof typeof State] {
    if (this.promotions.promotionalOffers) return State.AVAILABLE_NOW
    if (this.promotions.upcomingPromotionalOffers) return State.UPCOMING
    return State.NONE
  }

  toJSON(): GameElementJSON {
    return {
      title: this.title,
      id: this.id,
      effectiveDate: this.effectiveDate,
      offerType: this.offerType,
      keyImages: this.keyImages,
      productSlug: this.productSlug,
      price: this.price,
      promotions: this.promotions,
    }
  }

  getIdTitle(): {
    id: GameElement['id']
    title: GameElement['title']
  } {
    return {
      id: this.id,
      title: this.title,
    }
  }
}
