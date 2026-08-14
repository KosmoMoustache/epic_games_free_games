import type { ProviderName } from '../types/types.ts'

/**
 * Contract every game provider (epic, steam, ...) must implement.
 * A provider is responsible for discovering free games, persisting them
 * to the database and notifying via webhook.
 */
export default abstract class GameProvider {
  abstract readonly name: ProviderName

  /**
   * Run the provider main script.
   * @returns true if a webhook was sent, false otherwise
   */
  abstract run(): Promise<boolean>
}
