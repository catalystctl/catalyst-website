import type { APIRoute } from "astro";
import { env as workerEnv } from "cloudflare:workers";
import { fetchGitHubStats } from "../../lib/github-stats.mjs";
import seed from "../../data/github-stats.json";

// Runs on the Worker (never prerendered). Numbers are fetched and cached at the
// edge, so the site stays current without a rebuild, a deploy, or a scheduled
// CI job.
export const prerender = false;

/** Browsers may reuse a copy for five minutes. */
const BROWSER_TTL = 300;
/** Serve from the edge cache until it is this old, then refresh in the background. */
const FRESH_MS = 55 * 60 * 1000;
/** Keep the last good payload at the edge for a week so a failure never empties the widget. */
const EDGE_TTL = 60 * 60 * 24 * 7;

type Stats = Record<string, any>;

const FIELDS = ["commits", "releases", "contributors", "stars", "forks", "lastPushedAt", "latestRelease", "ci"];

/** Fall back to the committed seed for any field GitHub did not return. */
function withSeed(stats: Stats): Stats {
  const merged: Stats = { ...stats };
  for (const key of FIELDS) {
    if (stats[key] === null || stats[key] === undefined) merged[key] = (seed as Stats)[key];
  }
  // Never advertise a CI badge for a workflow that is not product CI.
  const seededCi = (seed as Stats).ci;
  if (stats.ci === null && seededCi && seededCi.workflow && !/^(ci|build|test|deploy)([^a-z]|$)/i.test(seededCi.workflow)) {
    merged.ci = null;
  }
  return merged;
}

function isFresh(payload: Stats): boolean {
  const at = Date.parse(String(payload.fetchedAt ?? ""));
  return Number.isFinite(at) && Date.now() - at < FRESH_MS;
}

function json(body: unknown, cacheable: boolean): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheable
        ? `public, max-age=${BROWSER_TTL}, s-maxage=${FRESH_MS / 1000}, stale-while-revalidate=${FRESH_MS / 1000}`
        : "public, max-age=60",
      "access-control-allow-origin": "*",
    },
  });
}

// One in-flight refresh per isolate so a burst of requests makes a single call.
let inflight: Promise<Stats | null> | null = null;

async function refresh(cache: Cache | undefined, key: Request, token?: string): Promise<Stats | null> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const stats = (await fetchGitHubStats({ token })) as Stats;
      const usable = FIELDS.some((field) => stats[field] !== null && stats[field] !== undefined);
      if (!usable) return null;
      const payload: Stats = { ...withSeed(stats), stale: false };
      if (cache) {
        await cache.put(
          key,
          new Response(JSON.stringify(payload), {
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": `max-age=${EDGE_TTL}`,
            },
          }),
        );
      }
      return payload;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export const GET: APIRoute = async ({ request, locals }) => {
  // Astro v6 removed `locals.runtime.env`; bindings come from `cloudflare:workers`
  // and the execution context is `locals.runtime.cfContext`.
  const runtime = (locals as { runtime?: { cfContext?: { waitUntil?: (p: Promise<unknown>) => void } } }).runtime;
  const token = (workerEnv as Record<string, string | undefined> | undefined)?.GITHUB_TOKEN;
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;

  // Normalize the cache key so query-string cache busters share one entry.
  const cacheUrl = new URL(request.url);
  cacheUrl.search = "";
  const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });

  let cached: Stats | null = null;
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) {
      try {
        cached = (await hit.json()) as Stats;
      } catch {
        cached = null;
      }
    }
  }

  if (cached && isFresh(cached)) return json(cached, true);

  if (cached) {
    // Stale: answer immediately and refresh GitHub in the background.
    const task = refresh(cache, cacheKey, token);
    if (runtime?.cfContext?.waitUntil) runtime.cfContext.waitUntil(task);
    else await task;
    return json({ ...cached, stale: true }, true);
  }

  // Cold cache: pay for one fetch, or fall back to the build-time seed.
  const fresh = await refresh(cache, cacheKey, token);
  return json(fresh ?? { ...withSeed(seed as Stats), stale: true }, Boolean(fresh));
};
