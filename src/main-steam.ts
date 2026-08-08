import SteamPromotionElement, {
  SteamPromotionType,
} from './controller/steamPromotionElement.ts'
import Logger from './services/logger.ts'
import SteamFetcher from './services/steamFetcher.ts'

const steam = async (): Promise<void> => {
  const fetcher = new SteamFetcher()
  const steam_logger = Logger.getLogger('SteamMain')

  // Two discovery sources:
  //  - specials: catches free-to-keep promos (100% off) and free weekends
  //  - free category (category1=998): catches always free-to-play games
  const [specials, always_free] = await Promise.all([
    fetcher.fetchAllSearchPages({ specials: true, sort_by: 'Price_ASC' }, 3),
    fetcher.fetchAllSearchPages({ free: true }, 3),
  ])

  const seen = new Set<string>()
  const rows = [...specials, ...always_free].filter(row => {
    if (seen.has(row.appid)) return false
    seen.add(row.appid)
    return true
  })
  steam_logger.info('Found rows', rows.length)

  const app_details = await fetcher.fetchAppDetailsForRows(rows)

  const free_games = rows
    .map(
      row => new SteamPromotionElement(row, app_details.get(row.appid) ?? null),
    )
    .filter(el => el.getType() !== SteamPromotionType.NONE)

  steam_logger.info('Free games found', free_games.length)
  for (const el of free_games) {
    steam_logger.info(
      `[${el.appid}] ${el.title} (${el.getType()}) ${
        el.row.discount_percent > 0 ? `-${el.row.discount_percent}%` : ''
      }`,
    )
  }
}

steam()
  .then(() => process.exit(0))
  .catch(err => {
    Logger.getLogger('SteamMain').error('Error', err)
    process.exit(1)
  })
