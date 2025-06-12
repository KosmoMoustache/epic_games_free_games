import type Database from '../controller/Database.ts'
import type Logger from '../services/logger.ts'

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

export async function debugDatabase(db: Database, logger: Logger) {
  await db.query.getAll().then(res => {
    logger.table(res)
  })
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
