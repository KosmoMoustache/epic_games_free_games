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

export function date(date: Date | string) {
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
