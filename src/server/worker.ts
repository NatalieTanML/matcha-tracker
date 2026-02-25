import handler from "@tanstack/react-start/server-entry";
import { and, eq, gt } from "drizzle-orm";
import { createDb } from "@/db";
import { telegramLinkCodes, users } from "@/db/schema";

async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
}

async function handleTelegramWebhook(request: Request, _env: Env, _ctx: ExecutionContext) {
  const botToken = _env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN not set");
    return;
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    console.error("Failed to parse Telegram update");
    return;
  }

  const message = update.message;
  if (!message?.text) return;

  const chatId = String(message.chat.id);
  const text = message.text.trim();

  // Command: /link <CODE>
  const linkMatch = text.match(/^\/link\s+([A-Z0-9]{8})$/i);
  if (!linkMatch) {
    await sendTelegramMessage(
      botToken,
      chatId,
      "Send <code>/link YOUR_CODE</code> to link your account.\n\nGet your code from your profile page on Matcha Tracker.",
    );
    return;
  }

  const code = linkMatch[1].toUpperCase();
  const db = createDb(_env.DATABASE_URL);

  const linkCode = await db.query.telegramLinkCodes.findFirst({
    where: and(eq(telegramLinkCodes.code, code), gt(telegramLinkCodes.expiresAt, new Date())),
  });

  if (!linkCode) {
    await sendTelegramMessage(
      botToken,
      chatId,
      "That code is invalid or expired. Please generate a new one from your profile page.",
    );
    return;
  }

  // Store the chat_id on the user
  await db.update(users).set({ telegramChatId: chatId }).where(eq(users.id, linkCode.userId));

  // Delete the used code (one-time use)
  await db.delete(telegramLinkCodes).where(eq(telegramLinkCodes.code, code));

  await sendTelegramMessage(
    botToken,
    chatId,
    "Linked! You'll now receive stock alerts for your tracked matcha listings.",
  );
}

export default {
  async fetch(request: Request, _env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Telegram bot webhook — handled before TanStack Start
    if (url.pathname === "/api/telegram/webhook" && request.method === "POST") {
      ctx.waitUntil(handleTelegramWebhook(request.clone() as Request, _env, ctx));
      return new Response("OK", { status: 200 });
    }

    // Everything else (including /api/auth/*) goes through TanStack Start
    // @ts-expect-error - TanStack handler expects standard Request, not Cloudflare Request
    return handler.fetch(request as Request, { context: { env: _env, ctx } });
  },

  async scheduled(_event: ScheduledController, env: Env, _ctx: ExecutionContext) {
    console.log("Cron triggered:", _event.cron);
    console.log("Dispatching GitHub Actions workflow at:", new Date().toISOString());

    try {
      const response = await fetch(
        `https://api.github.com/repos/${env.GITHUB_REPO}/actions/workflows/scrape.yml/dispatches`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
            "User-Agent": "matcha-tracker",
          },
          body: JSON.stringify({ ref: "main" }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("GitHub API error:", response.status, errorText);
        throw new Error(`GitHub API returned ${response.status}: ${errorText}`);
      }

      console.log("Successfully dispatched GitHub Actions workflow");
    } catch (error) {
      console.error("Failed to dispatch GitHub Actions workflow:", error);
      throw error;
    }
  },
};
