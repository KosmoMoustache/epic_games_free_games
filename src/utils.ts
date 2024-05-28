import type { AxiosResponse } from 'axios';
import { readFileSync, writeFileSync } from 'node:fs';
import logger from './logger';
import type API from './controller/API';
import type { DiscordTimestampType, freeGamesPromotions } from './types';
import DB from './controller/Database';

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
  object: T
): Pick<T, K> {
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => keys.includes(key as K))
  ) as Pick<T, K>;
}

export function dateToLocalString(date: Date | string) {
  const option = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  } as Intl.DateTimeFormatOptions;

  return new Date(date).toLocaleDateString('fr-FR', option);
}

export async function getApiResult(api: API, use_cache = true) {
  if (use_cache) {
    const data = JSON.parse(readFileSync('./src/freeGamesPromotions.json', 'utf-8'));
    // Create cache file if not exist
    if (!data) writeFileSync('./src/freeGamesPromotions.json', JSON.stringify(getApiResult(api, false)));

    return {
      data: JSON.parse(readFileSync('./src/freeGamesPromotions.json', 'utf-8')),
    } as unknown as AxiosResponse<freeGamesPromotions>;
  }

  // Get games from api
  const result = await api.fetch<freeGamesPromotions>();
  if (result.status !== 200) {
    logger.error('Error when fetching data', result);
    throw new Error('Error when fetching data');
  }
  return result;
}

export function discordTimestamp(
  date: Date,
  type: DiscordTimestampType
): `<t:${number}:${DiscordTimestampType}>` {
  return `<t:${date.getTime() / 1000}:${type}>`;
}


export function debugDatabase(db: DB) {
  db.published.getAll().then((res) => {
    logger.table('Published', res);
  });
}