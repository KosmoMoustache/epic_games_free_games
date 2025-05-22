import type { DiscordTimestampType } from '../types/types.ts'

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
export function getUnixTimestamp(date?: Date): number {
  const dateObj = date ? new Date(date) : new Date()
  return Math.floor(dateObj.getTime() / 1000)
}

/**
 * Format a date to a discord timestamp
 * @param date
 * @param type
 * @returns
 */
export function discordTimestamp(
  date: Date,
  type: DiscordTimestampType,
): `<t:${number}:${DiscordTimestampType}>` {
  return `<t:${date.getTime() / 1000}:${type}>`
}
