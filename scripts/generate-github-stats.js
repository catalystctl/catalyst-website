#!/usr/bin/env node
/**
 * Writes src/data/github-stats.json at build time.
 *
 * This is the seed the page renders on first paint. The live values come from
 * /api/github-stats.json at runtime (edge cached hourly), so a stale seed only
 * ever shows for the moment before that request resolves.
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
    writeFileSync(OUT, JSON.stringify(stats, null, 2) + "\n");
    console.log(
      `✓ Generated github-stats.json (${stats.commits ?? "?"} commits, ${stats.releases ?? "?"} releases, ${stats.contributors ?? "?"} contributors, CI ${stats.ci?.state ?? "unknown"})`,
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
