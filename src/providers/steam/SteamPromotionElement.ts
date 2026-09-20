import Logger from '../../services/logger.ts'
import type { SteamAppData, SteamSearchRow } from '../../types/api/steam.ts'

export const SteamPromotionType = {
  FREE_TO_PLAY: 'FREE_TO_PLAY',
  FREE_TO_KEEP: 'FREE_TO_KEEP',
  FREE_WEEKEND: 'FREE_WEEKEND',
  NONE: 'NONE',
} as const
export type SteamPromotionType =
  (typeof SteamPromotionType)[keyof typeof SteamPromotionType]

export default class SteamPromotionElement {
  static logger = Logger.getLogger('SteamPromotionElement')
  row: SteamSearchRow
  app: SteamAppData | null

  constructor(row: SteamSearchRow, app: SteamAppData | null) {
    this.row = row
    this.app = app
  }

  get appid(): string {
    return this.row.appid
  }

  get title(): string {
    return this.app?.name ?? this.row.title
  }

  /**
   * Determine the kind of "free" a game currently is based on the
   * storefront search row and the app details payload.
   */
  getType(): SteamPromotionType {
    if (this.app === null) {
      return this.row.is_free
        ? SteamPromotionType.FREE_TO_PLAY
        : SteamPromotionType.NONE
    }

    if (this.app.is_free === true) {
      const price = this.app.price_overview
      if (price != null && price.discount_percent === 100) {
        return SteamPromotionType.FREE_TO_KEEP
      }
      return SteamPromotionType.FREE_TO_PLAY
    }

    // Paid game currently listed as free in the storefront: free weekend
    if (this.row.is_free === true) {
      return SteamPromotionType.FREE_WEEKEND
    }
    return SteamPromotionType.NONE
  }
}
