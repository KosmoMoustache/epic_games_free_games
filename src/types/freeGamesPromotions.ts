export interface freeGamesPromotions {
  data: {
    Catalog: {
      searchStore: searchStore;
    };
  };
  extensions: object | unknown;
}
export default freeGamesPromotions;

interface searchStore {
  elements: element[];
  paging: {
    count: number;
    total: number;
  };
}

// TODO: refactor
export type RawElement = element;
export interface element {
  title: string;
  id: string;
  namespace: string | 'catnip';
  description: string;
  effectiveDate: string | Date;
  offerType: string | 'OTHERS' | 'DLC' | 'BASE_GAME';
  expiryDate: null;
  status: string | 'ACTIVE';
  isCodeRedemptionOnly: boolean;
  keyImages: keyImage[];
  seller: {
    id: string;
    name: string;
  };
  productSlug: null | string;
  urlSlug: string;
  url: null;
  items: Array<{
    id: string;
    namespace: string | 'catnip';
  }>;
  customAttributes: Array<{
    key: string;
    value: string;
  }>;
  categories: Array<Record<'path', string>>;
  tags: Array<Record<'id', string>>;
  catalogNs: {
    mappings: Array<{
      pageSlug: string;
      pageType: string;
    }>;
  };
  offerMappings: Array<{
    pageSlug: string;
    pageType: string;
  }>;
  price: {
    totalPrice: {
      discountPrice: number;
      originalPrice: number;
      voucherDiscount: number;
      discount: number;
      currencyCode: 'EUR' | string;
      currencyInfo: {
        decimals: number;
      };
      fmtPrice: {
        originalPrice: string;
        discountPrice: string;
        intermediatePrice: string;
      };
    };
    lineOffers: Array<{
      appliedRules: Array<{
        id: string;
        endDate: Date | string;
        discountSetting: {
          discountType: 'PERCENTAGE' | string;
        };
      }>;
    }>;
  };
  promotions: PromotionsData;
}

export interface keyImage {
  type: 'OfferImageWide' | 'OfferImageTall' | 'Thumbnail' | string;
  url: string;
}

export type PromotionsData = Promotions | null;
export interface Promotions {
  promotionalOffers: PromotionalOffers[];
  upcomingPromotionalOffers: PromotionalOffers[];
}
export interface PromotionalOffers {
  promotionalOffers: PromotionalOffer[];
}
export interface PromotionalOffer {
  startDate: string;
  endDate: string;
  discountSetting: {
    discountType: 'PERCENTAGE' | string;
    discountPercentage: number;
  };
}
