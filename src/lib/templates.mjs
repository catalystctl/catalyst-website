/**
 * Shared Catalyst template catalog builder.
 *
 * Used by:
 *  - scripts/generate-templates.js  (build-time seed → src/data/templates.json)
 *  - src/pages/templates.astro      (SSR catalog page, edge cached)
 *
 * Unlike catalyst-plugins, the templates repo has no machine-readable index, so
 * the catalog is assembled from the git tree: discover every egg file the panel
 * importer would accept (`/egg[._-][^/]*\.json$/i`), then read each one for its
 * metadata. The rules mirror .github/workflows/validate-templates.yml so the
 * website and the panel agree on what a template is.
 */

export const REPO = "catalystctl/catalyst-templates";
export const REPO_URL = `https://github.com/${REPO}`;
export const BRANCH = "main";
const API = `https://api.github.com/repos/${REPO}`;
const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Top-level directories → display metadata. Key order drives the filter row.
 * `label` is what visitors see; unknown top-level folders fall back to `misc`.
 */
export const CATEGORIES = {
  games: { label: "Games", blurb: "Dedicated game servers" },
  "web-servers": { label: "Web Servers", blurb: "FastDL, static hosting, HTTP" },
  databases: { label: "Databases", blurb: "SQL and NoSQL engines" },
  "voice-servers": { label: "Voice Servers", blurb: "TeamSpeak, Mumble, voice bots" },
  storage: { label: "Storage", blurb: "Files, object storage, sync" },
  bots: { label: "Bots", blurb: "Discord, Telegram, IRC" },
  misc: { label: "Misc", blurb: "Monitoring, media, proxies" },
};

/** `games/<genre>/…` folders → display labels. */
export const GENRES = {
  action: "Action",
  adventure: "Adventure",
  fps: "FPS",
  mmo: "MMO",
  moba: "MOBA",
  racing: "Racing",
  rts: "RTS",
  sandbox: "Sandbox",
  simulation: "Simulation",
  sports: "Sports",
  strategy: "Strategy",
  survival: "Survival",
};

/** Human labels for the runtime/platform facets derived from an egg. */
export const RUNTIMES = {
  steam: "SteamCMD",
  proton: "Proton / Wine",
  vulkan: "Vulkan",
  caddy: "Caddy",
  nginx: "Nginx",
  apache: "Apache",
  mysql: "MySQL",
  postgres: "PostgreSQL",
  mongodb: "MongoDB",
  redis: "Redis",
  java: "Java",
  nodejs: "Node.js",
  python: "Python",
  alpine: "Alpine",
  ubuntu: "Ubuntu",
  debian: "Debian",
  windows: "Windows-only",
};

/** Keyword → tag rules. Keep tags lowercase, short, and search-friendly. */
const KEYWORD_RULES = [
  [/\benshrouded\b/i, "enshrouded"],
  [/\bfastdl\b|fast[ -]?download|sv_downloadurl/i, "fastdl"],
  [/\bhalf-life\b|\bhl1\b|\bhl2\b/i, "half-life"],
  [/\bsource engine\b|garry'?s mod|\bgmod\b|counter-strike|\bcs:s\b|team fortress|\btf2\b|sven co-?op/i, "source"],
  [/\bminecraft\b/i, "minecraft"],
  [/\bvalheim\b/i, "valheim"],
  [/\bpalworld\b/i, "palworld"],
  [/\bterraria\b/i, "terraria"],
  [/\bfactorio\b/i, "factorio"],
  [/\b7 days to die\b/i, "7-days-to-die"],
  [/\bdayz\b/i, "dayz"],
  [/\bproject zomboid\b/i, "project-zomboid"],
  [/\bsteamcmd\b/i, "steamcmd"],
  [/\bproton\b|\bge-proton\b|\bwine\b/i, "proton"],
  [/\bvulkan\b/i, "vulkan"],
  [/\bteamspeak\b/i, "teamspeak"],
  [/\bmumble\b/i, "mumble"],
  [/\bdiscord\b/i, "discord"],
  [/\btelegram\b/i, "telegram"],
  [/\birc\b/i, "irc"],
  [/\bnginx\b/i, "nginx"],
  [/\bapache\b/i, "apache"],
  [/\bcaddy\b/i, "caddy"],
];

/** Runtime/platform detection rules, applied to images + startup + install script. */
const RUNTIME_RULES = [
  [/\bsteamcmd\b|\bsteam_disk_space\b|\bsteam\b/i, "steam"],
  [/\bproton\b|\bge-proton\b|\bwine\b/i, "proton"],
  [/\bvulkan\b/i, "vulkan"],
  [/\bcaddy\b/i, "caddy"],
  [/\bnginx\b/i, "nginx"],
  [/\bapache\b|\bhttpd\b/i, "apache"],
  [/\bmysql\b|\bmariadb\b/i, "mysql"],
  [/\bpostgres(ql)?\b/i, "postgres"],
  [/\bmongodb\b/i, "mongodb"],
  [/\bredis\b/i, "redis"],
  [/\bjava\b|\bjre\b|openjdk/i, "java"],
  [/\bnode(\.js)?\b|\bnpm\b/i, "nodejs"],
  [/\bpython\b/i, "python"],
  [/\bwindows[- ]only\b|oslist\s*=\s*windows/i, "windows"],
];

function apiHeaders(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "catalyst-website",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function rawHeaders(token) {
  const headers = { "User-Agent": "catalyst-website" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchJson(url, token) {
  const res = await fetch(url, {
    headers: apiHeaders(token),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${url}`);
  return res.json();
}

/** First alphanumeric character, used for the card monogram. */
function monogram(name) {
  const match = String(name).match(/[a-z0-9]/i);
  return (match ? match[0] : "#").toUpperCase();
}

function slugFromPath(path) {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 2] || parts[parts.length - 1].replace(/\.json$/i, "");
}

/** Which top-level category does this egg path belong to? */
function categoryFromPath(path) {
  const top = path.split("/").filter(Boolean)[0];
  return CATEGORIES[top] ? top : "misc";
}

/** `games/survival/enshrouded/egg-….json` → "survival" (null for non-games). */
function genreFromPath(path, category) {
  if (category !== "games") return null;
  const genre = path.split("/").filter(Boolean)[1];
  return genre && GENRES[genre] ? genre : null;
}

function detectRuntimes(egg, dockerImages) {
  const images = dockerImages.map((entry) => entry.image).join(" ");
  const startup = String(egg.startup || "");
  const install = String(egg.scripts?.installation?.script || "");
  const haystack = `${images} ${startup} ${install}`;
  const found = new Set();
  for (const [pattern, runtime] of RUNTIME_RULES) {
    if (pattern.test(haystack)) found.add(runtime);
  }
  // Base distro is useful as a facet on its own.
  for (const [distro, token] of [["alpine", "alpine"], ["ubuntu", "ubuntu"], ["debian", "debian"]]) {
    if (new RegExp(`\\b${distro}\\b`, "i").test(images)) found.add(token);
  }
  return [...found];
}

function deriveTags({ category, genre, runtimes, features, dockerImages, displayName, description }) {
  const tags = new Set();
  tags.add(CATEGORIES[category].label.toLowerCase());
  if (genre) tags.add(genre);
  for (const runtime of runtimes) tags.add(runtime);
  for (const feature of features) {
    const tag = String(feature).replace(/_/g, "-").toLowerCase();
    if (tag && tag.length <= 24) tags.add(tag);
  }
  // Runtime image basenames (steamcmd, caddy, alpine) are good search tokens.
  for (const { image } of dockerImages) {
    const base = String(image).split("/").pop()?.split(":")[0];
    if (base && base.length <= 24 && !/^\d/.test(base)) tags.add(base.toLowerCase());
  }
  const haystack = `${displayName} ${description}`;
  for (const [pattern, tag] of KEYWORD_RULES) {
    if (pattern.test(haystack)) tags.add(tag);
  }
  return [...tags].slice(0, 12);
}

/** Turn one raw egg JSON + its repo path into a normalized catalog entry. */
export function normalizeTemplate(path, egg) {
  const category = categoryFromPath(path);
  const genre = genreFromPath(path, category);
  const slug = slugFromPath(path);
  const displayName = String(egg?.name || slug).trim() || slug;
  const description = String(egg?.description || "").replace(/\s+/g, " ").trim();
  const dockerImages = Object.entries(egg?.docker_images || {})
    .filter(([, image]) => typeof image === "string" && image.trim())
    .map(([label, image]) => ({ label: String(label), image: String(image) }));
  const features = Array.isArray(egg?.features) ? egg.features.map(String) : [];
  const variables = Array.isArray(egg?.variables) ? egg.variables : [];
  const ports = Array.isArray(egg?.ports)
    ? egg.ports.map(Number).filter((port) => Number.isFinite(port) && port > 0)
    : [];
  const runtimes = detectRuntimes(egg, dockerImages);
  const dir = path.split("/").slice(0, -1).join("/");

  return {
    slug,
    name: slug,
    displayName,
    description,
    author: String(egg?.author || "Catalyst").trim() || "Catalyst",
    category,
    categoryLabel: CATEGORIES[category].label,
    genre,
    genreLabel: genre ? GENRES[genre] : null,
    path,
    dir,
    homepage: `${REPO_URL}/tree/${BRANCH}/${dir}`,
    sourceUrl: `${REPO_URL}/blob/${BRANCH}/${path}`,
    downloadUrl: `${RAW}/${path}`,
    eggFormat: String(egg?.meta?.version || "PTDL_v2"),
    exportedAt: egg?.exported_at ? String(egg.exported_at) : null,
    dockerImages,
    runtimes,
    runtimeLabels: runtimes.map((runtime) => RUNTIMES[runtime] || runtime),
    features,
    ports,
    variableCount: variables.length,
    variables: variables.map((variable) => String(variable?.env_variable || "")).filter(Boolean),
    tags: deriveTags({ category, genre, runtimes, features, dockerImages, displayName, description }),
    monogram: monogram(displayName),
  };
}

/** Fetch and normalize a single egg file. Returns null on any failure. */
async function fetchTemplate(path, token) {
  try {
    const res = await fetch(`${RAW}/${path}`, {
      headers: rawHeaders(token),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return normalizeTemplate(path, await res.json());
  } catch {
    return null;
  }
}

/**
 * Build the full catalog from the templates repository.
 *
 * @param {{ token?: string, maxEggs?: number }} [options]
 * @returns {Promise<{ schemaVersion: number, repo: string, repoUrl: string, updatedAt: string, discovered: number, templates: object[] }>}
 */
export async function fetchTemplates(options = {}) {
  const { token, maxEggs = 120 } = options;
  const tree = await fetchJson(`${API}/git/trees/${BRANCH}?recursive=1`, token);
  const paths = (Array.isArray(tree?.tree) ? tree.tree : [])
    .filter((node) => node?.type === "blob" && /(^|\/)egg[._-][^/]*\.json$/i.test(node.path))
    .map((node) => node.path)
    .sort();

  const selected = paths.slice(0, maxEggs);
  const templates = (await Promise.all(selected.map((path) => fetchTemplate(path, token)))).filter(Boolean);
  templates.sort((a, b) => a.displayName.localeCompare(b.displayName, "en", { sensitivity: "base" }));

  return {
    schemaVersion: 1,
    repo: REPO,
    repoUrl: REPO_URL,
    updatedAt: new Date().toISOString(),
    discovered: paths.length,
    templates,
  };
}
