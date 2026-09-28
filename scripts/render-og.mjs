/**
 * Render public/og-default.png (1200x630) from public/og-default.svg.
 *
 * The OG card uses the site's real typefaces (Oxanium, DM Sans, JetBrains
 * Mono). sharp rasterises SVG through librsvg, which ignores both `@font-face`
 * and any font it cannot find on the system, so text would silently fall back
 * to a generic sans. To avoid that we vendor the variable TTFs into
 * scripts/og-fonts (gitignored, fetched on first run) and point fontconfig at
 * just that directory via FONTCONFIG_FILE. That keeps renders offline and
 * deterministic after the first run without touching the host's fonts.
 *
 * FONTCONFIG_FILE is read when fontconfig initialises, so it must be set before
 * sharp is imported. Hence the dynamic import below.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const FONT_DIR = resolve(ROOT, 'scripts/og-fonts');
const SVG_PATH = resolve(ROOT, 'public/og-default.svg');
const PNG_PATH = resolve(ROOT, 'public/og-default.png');

// Variable TTFs from the Google Fonts repository.
const FONTS = [
  {
    file: 'Oxanium.ttf',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/oxanium/Oxanium%5Bwght%5D.ttf',
  },
  {
    file: 'DMSans.ttf',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf',
  },
  {
    file: 'JetBrainsMono.ttf',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf',
  },
];

async function ensureFonts() {
  mkdirSync(FONT_DIR, { recursive: true });
  for (const font of FONTS) {
    const dest = resolve(FONT_DIR, font.file);
    if (existsSync(dest)) continue;
    process.stdout.write(`Downloading ${font.file}... `);
    const res = await fetch(font.url);
    if (!res.ok) throw new Error(`Failed to fetch ${font.url}: ${res.status}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log('ok');
  }
}

/** fontconfig config limited to the vendored fonts. */
function writeFontConfig() {
  const conf = resolve(FONT_DIR, 'fonts.conf');
  writeFileSync(
    conf,
    `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${FONT_DIR}</dir>
  <cachedir>${resolve(FONT_DIR, 'cache')}</cachedir>
</fontconfig>
`
  );
  return conf;
}

await ensureFonts();
process.env.FONTCONFIG_FILE = writeFontConfig();
process.env.FONTCONFIG_PATH = FONT_DIR;

// Imported after FONTCONFIG_FILE is set so librsvg picks it up on init.
const { default: sharp } = await import('sharp');

await sharp(readFileSync(SVG_PATH), { density: 96 })
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9, quality: 100 })
  .toFile(PNG_PATH);

console.log('Rendered public/og-default.png (1200x630)');
