import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Navbar } from "@/components/navbar";
import { sessionQueryOptions } from "@/lib/query-options";
import appCss from "../global.css?url";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

interface RouterContext {
  queryClient: QueryClient;
}

const SITE_URL = "https://matchadrop.fyi";
const SITE_NAME = "matchadrop.fyi";
const DEFAULT_DESCRIPTION = "Get real-time matcha restock notifications. Never miss a matcha restock again.";

export const Route = createRootRouteWithContext<RouterContext>()({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "matchadrop.fyi | real-time matcha restock notifications." },
      { name: "description", content: DEFAULT_DESCRIPTION },
      { name: "author", content: SITE_NAME },
      { name: "theme-color", content: "#e5edda" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "matchadrop.fyi | real-time matcha restock notifications." },
      { property: "og:description", content: DEFAULT_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/logo512.png` },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: SITE_URL },
    ],
  }),

  // Prefetch session on initial load, but don't block
  beforeLoad: async ({ context }) => {
    context.queryClient.prefetchQuery(sessionQueryOptions);
  },

  component: RootDocument,
});

function RootDocument() {
  const { data: session } = useSuspenseQuery(sessionQueryOptions);
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Navbar session={session ?? null} />
        <Outlet />
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }, TanStackQueryDevtools]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6 px-6 text-center">
      <p className="text-7xl font-bold text-sprout-300 select-none">404</p>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">This page doesn't exist or has been moved.</p>
      </div>
      <Link to="/" className="text-sm text-sprout-400 hover:underline">
        Back to home
      </Link>
    </main>
  );
}
