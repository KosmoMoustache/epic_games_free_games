import axios from 'axios';
import logger from '../logger';

export interface AxiosRequestData {
  locale: `${string}-${string}`;
  country: string;
  allowCountries: string;
}

export default class API {
  url: string;
  request_data: AxiosRequestData;
  constructor(url: string, request_data: AxiosRequestData, debug: boolean) {
    this.url = url;
    this.request_data = request_data;

    if (debug) {
      axios.interceptors.request.use((request) => {
        logger.log('Starting Request', JSON.stringify(request, null, 2));
        return request;
      });
    }
  }

  async fetch<T>() {
    return await axios.get<T>(this.url.toString(), {
      data: this.request_data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
