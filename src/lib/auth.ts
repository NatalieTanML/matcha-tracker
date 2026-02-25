import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { createDb } from "@/db";
import * as schema from "@/db/schema";

// Must be a factory function — NOT a top-level singleton.
// Cloudflare Workers env vars aren't available at module initialisation time,
// only when a request is being handled.
export function createAuth(env: {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  ADMIN_USER_ID?: string;
}) {
  const db = createDb(env.DATABASE_URL);

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,

    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },

    plugins: [
      admin({
        adminUserIds: env.ADMIN_USER_ID ? [env.ADMIN_USER_ID] : [],
        defaultRole: "user",
      }),
      // Must be the LAST plugin — handles cookie-setting for TanStack Start server fns
      tanstackStartCookies(),
    ],

    user: {
      additionalFields: {
        telegramChatId: {
          type: "string",
          required: false,
          input: false,
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
