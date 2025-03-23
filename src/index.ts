import axios from 'axios'
import API from './controller/API.js'
import { get } from './env.js'
import logger from './logger.js'
import main from './main.js'

const USE_CACHE = false

const api_endpoint =
  'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions'

const api = new API(
  api_endpoint,
  {
    locale: 'fr-FR',
    country: 'FR',
    allowCountries: 'FR',
  },
  get('LOG_LEVEL') === 'debug',
)


main(api, USE_CACHE).then(async result => {
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
