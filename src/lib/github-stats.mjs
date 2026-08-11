/**
 * Shared GitHub stats fetcher.
 *
 * Used by:
 *  - scripts/generate-github-stats.js (build-time seed written to src/data/github-stats.json)
 *  - src/pages/api/github-stats.json.ts (SSR endpoint, edge cached for an hour)
 *
 * Counts come from the Link header trick: request one item per page and read
 * the `rel="last"` page number. That avoids paginating thousands of records.
 */

export const REPO = "catalystctl/catalyst";
export const REPO_URL = `https://github.com/${REPO}`;
const API = `https://api.github.com/repos/${REPO}`;

/** @param {string | undefined} token */
function headers(token) {
  /** @type {Record<string, string>} */
  const h = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "catalyst-website",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/**
 * Total item count for a paginated collection.
 * @param {string} url
 * @param {string | undefined} token
 * @returns {Promise<number | null>}
 */
async function countCollection(url, token) {
  const res = await fetch(url, { headers: headers(token) });
  if (!res.ok) return null;

  const link = res.headers.get("link");
  const last = link && /[?&]page=(\d+)>;\s*rel="last"/.exec(link);
  if (last) return Number(last[1]);

  // No Link header means a single page; count what came back.
  const body = await res.json();
  return Array.isArray(body) ? body.length : null;
}

/**
 * Latest CI conclusion for the default branch.
 * Prefers the newest completed run so an in-flight build does not read as failure.
 * @param {string | undefined} token
 */
async function fetchCiStatus(token) {
  const res = await fetch(
    `${API}/actions/runs?branch=main&per_page=20`,
    { headers: headers(token) },
  );
  if (!res.ok) return null;

  const data = await res.json();
  const runs = Array.isArray(data.workflow_runs) ? data.workflow_runs : [];
  if (runs.length === 0) return null;

  const completed = runs.find((r) => r.status === "completed");
  const running = runs.some((r) => r.status === "in_progress" || r.status === "queued");

  if (!completed) {
    return running
      ? { state: "running", label: "Running", url: `${REPO_URL}/actions`, workflow: runs[0]?.name ?? null }
      : null;
  }

  const passing = completed.conclusion === "success";
  return {
    state: running ? "running" : passing ? "passing" : "failing",
    label: running ? "Running" : passing ? "Passing" : "Failing",
    conclusion: completed.conclusion,
    workflow: completed.name ?? null,
    finishedAt: completed.updated_at ?? null,
    url: completed.html_url ?? `${REPO_URL}/actions`,
  };
}

/**
 * Fetch every stat we surface on the site.
 * Individual failures degrade to null rather than rejecting the whole payload.
 * @param {{ token?: string }} [options]
 */
export async function fetchGitHubStats(options = {}) {
  const { token } = options;

  const [commits, releases, contributors, ci, repo, latestRelease] = await Promise.all([
    countCollection(`${API}/commits?per_page=1&sha=main`, token).catch(() => null),
    countCollection(`${API}/releases?per_page=1`, token).catch(() => null),
    countCollection(`${API}/contributors?per_page=1&anon=1`, token).catch(() => null),
    fetchCiStatus(token).catch(() => null),
    fetch(API, { headers: headers(token) })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    fetch(`${API}/releases/latest`, { headers: headers(token) })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);

  return {
    repo: REPO,
    repoUrl: REPO_URL,
    commits,
    releases,
    contributors,
    stars: repo?.stargazers_count ?? null,
    forks: repo?.forks_count ?? null,
    lastPushedAt: repo?.pushed_at ?? null,
    latestRelease: latestRelease?.tag_name
      ? {
          tag: latestRelease.tag_name,
          publishedAt: latestRelease.published_at ?? null,
          url: latestRelease.html_url ?? `${REPO_URL}/releases/latest`,
        }
      : null,
    ci,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Compact display formatting: 840 stays 840, 1240 becomes 1.2k.
 * @param {number | null | undefined} n
 */
export function formatCount(n) {
  if (n === null || n === undefined) return null;
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return Math.round(n / 1000) + "k";
}
