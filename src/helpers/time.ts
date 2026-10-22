import { get } from '../services/env.ts'
import type { DiscordTimestampType } from '../types/types.ts'

export function dateToLocalString(date: Temporal.Instant | string) {
  const option = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  } as Intl.DateTimeFormatOptions

  return Temporal.Instant.from(date)
    .toZonedDateTimeISO(Temporal.Now.timeZoneId())
    .toLocaleString(get('LOCALES'), option)
}

export function getEpochMillis(date?: Temporal.Instant | string): number {
  const instant =
    date === undefined
      ? Temporal.Now.instant()
      : typeof date === 'string'
        ? Temporal.Instant.from(date)
        : date

  return instant.epochMilliseconds
}

/**
 * Format a date to a discord timestamp
 * @param date
 * @param type
 * @returns
 */
export function discordTimestamp(
  date: Temporal.Instant,
  type: DiscordTimestampType,
): `<t:${number}:${DiscordTimestampType}>` {
  return `<t:${Math.floor(date.epochMilliseconds / 1000)}:${type}>`
}
