import {
  ParsedElement,
  ParsedPromotionalOffer,
  PromotionalOffers,
  RawElement,
} from '../types';
import { selectKeys } from '../utils';

export function parseRawElement(data: RawElement[]): ParsedElement[] {
  const arr: ParsedElement[] = [];
  data.forEach((el) => {
    const bl = el.promotions?.promotionalOffers;
    const bl1 = el.promotions?.upcomingPromotionalOffers;
    arr.push({
      title: el.title,
      id: el.id,
      pageSlug: getPageSlug(el),
      offerType: el.offerType,
      price: el.price.totalPrice.fmtPrice,
      promotionalOffers: bl // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ? parsePromotionalOffers(el.promotions!.promotionalOffers)
        : undefined,
      upcomingPromotionalOffers: bl1 // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ? parsePromotionalOffers(el.promotions!.upcomingPromotionalOffers)
        : undefined,
      keyImages: el.keyImages.filter(
        (keyImage) =>
          keyImage.type === 'OfferImageWide' ||
          keyImage.type === 'OfferImageTall'
      ),
    });
  });

  return arr;
}

function getPageSlug(el: RawElement): string {
  if (el.productSlug) return el.productSlug;
  return el.catalogNs.mappings[0].pageSlug;
}

function parsePromotionalOffers(
  offers: PromotionalOffers[]
): ParsedPromotionalOffer[] {
  const arr: ParsedPromotionalOffer[] = [];
  if (offers) {
    offers.forEach((p) => {
      p.promotionalOffers.forEach((o) => {
        if (o.discountSetting.discountPercentage == 0) {
          const tmp = selectKeys(
            ['startDate', 'endDate', 'discountSetting'],
            o
          );
          arr.push({
            startDate: tmp.startDate,
            endDate: tmp.endDate,
            discountPercentage: tmp.discountSetting.discountPercentage,
            inFuture: new Date(tmp.startDate) > new Date(),
          });
        }
      });
    });
  }
  return arr;
}
