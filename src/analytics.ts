/**
 * In Vite, environment variables are accessed via import.meta.env.
 * Only variables prefixed with VITE_ are exposed to your client-side code.
 */
const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_API_KEY;

/**
 * Loads PostHog in a separate chunk so it doesn't block the initial render.
 */
export async function initAnalytics(): Promise<void> {
  if (!POSTHOG_API_KEY) {
    // This will show up in dev if you haven't set up your .env file
    console.debug("VITE_POSTHOG_API_KEY is not defined");
    return;
  }

  const { default: posthog } = await import("posthog-js");
  posthog.init(POSTHOG_API_KEY, {
    api_host: "https://eu.i.posthog.com",
    defaults: "2025-11-30",
    cookieless_mode: "always",
  });
}

/**
 * Starts analytics once the page has loaded and the browser is idle.
 */
export function scheduleAnalytics(): void {
  const start = () => {
    initAnalytics().catch((err) => console.debug("Analytics failed to load", err));
  };
  const whenIdle = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(start, { timeout: 3000 });
    } else {
      setTimeout(start, 1);
    }
  };

  if (document.readyState === "complete") {
    whenIdle();
  } else {
    window.addEventListener("load", whenIdle, { once: true });
  }
}
