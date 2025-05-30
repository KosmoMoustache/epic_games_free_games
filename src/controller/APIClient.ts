import axios from 'axios'
import logger from '../services/logger.ts'

export interface ApiRequestParams {
  locale: `${string}-${string}`
  country: string
  allowCountries: string
}

export default class APIClient {
  static logger = logger.getLogger('APIClient')
  url: string
  request_param: ApiRequestParams
  constructor(url: string, request_param: ApiRequestParams, debug: boolean) {
    this.url = url
    this.request_param = request_param

    if (debug) {
      axios.interceptors.request.use(request => {
        APIClient.logger.info('Request:', request.url)
        APIClient.logger.debug('Request data', request)
        return request
      })
    }
  }

  async fetch<T>() {
    return await axios.get<T>(this.url.toString(), {
      params: this.request_param,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
