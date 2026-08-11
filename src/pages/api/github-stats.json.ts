import type { APIRoute } from "astro";
import { fetchGitHubStats } from "../../lib/github-stats.mjs";
import seed from "../../data/github-stats.json";

// Runs on the Worker, not prerendered: the whole point is fresh numbers.
export const prerender = false;

/** Browsers revalidate after 5 minutes, the edge holds a copy for an hour. */
const BROWSER_TTL = 300;
const EDGE_TTL = 3600;

function payloadResponse(body: unknown, cacheable: boolean) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheable
        ? `public, max-age=${BROWSER_TTL}, s-maxage=${EDGE_TTL}, stale-while-revalidate=${EDGE_TTL}`
        : "public, max-age=60",
      "access-control-allow-origin": "*",
    },
  });
}

export const GET: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as { runtime?: { env?: Record<string, string>; ctx?: { waitUntil?: (p: Promise<unknown>) => void } } }).runtime;
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;

  // Normalize the cache key so query strings (cache busters) share one entry.
  const cacheUrl = new URL(request.url);
  cacheUrl.search = "";
  const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  try {
    const stats = await fetchGitHubStats({ token: runtime?.env?.GITHUB_TOKEN });
    
    // If we got nulls back (rate limit or API error), merge with the seed so we serve *something*.
    const merged = {
      ...stats,
      commits: stats.commits ?? seed.commits,
      releases: stats.releases ?? seed.releases,
      contributors: stats.contributors ?? seed.contributors,
      stars: stats.stars ?? seed.stars,
      forks: stats.forks ?? seed.forks,
      lastPushedAt: stats.lastPushedAt ?? seed.lastPushedAt,
      latestRelease: stats.latestRelease ?? seed.latestRelease,
      ci: stats.ci ?? seed.ci,
    };
    
    const response = payloadResponse(merged, true);

    if (cache) {
      const store = cache.put(cacheKey, response.clone());
      if (runtime?.ctx?.waitUntil) runtime.ctx.waitUntil(store);
      else await store;
    }

    return response;
  } catch {
    // Complete failure: serve the build-time seed, flagged stale.
    return payloadResponse({ ...seed, stale: true }, false);
  }
};
