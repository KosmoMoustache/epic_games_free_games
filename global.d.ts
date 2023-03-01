declare global {
  declare namespace NodeJS {
    interface ProcessEnv {
      WEBHOOK_URL: string;
      DEV: boolean;
      AXIOS_DEV: boolean;
    }
  }
}

export {};
