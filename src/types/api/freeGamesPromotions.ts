import { z } from 'zod'

// ---------------------------------------------------------------------------
// Types reverse engineered from the Epic Games Store freeGamesPromotions API
// (https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions)
// ---------------------------------------------------------------------------

export const KeyImageSchema = z.object({
  type: z.string(),
  url: z.string(),
})
export type KeyImage = z.infer<typeof KeyImageSchema>

export const ElementSchema = z.object({
  title: z.string(),
  id: z.string(),
  namespace: z.string(),
  description: z.string(),
  effectiveDate: z.string(),
  offerType: z.string(),
  expiryDate: z.string().nullable(),
  viewableDate: z.string().nullable(),
  status: z.string(),
  isCodeRedemptionOnly: z.boolean(),
  keyImages: z.array(KeyImageSchema),
  seller: z.object({
    id: z.string(),
    name: z.string(),
  }),
  productSlug: z.string().nullable(),
  urlSlug: z.string(),
  url: z.string().nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      namespace: z.string(),
    }),
  ),
  customAttributes: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  ),
  categories: z.array(
    z.object({
      path: z.string(),
    }),
  ),
  tags: z.array(
    z.object({
      id: z.string(),
    }),
  ),
  catalogNs: z.object({
    mappings: z
      .array(
        z.object({
          pageSlug: z.string(),
          pageType: z.string(),
        }),
      )
      .nullable(),
  }),
  offerMappings: z
    .array(
      z.object({
        pageSlug: z.string(),
        pageType: z.string(),
      }),
    )
    .nullable(),
  price: z.object({
    totalPrice: z.object({
      discountPrice: z.number(),
      originalPrice: z.number(),
      voucherDiscount: z.number(),
      discount: z.number(),
      currencyCode: z.string(),
      currencyInfo: z.object({
        decimals: z.number(),
      }),
      fmtPrice: z.object({
        originalPrice: z.string(),
        discountPrice: z.string(),
        intermediatePrice: z.string(),
      }),
    }),
    lineOffers: z.array(
      z.object({
        appliedRules: z.array(
          z.object({
            id: z.string(),
            endDate: z.string(),
            discountSetting: z.object({
              discountType: z.string(),
            }),
          }),
        ),
      }),
    ),
  }),
  promotions: z
    .object({
      promotionalOffers: z.array(
        z.object({
          promotionalOffers: z.array(
            z.object({
              startDate: z.string(),
              endDate: z.string(),
              discountSetting: z.object({
                discountType: z.string(),
                discountPercentage: z.number(),
              }),
            }),
          ),
        }),
      ),
      upcomingPromotionalOffers: z
        .array(
          z.object({
            promotionalOffers: z.array(
              z.object({
                startDate: z.string(),
                endDate: z.string(),
                discountSetting: z.object({
                  discountType: z.string(),
                  discountPercentage: z.number(),
                }),
              }),
            ),
          }),
        )
        .optional(),
    })
    .nullable(),
})
export type Element = z.infer<typeof ElementSchema>

export const FreeGamesPromotionsSchema = z.object({
  error: z.unknown().optional(),
  data: z.object({
    Catalog: z.object({
      searchStore: z.object({
        elements: z.array(ElementSchema),
        paging: z.object({
          count: z.number(),
          total: z.number(),
        }),
      }),
    }),
  }),
})
export type FreeGamesPromotions = z.infer<typeof FreeGamesPromotionsSchema>
