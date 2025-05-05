import { readFileSync, writeFileSync } from 'node:fs'
import type { AxiosResponse } from 'axios'
import type API from './controller/API.ts'
import type DB from './controller/Database.ts'
import logger from './logger.ts'
import type {
  DiscordTimestampType,
  freeGamesPromotions,
} from './types/index.ts'

/**
 *
 * @param keys
 * @param object
 * @example
 * const object = {
 *  startDate: '2021-01-01',
 *  endDate: '2021-01-01',
 *  foo: 'bar',
 *  key: 'value'
 * }
 * selectKeys(
 *  ['startDate', 'endDate'],
 *  object
 * ); -> { startDate: '2021-01-01', endDate: '2021-01-01' }
 */
export function selectKeys<T extends object, K extends keyof T>(
  keys: K[],
  object: T,
): Pick<T, K> {
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => keys.includes(key as K)),
  ) as Pick<T, K>
}

export function dateToLocalString(date: Date | string) {
  const option = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  } as Intl.DateTimeFormatOptions

  return new Date(date).toLocaleDateString('fr-FR', option)
}
/**
 * Get a unix timestamp for the current date or a given date
 * @param date
 * @returns
 */
export function getUnixTimestamp(date?: Date): string {
  const dateObj = date ? new Date(date) : new Date()
  const unixTimestamp = Math.floor(dateObj.getTime() / 1000)
  return unixTimestamp.toString()
}

export async function getApiResult(api: API, use_cache = true) {
  if (use_cache) {
    try {
      readFileSync('./freeGamesPromotions.json', 'utf-8')
    } catch (error) {
      logger.info('Cache file not found, creating it', error)
      const r = (await getApiResult(api, false)).data
      writeFileSync('./freeGamesPromotions.json', JSON.stringify(r))
    }

    return {
      data: JSON.parse(readFileSync('./freeGamesPromotions.json', 'utf-8')),
    } as unknown as AxiosResponse<freeGamesPromotions>
  }

  // Get games from api
  const result = await api.fetch<freeGamesPromotions>()
  if (result.status !== 200) {
    logger.error('Error when fetching data', result)
    throw new Error('Error when fetching data')
  }
  return result
}

export function discordTimestamp(
  date: Date,
  type: DiscordTimestampType,
): `<t:${number}:${DiscordTimestampType}>` {
  return `<t:${date.getTime() / 1000}:${type}>`
}

export function debugDatabase(db: DB) {
  db.published.getAll().then(res => {
    logger.table('Published', res)
  })
}
