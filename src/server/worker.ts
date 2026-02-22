import handler from "@tanstack/react-start/server-entry";

export default {
  fetch: handler.fetch,

  async scheduled(_event: ScheduledController, env: Env, _ctx: ExecutionContext) {
    console.log("Cron triggered:", _event.cron);
    console.log("Dispatching GitHub Actions workflow at:", new Date().toISOString());

    try {
      // Trigger GitHub Actions workflow via repository_dispatch
      // This requires a GitHub Personal Access Token with repo scope
      const response = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "scrape-matcha",
          client_payload: {
            triggered_at: new Date().toISOString(),
            cron_schedule: _event.cron,
          },
        }),
      });

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
