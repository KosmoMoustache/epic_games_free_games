import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { PathLike } from 'fs';
import { readFile, writeFile } from 'fs/promises';

interface API_Data {
  locale: `${string}-${string}`;
  country: string;
  allowCountries: string;
}

export type ResponseCached<T> = {
  data: T;
  status: 200;
  statusText: 'Cached';
  headers: null;
  config: null;
  request: null;
  cachedAt: string;
};
type RawFetchParams = {
  headers?: AxiosRequestConfig['headers'];
  cacheFile?: PathLike;
  write?: PathLike;
};
type FetchParams<Cached = false> = Cached extends true
  ? RawFetchParams
  : Omit<RawFetchParams, 'cacheFile'>;

export default class API {
  url: string;
  data: Partial<API_Data>;

  constructor(api_url: string, api_data: Partial<API_Data>) {
    this.url = api_url;
    this.data = api_data;
  }

  /**
   * Performs a GET request using the axios library.
   * @param headers [headers={'Content-Type': 'application/json'}] - An optional object representing the headers to be sent with the request.
   * Default value: `{'Content-Type': 'application/json'}` (This will be overrides if you provide a `headers` parameter)
   * @param cacheFile return the data from the given path instead of making axios fetch
   * @param write write the axios response to the given path
   */
  fetch<T>(): Promise<AxiosResponse<T>>;
  fetch<T>({ cacheFile }: FetchParams<true>): Promise<ResponseCached<T>>;
  fetch<T>({ write }: FetchParams<false>): Promise<AxiosResponse<T>>;
  fetch<T>(params?: FetchParams): Promise<AxiosResponse<T> | ResponseCached<T>>;
  async fetch<T>({ headers, cacheFile, write }: FetchParams<true> = {}) {
    if (cacheFile) {
      const data = JSON.parse(await readFile(cacheFile, { encoding: 'utf8' }));
      return {
        data: data.data as T,
        status: 200,
        statusText: 'Cached',
        headers: null,
        config: null,
        request: null,
        cachedAt: data.cachedAt,
      } as ResponseCached<T>;
    }
    if (write) {
      const data = await this._fetch<T>(headers);
      await writeFile(
        write,
        JSON.stringify({
          data: data.data,
          cachedAt: Date.now().toString(),
        })
      );
      return data;
    }
    return this._fetch<T>(headers);
  }

  private async _fetch<T>(headers?: AxiosRequestConfig['headers']) {
    return await axios.get<T>(this.url, {
      data: this.data,
      headers: headers || {
        'Content-Type': 'application/json',
      },
    });
  }
}
