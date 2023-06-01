import axios from 'axios';
import { AxiosRequestData } from './types/api';

export default class API {
  url: URL;
  request_data: AxiosRequestData;
  constructor(url: URL, request_data: AxiosRequestData) {
    this.url = url;
    this.request_data = request_data;
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
