import axios from 'axios'
import type { z } from 'zod'
import Logger from '../services/logger.ts'

export type FetcherParams = Record<
  string,
  string | number | boolean | undefined
>

/**
 * Base fetcher shared by game providers. Provides a typed HTTP GET that
 * validates the response against an optional zod schema.
 */
export default abstract class Fetcher {
  protected readonly logger: Logger
  protected readonly headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0',
  }

  constructor(logger_name = 'Fetcher') {
    this.logger = Logger.getLogger(logger_name)
  }

  protected async get(url: string, params?: FetcherParams): Promise<unknown> {
    const config = { url, params, headers: this.headers }
    this.logger.debug('Fetching', axios.getUri(config))
    const { data } = await axios.get<unknown>(url, config)
    return data
  }

  protected async getAndParse<TSchema extends z.ZodType>(
    url: string,
    schema: TSchema,
    params?: FetcherParams,
  ): Promise<z.infer<TSchema>> {
    return schema.parse(await this.get(url, params))
  }
}
