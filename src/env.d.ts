import "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL?: string;
  }
}

export {};