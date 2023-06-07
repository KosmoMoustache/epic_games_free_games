import Parser from './Parser';
import { element, keyImage } from '../types';

export enum State {
  AVAILABLE_NOW,
  UPCOMING,
  NONE,
}

export type GameElementJSON = {
  title: string;
  id: string;
  effectiveDate: Date;
  offerType: string;
  keyImages: keyImage[];
  productSlug: string;
  price: {
    originalPrice: number;
    discountPrice: number;
  };
  promotions: {
    promotionalOffers: {
      startDate: Date;
      endDate: Date;
      discountPercentage: number;
      inFuture: boolean;
    } | null;
    upcomingPromotionalOffers: {
      startDate: Date;
      endDate: Date;
      discountPercentage: number;
      inFuture: boolean;
    } | null;
  };
};

export default class GameElement {
  title: string;
  id: string;
  effectiveDate: Date;
  offerType: string;
  keyImages: keyImage[];
  productSlug: string;
  price: {
    originalPrice: number;
    discountPrice: number;
  };
  promotions: {
    promotionalOffers: {
      startDate: Date;
      endDate: Date;
      discountPercentage: number;
      inFuture: boolean;
    } | null;
    upcomingPromotionalOffers: {
      startDate: Date;
      endDate: Date;
      discountPercentage: number;
      inFuture: boolean;
    } | null;
  };
  raw: element;

  constructor(element: element) {
    this.raw = element;

    this.title = element.title;
    this.id = element.id;
    this.effectiveDate = new Date(element.effectiveDate);
    this.offerType = element.offerType;
    this.keyImages = element.keyImages.filter((keyImage) =>
      [
        'OfferImage',
        'OfferImageWide',
        'OfferImageTall',
        'VaultClosed',
      ].includes(keyImage.type)
    );
    this.productSlug = Parser.getProductSlug(element);
    this.price = {
      originalPrice: element.price.totalPrice.originalPrice,
      discountPrice: element.price.totalPrice.discountPrice,
    };
    this.promotions = {
      promotionalOffers: null,
      upcomingPromotionalOffers: null,
    };
    if (element.promotions) {
      this.promotions = {
        promotionalOffers: Parser.getPromotionalOffers(
          element.promotions.promotionalOffers
        )[0],
        upcomingPromotionalOffers: Parser.getPromotionalOffers(
          element.promotions.upcomingPromotionalOffers
        )[0],
      };
    }
  }

  getState(): State {
    if (this.promotions.promotionalOffers) return State.AVAILABLE_NOW;
    if (this.promotions.upcomingPromotionalOffers) return State.UPCOMING;
    return State.NONE;
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
    };
  }
}
