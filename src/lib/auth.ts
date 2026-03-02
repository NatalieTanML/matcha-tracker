import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, magicLink } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { MagicLinkEmail } from "@/components/emails";
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
  RESEND_API_KEY?: string;
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
      enabled: false,
    },

    plugins: [
      admin({
        adminUserIds: env.ADMIN_USER_ID ? [env.ADMIN_USER_ID] : [],
        defaultRole: "user",
      }),
      magicLink({
        expiresIn: 60 * 5,
        rateLimit: {
          window: 60,
          max: 5,
        },
        sendMagicLink: async ({ email, url }) => {
          const resend = new Resend(env.RESEND_API_KEY);

          const user = await db.query.users.findFirst({
            where: eq(schema.users.email, email),
          });

          const { error } = await resend.emails.send({
            from: "matchadrop.fyi <noreply@matchadrop.fyi>",
            to: email,
            subject: "Your magic link to sign in",
            react: MagicLinkEmail({ url, name: user?.name, expiresInMinutes: 5 }),
          });

          if (error) {
            console.error("Failed to send email:", error);
            throw new Error(`Failed to send magic link email: ${error.message}`);
          }
        },
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
