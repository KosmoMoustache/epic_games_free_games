import { z } from 'zod'

// ---------------------------------------------------------------------------
// Types reverse engineered from the Steam store APIs:
//  - store.steampowered.com/search/ (infinite scroll JSON response)
//  - store.steampowered.com/api/appdetails
// ---------------------------------------------------------------------------

export const SteamSearchResponseSchema = z.object({
  success: z.union([z.literal(1), z.literal(0)]),
  results_html: z.string(),
  total_count: z.number(),
  start: z.number(),
})
export type SteamSearchResponse = z.infer<typeof SteamSearchResponseSchema>

export const SteamPriceOverviewSchema = z.object({
  currency: z.string(),
  initial: z.number(),
  final: z.number(),
  discount_percent: z.number(),
  initial_formatted: z.string(),
  final_formatted: z.string(),
})
export type SteamPriceOverview = z.infer<typeof SteamPriceOverviewSchema>

export const SteamAppDataSchema = z.object({
  steam_appid: z.number(),
  type: z.string(),
  name: z.string(),
  is_free: z.boolean(),
  price_overview: SteamPriceOverviewSchema.nullable().optional(),
  release_date: z
    .object({
      coming_soon: z.boolean(),
      date: z.string(),
    })
    .optional(),
  short_description: z.string().optional(),
  header_image: z.string().optional(),
  package_groups: z
    .array(
      z.object({
        name: z.string(),
        subs: z.array(
          z.object({
            packageid: z.number(),
            is_free_license: z.boolean(),
            price_in_cents_with_discount: z.number(),
          }),
        ),
      }),
    )
    .optional(),
})
export type SteamAppData = z.infer<typeof SteamAppDataSchema>

export const SteamAppDetailsResponseSchema = z.record(
  z.string(),
  z.object({
    success: z.boolean(),
    data: SteamAppDataSchema.nullable(),
  }),
)
export type SteamAppDetailsResponse = z.infer<
  typeof SteamAppDetailsResponseSchema
>

// A row parsed from the search results HTML (not an API response)
export type SteamSearchRow = {
  appid: string
  title: string
  release_date: string
  final_price: number | null
  discount_percent: number
  is_free: boolean
}
