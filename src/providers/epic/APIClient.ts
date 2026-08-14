import axios from 'axios'
import type { z } from 'zod'
import Logger from '../../services/logger.ts'

export type ApiRequestParams = {
  locale: `${string}-${string}`
  country: string
  allowCountries: string
}

/**
 * Type safe API client. The response of the HTTP call is validated against
 * the given zod schema, so the returned data is guaranteed to match the
 * inferred type (or throws a `ZodError`).
 */
export default class APIClient<TSchema extends z.ZodType> {
  static logger = Logger.getLogger('APIClient')
  #url: string
  #request_params: ApiRequestParams
  #schema: TSchema

  constructor(
    url: string,
    request_param: ApiRequestParams,
    schema: TSchema,
    debug = false,
  ) {
    this.#url = url
    this.#request_params = request_param
    this.#schema = schema

    if (debug) {
      axios.interceptors.request.use(request => {
        APIClient.logger.info('Request:', request.url)
        APIClient.logger.debug('Request data', request)
        return request
      })
    }
  }

  async fetch(): Promise<z.infer<TSchema>> {
    const response = await axios.get<unknown>(this.#url, {
      params: this.#request_params,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return this.#schema.parse(response.data)
  }
}
