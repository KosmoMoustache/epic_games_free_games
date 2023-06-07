import { AxiosResponse } from 'axios';
import { readFileSync } from 'fs';
import logger from './logger';
import type API from './controller/API';
import { freeGamesPromotions } from './types';

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
    // Get from cache
    return {
      data: JSON.parse(readFileSync('./src/freeGamesPromotions.json', 'utf-8')),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as AxiosResponse<freeGamesPromotions, any>;
  } else {
    // Get games from api
    const result = await api.fetch<freeGamesPromotions>();
    if (result.status != 200) {
      logger.error('Error when fetching data', result);
      throw new Error('Error when fetching data');
    }
    return result;
  }
}
