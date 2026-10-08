#!/usr/bin/env node
/**
 * Writes src/data/github-stats.json at build time.
 *
 * The site renders this build-time snapshot. The API endpoint is available
 * separately; the page does not request it automatically.
 *
 * Never fails the build: on API errors it keeps any existing seed, or writes an
 * empty payload so imports stay valid.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchGitHubStats, REPO, REPO_URL } from "../src/lib/github-stats.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "src", "data");
const OUT = join(DATA_DIR, "github-stats.json");

const EMPTY = {
  repo: REPO,
  repoUrl: REPO_URL,
  commits: null,
  releases: null,
  contributors: null,
  stars: null,
  forks: null,
  lastPushedAt: null,
  latestRelease: null,
  ci: null,
  fetchedAt: null,
};

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  try {
    const stats = await fetchGitHubStats({
      token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
    });
    let previous = EMPTY;
    if (existsSync(OUT)) {
      try { previous = { ...EMPTY, ...JSON.parse(readFileSync(OUT, "utf8")) }; } catch { /* invalid seed */ }
    }
    const fields = ["commits", "releases", "contributors", "stars", "forks", "lastPushedAt", "latestRelease", "ci"];
    const usable = fields.some((key) => stats[key] !== null && stats[key] !== undefined);
    if (!usable && existsSync(OUT)) {
      console.warn("! GitHub API unavailable; retaining the previous stats snapshot");
      return;
    }
    const merged = { ...previous, ...stats };
    for (const key of fields) if (stats[key] === null || stats[key] === undefined) merged[key] = previous[key];
    if (!usable) merged.fetchedAt = previous.fetchedAt;
    if (stats.ci === null && previous.ci?.workflow && !/^(ci|build|test|deploy)(\b|\s|$)/i.test(previous.ci.workflow)) merged.ci = null;
    writeFileSync(OUT, JSON.stringify(merged, null, 2) + "\n");
    console.log(
      `✓ Generated github-stats.json (${merged.commits ?? "?"} commits, ${merged.releases ?? "?"} releases, ${merged.contributors ?? "?"} contributors, CI ${merged.ci?.state ?? "unknown"})`,
    );
    return;
  } catch (err) {
    console.warn(`! GitHub stats fetch failed: ${err instanceof Error ? err.message : err}`);
  }

  if (existsSync(OUT)) {
    try {
      JSON.parse(readFileSync(OUT, "utf8"));
      console.log("✓ Kept existing github-stats.json seed");
      return;
    } catch {
      /* fall through and rewrite */
    }
  }

  writeFileSync(OUT, JSON.stringify(EMPTY, null, 2) + "\n");
  console.log("✓ Wrote empty github-stats.json seed");
}

await main();
