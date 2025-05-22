import axios from 'axios'
import APIClient from './controller/API.ts'
import main from './main.ts'
import { get } from './services/env.ts'
import Logger from './services/logger.ts'

export const logger = new Logger()

const api_endpoint =
  'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions'

const api = new APIClient(
  api_endpoint,
  {
    locale: 'fr-FR',
    country: 'FR',
    allowCountries: 'FR',
  },
  get('LOG_LEVEL') === 'debug',
)

main(api, get('USE_CACHE')).then(async result => {
  const uptime_url = get('UPTIME_URL')
  if (uptime_url !== undefined) {
    const url = new URL(uptime_url)
    url.searchParams.set('msg', `OK ${result ? 'SEND' : 'NOSEND'}`)
    await axios
      .get(url.toString())
      .then(r => logger.info(`UPTIME response: ${r.status}`))
      .catch(e => logger.error(e))
  }
})
