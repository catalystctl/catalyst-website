#!/usr/bin/env node
import { readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "src", "data");
const SHOT_DIR = join(ROOT, "public", "img", "screenshots");

const GROUP_MAP = {
  auth: "Authentication",
  user: "User Panel",
  admin: "Admin Panel",
};

const ACRONYMS = new Set(["sftp", "api", "ark"]);

function toTitle(str) {
  return str
    .split(/[\s-]+/)
    .map((w) => {
      const lower = w.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

function nameFromFile(relPath, groupKey) {
  let base = relPath.replace(/\.png$/i, "").replace(/\//g, " — ");
  if (groupKey === "admin" && base.startsWith("admin-")) {
    base = base.slice(6);
  }
  return toTitle(base.replace(/-/g, " "));
}

function walkPngs(dir, root) {
  const results = [];
  const base = root ?? dir;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkPngs(full, base));
    } else if (
      entry.isFile() &&
      !entry.name.startsWith(".") &&
      entry.name.toLowerCase().endsWith(".png")
    ) {
      results.push(relative(base, full));
    }
  }
  return results;
}

// ── Preview shots for index.astro ──
const PREVIEW_ORDER = ["user", "admin", "auth"];
const previewShots = [];
for (const key of PREVIEW_ORDER) {
  const dirPath = join(SHOT_DIR, key);
  let files = [];
  try {
    files = readdirSync(dirPath)
      .filter(
        (f) => !f.startsWith(".") && f.toLowerCase().endsWith(".png")
      )
      .sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      );
  } catch {
    /* directory missing */
  }
  for (const file of files) {
    const name = file.replace(/\.png$/i, "").replace(/-/g, " ");
    previewShots.push({
      src: `/img/screenshots/${key}/${file}`,
      alt: `Catalyst ${name}`,
    });
  }
}

const previewData = {
  shots: previewShots.slice(0, 4),
  heroShot: previewShots[0]?.src || "/og-default.png",
};

// ── Screenshot groups for screenshots.astro ──
const screenshotGroups = [];
let groupKeys;
try {
  groupKeys = readdirSync(SHOT_DIR).filter((d) => {
    const s = statSync(join(SHOT_DIR, d));
    return s.isDirectory() && d in GROUP_MAP;
  });
} catch {
  groupKeys = [];
}

const ORDER = ["auth", "user", "admin"];
for (const key of ORDER) {
  if (!groupKeys.includes(key)) continue;
  const dirPath = join(SHOT_DIR, key);
  const files = walkPngs(dirPath).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

  const screenshots = files.map((file) => ({
    name: nameFromFile(file, key),
    path: `/img/screenshots/${key}/${file}`,
  }));

  screenshotGroups.push({
    title: GROUP_MAP[key],
    screenshots,
  });
}

const allShots = screenshotGroups.flatMap((g) =>
  g.screenshots.map((s) => ({ ...s, group: g.title }))
);

const screenshotsData = {
  groups: screenshotGroups,
  total: allShots.length,
  allShots,
};

// ── Write JSON files ──
import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(
  join(DATA_DIR, "preview-shots.json"),
  JSON.stringify(previewData, null, 2)
);
writeFileSync(
  join(DATA_DIR, "screenshots.json"),
  JSON.stringify(screenshotsData, null, 2)
);

console.log(
  `✓ Generated preview-shots.json (${previewData.shots.length} previews)`
);
console.log(
  `✓ Generated screenshots.json (${screenshotsData.total} screenshots, ${screenshotsData.groups.length} groups)`
);
