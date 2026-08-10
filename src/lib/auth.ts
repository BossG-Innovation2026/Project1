import { betterAuth } from "better-auth";
import { getDatabase, getEnvVar } from "@/lib/db";

let cachedAuth: ReturnType<typeof createAuth> | null = null;

function createAuth() {
  return betterAuth({
    database: getDatabase(),
    secret: getEnvVar("BETTER_AUTH_SECRET") ?? "dev-secret-change-in-production",
    baseURL: getEnvVar("BETTER_AUTH_URL") ?? "http://localhost:3000",
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "teacher",
          input: false,
        },
        permissions: {
          type: "string",
          required: true,
          defaultValue: "[]",
          input: false,
        },
        active: {
          type: "number",
          required: true,
          defaultValue: 1,
          input: false,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
    },
  });
}

export function getAuth() {
  if (!cachedAuth) cachedAuth = createAuth();
  return cachedAuth;
}
