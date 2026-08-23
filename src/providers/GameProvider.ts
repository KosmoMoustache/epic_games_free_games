import type DB from '../controller/Database.ts'
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
   * @param db Shared database connection
   * @returns true if a webhook was sent, false otherwise
   */
  abstract run(db: DB): Promise<boolean>
}
