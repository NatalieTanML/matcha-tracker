import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Navbar } from "@/components/navbar";
import { sessionQueryOptions } from "@/lib/query-options";
import appCss from "../global.css?url";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Matcha Drop" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
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
