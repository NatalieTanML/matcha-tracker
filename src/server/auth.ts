import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { createDb } from "@/db";
import { telegramLinkCodes, users } from "@/db/schema";
import { type Auth, createAuth } from "@/lib/auth";

// ─── Session ─────────────────────────────────────────────────────────────────

export const getSession = createServerFn({ method: "GET" }).handler(async (): ReturnType<Auth["api"]["getSession"]> => {
  const headers = getRequestHeaders();
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers });
  return session;
});

// ─── Telegram: generate a link code ──────────────────────────────────────────

export const generateTelegramLinkCode = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ code: string; expiresAt: Date }> => {
    const headers = getRequestHeaders();
    const auth = createAuth(env);
    const session = await auth.api.getSession({ headers });

    if (!session) throw new Error("Unauthorized");

    const db = createDb(env.DATABASE_URL);

    // Generate a random 8-char alphanumeric code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
    const code = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map((b) => chars[b % chars.length])
      .join("");

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing codes for this user
    await db.delete(telegramLinkCodes).where(eq(telegramLinkCodes.userId, session.user.id));

    await db.insert(telegramLinkCodes).values({
      code,
      userId: session.user.id,
      expiresAt,
    });

    return { code, expiresAt };
  },
);

// ─── Telegram: unlink ────────────────────────────────────────────────────────

export const unlinkTelegram = createServerFn({ method: "POST" }).handler(async (): Promise<{ success: true }> => {
  const headers = getRequestHeaders();
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers });

  if (!session) throw new Error("Unauthorized");

  const db = createDb(env.DATABASE_URL);

  await db.update(users).set({ telegramChatId: null }).where(eq(users.id, session.user.id));

  return { success: true };
});

// ─── Telegram: get current link status ───────────────────────────────────────

export const getTelegramStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ telegramChatId: string | null }> => {
    const headers = getRequestHeaders();
    const auth = createAuth(env);
    const session = await auth.api.getSession({ headers });

    if (!session) throw new Error("Unauthorized");

    const db = createDb(env.DATABASE_URL);
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    return { telegramChatId: user?.telegramChatId ?? null };
  },
);
