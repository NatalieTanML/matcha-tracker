import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { generateTelegramLinkCode, getSession, getTelegramStatus, unlinkTelegram } from "@/server/auth";
import { getListings, toggleTracking } from "@/server/matcha";
import { getMyTrackedListings, updateNotificationMode } from "@/server/notifications";

// Auth queries
export const sessionQueryOptions = queryOptions({
  queryKey: ["auth", "session"],
  queryFn: () => getSession(),
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});

// Telegram queries
export const telegramStatusQueryOptions = queryOptions({
  queryKey: ["telegram", "status"],
  queryFn: () => getTelegramStatus(),
  staleTime: 60 * 1000,
});

export const telegramLinkCodeMutationOptions = mutationOptions({
  mutationFn: () => generateTelegramLinkCode(),
});

export const telegramUnlinkMutationOptions = mutationOptions({
  mutationFn: () => unlinkTelegram(),
});

// Matcha queries
export const listingsQueryOptions = queryOptions({
  queryKey: ["matcha", "listings"],
  queryFn: () => getListings(),
  staleTime: 60 * 1000,
  gcTime: 5 * 60 * 1000,
});

export const myTrackedListingsQueryOptions = queryOptions({
  queryKey: ["matcha", "tracked"],
  queryFn: () => getMyTrackedListings(),
  staleTime: 60 * 1000,
  gcTime: 10 * 60 * 1000,
});

export const toggleTrackingMutationOptions = mutationOptions({
  mutationFn: (listingId: string) => toggleTracking({ data: { listingId } }),
});

export const updateNotificationModeMutationOptions = mutationOptions({
  mutationFn: (data: { listingId: string; notificationMode: "none" | "individual" | "grouped" }) =>
    updateNotificationMode({ data }),
});
