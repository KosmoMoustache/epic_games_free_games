// Steam store search API (store.steampowered.com/search/results)
export type SteamSearchResponse = {
  success: 1 | 0
  results_html: string
  total_count: number
  start: number
}

// Steam store app details API (store.steampowered.com/api/appdetails)
export type SteamAppDetailsResponse = {
  [appid: string]: {
    success: boolean
    data: SteamAppData | null
  }
}

export type SteamPriceOverview = {
  currency: string
  initial: number
  final: number
  discount_percent: number
  initial_formatted: string
  final_formatted: string
}

export type SteamAppData = {
  steam_appid: number
  type: string
  name: string
  is_free: boolean
  price_overview: SteamPriceOverview | null
  release_date?: {
    coming_soon: boolean
    date: string
  }
  short_description?: string
  header_image?: string
  package_groups?: {
    name: string
    subs: {
      packageid: number
      is_free_license: boolean
      price_in_cents_with_discount: number
    }[]
  }[]
}

// A parsed row from the search results HTML
export type SteamSearchRow = {
  appid: string
  title: string
  release_date: string
  final_price: number | null
  discount_percent: number
  is_free: boolean
}
