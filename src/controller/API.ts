import axios from 'axios'
import logger from '../logger.js'

export interface AxiosRequestData {
  locale: `${string}-${string}`
  country: string
  allowCountries: string
}

export default class API {
  url: string
  request_data: AxiosRequestData
  constructor(url: string, request_data: AxiosRequestData, debug: boolean) {
    this.url = url
    this.request_data = request_data

    if (debug) {
      axios.interceptors.request.use(request => {
        logger.info('Starting Request', request.url)
        logger.debug('Request data', request)
        return request
      })
    }
  }

  async fetch<T>() {
    return await axios.get<T>(this.url.toString(), {
      data: this.request_data,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
