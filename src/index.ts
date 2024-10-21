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
  get('AXIOS_DEBUG') === 'true',
)

// TODO: Probably unnecessary, need to be tested
if (get('WEBHOOK_URL') === undefined) {
  logger.error("Environment variable 'WEBHOOK_URL' is missing")
  process.exit(1)
}

main(api, USE_CACHE)
