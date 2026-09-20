import axios from 'axios'
import Database from './controller/Database.ts'
import EpicProvider from './providers/epic/EpicProvider.ts'
import type GameProvider from './providers/GameProvider.ts'
import SteamProvider from './providers/steam/SteamProvider.ts'
import { get } from './services/env.ts'
import Logger from './services/logger.ts'

const logger = Logger.getLogger('FreeGameNotifier')

const providers: GameProvider[] = [new EpicProvider(), new SteamProvider()]

const db = new Database(Database.open())

if (get('NODE_ENV') === 'development') {
  await db.logQueryAll()
}

Promise.all(providers.map(provider => provider.run(db)))
  .then(async results => {
    const uptime_url = get('UPTIME_URL')
    if (uptime_url !== undefined) {
      const url = new URL(uptime_url)
      const message = providers
        .map(
          (provider, index) =>
            `${provider.name.toUpperCase()} ${
              results[index] ? 'SEND' : 'NOSEND'
            }`,
        )
        .join(' ')
      url.searchParams.set('msg', `OK ${message}`)
      await axios
        .get(url.toString())
        .then(r => logger.info(`UPTIME response: ${r.status}`))
        .catch(e => logger.error('Error when fetching the uptime url', e))
    }
  })
  .finally(() => db.db.close())
