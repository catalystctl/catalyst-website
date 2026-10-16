#!/usr/bin/env node
/**
 * Writes src/data/templates.json at build time.
 *
 * The templates page fetches the live catalog from GitHub and edge-caches it,
 * but this committed snapshot is what the page falls back to when GitHub is
 * unreachable and what the API route serves on a cold cache. Keeping it in the
 * repo means the site still renders a real catalog during a GitHub outage or an
 * offline `astro dev`.
 *
 * Never fails the build: on errors it keeps any existing seed, or writes an
 * empty payload so imports stay valid.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchTemplates, REPO, REPO_URL } from "../src/lib/templates.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "src", "data");
const OUT = join(DATA_DIR, "templates.json");

const EMPTY = {
  schemaVersion: 1,
  repo: REPO,
  repoUrl: REPO_URL,
  updatedAt: null,
  discovered: 0,
  templates: [],
};

function readSeed() {
  if (!existsSync(OUT)) return EMPTY;
  try {
    const parsed = JSON.parse(readFileSync(OUT, "utf8"));
    return { ...EMPTY, ...parsed, templates: Array.isArray(parsed.templates) ? parsed.templates : [] };
  } catch {
    return EMPTY;
  }
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  try {
    const catalog = await fetchTemplates({
      token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
    });

    if (catalog.templates.length === 0) {
      const previous = readSeed();
      if (previous.templates.length > 0) {
        console.warn("! No templates returned; retaining the previous catalog snapshot");
        return;
      }
      console.warn("! No templates returned and no previous snapshot; writing an empty catalog");
    }

    writeFileSync(OUT, JSON.stringify(catalog, null, 2) + "\n");
    console.log(
      `✓ Generated templates.json (${catalog.templates.length} template${catalog.templates.length === 1 ? "" : "s"} across ${new Set(catalog.templates.map((t) => t.category)).size} categories)`,
    );
    return;
  } catch (err) {
    console.warn(`! Template catalog fetch failed: ${err instanceof Error ? err.message : err}`);
  }

  const previous = readSeed();
  if (previous.templates.length > 0) {
    console.log("✓ Kept existing templates.json seed");
    return;
  }

  writeFileSync(OUT, JSON.stringify(EMPTY, null, 2) + "\n");
  console.log("✓ Wrote empty templates.json seed");
}

await main();
