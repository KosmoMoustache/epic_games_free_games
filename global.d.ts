declare global {
  interface ProcessEnv {
    WEBHOOK_URL: string;
    DEV: boolean;
    AXIOS_DEV: boolean;
  }
}

export {};
