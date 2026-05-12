<p align="center">
  <img src="public/logo.png" alt="Catalyst logo" width="64" height="64" />
</p>

<h1 align="center">Catalyst Website</h1>

<p align="center">
  <strong>The official website for <a href="https://github.com/catalystctl/catalyst">Catalyst</a> — a fast, secure, and modern game server management platform.</strong>
</p>

<p align="center">
  <a href="https://catalystctl.com/">Live Site</a> ·
  <a href="https://github.com/catalystctl/catalyst">Catalyst Panel</a> ·
  <a href="https://catalystctl.com/screenshots/">Screenshots</a>
</p>

---

The website is built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), deployed to **Cloudflare Pages**. It visually matches the Catalyst panel's **Obsidian Design System** — same fonts, colors, component patterns, and layout conventions.

## Pages

| Page | Description |
|------|-------------|
| **[Homepage](https://catalystctl.com/)** | Overview with features, quick start, architecture diagram, and screenshot previews |
| **[Pterodactyl Alternative](https://catalystctl.com/pterodactyl-alternative/)** | Why switch + detailed Catalyst vs Pterodactyl comparison tables |
| **[Migrate from Pterodactyl](https://catalystctl.com/migrate-from-pterodactyl/)** | Step-by-step migration guide with auto-migration tool details |
| **[Screenshots](https://catalystctl.com/screenshots/)** | Full gallery of all panel screenshots organized by section (auth, user, admin) |
| **[Documentation](https://catalystctl.com/docs/)** | Installation, configuration, nodes, plugins, and API reference |

## Tech Stack

- **Astro 6** — hybrid rendering (prerendered + SSR) via Cloudflare adapter
- **Tailwind CSS 4** — utility-first styling matching the panel's design tokens
- **@astrojs/sitemap** — auto-generated XML sitemap for SEO
- **@astrojs/cloudflare** — Cloudflare Pages deployment adapter
- **Wrangler** — Cloudflare Pages CLI for local preview and deployment

## Design System

The site uses the same design language as the Catalyst panel:

- **Fonts:** DM Sans Variable, Outfit Variable, JetBrains Mono Variable
- **Colors:** Obsidian dark theme with `zinc-950` base, indigo primary accent
- **Components:** Mirrors panel patterns (PageHeader, StatsCard, Sidebar section labels, BrandFooter)
- **Tokens:** All CSS variables and Tailwind config values are pulled from the panel source

## Screenshots

Screenshots are sourced from the [catalyst](https://github.com/catalystctl/catalyst) repository via a git submodule with sparse checkout (only `docs/screenshots` is pulled). At build time, `scripts/copy-screenshots.sh` copies them into `public/img/screenshots/`.

```sh
# Update screenshots from the main repo
git submodule update --remote catalyst
```

## Development

```sh
# Install dependencies
npm install

# Start dev server (screenshots are copied automatically)
npm run dev

# Build for production
npm run build

# Preview the production build locally via Wrangler
npm run preview
```

## Deployment

The site deploys to **Cloudflare Pages** via Wrangler:

```sh
# Deploy to Cloudflare Pages
npm run deploy
```

The `wrangler.jsonc` configures the Cloudflare adapter. Static pages are prerendered at build time; the docs index uses SSR for dynamic content collection rendering.

## Project Structure

```
├── .github/                      # GitHub config
├── catalyst/                     # Git submodule → docs/screenshots
├── public/
│   ├── favicon.ico               # Legacy favicon
│   ├── favicon.svg               # Modern SVG favicon
│   ├── logo.png                  # Brand logo
│   ├── og-default.png            # Default Open Graph image (1200x630)
│   ├── og-default.svg            # OG image source
│   ├── robots.txt                # Search engine crawl directives
│   ├── _redirects                # Cloudflare Pages redirects
│   ├── _headers                  # Cloudflare Pages cache/security headers
│   └── img/screenshots/          # Copied at build time (gitignored)
├── scripts/
│   ├── copy-screenshots.sh       # Copies submodule screenshots → public/
│   ├── sync-docs.sh              # Syncs documentation from catalyst repo
│   ├── generate-screenshot-data.js  # Generates screenshot JSON data
│   ├── render-og.mjs             # Renders OG SVG → PNG
│   └── setup.sh                  # Initial project setup
├── src/
│   ├── content/docs/             # Documentation markdown files
│   ├── data/                     # JSON data files for screenshots
│   ├── layouts/
│   │   ├── Layout.astro          # Shared layout (header, footer, SEO, JSON-LD)
│   │   └── DocsLayout.astro      # Documentation layout (sidebar, TOC)
│   ├── pages/
│   │   ├── 404.astro             # Custom 404 page
│   │   ├── index.astro           # Homepage
│   │   ├── screenshots.astro     # Screenshot gallery
│   │   ├── pterodactyl-alternative.astro  # Pterodactyl alternative + comparison
│   │   ├── vs-pterodactyl.astro  # Redirect → /pterodactyl-alternative/
│   │   ├── migrate-from-pterodactyl.astro # Migration guide
│   │   └── docs/
│   │       ├── index.astro       # Docs landing page
│   │       └── [...slug].astro   # Individual doc pages
│   ├── styles/global.css         # Tailwind + Obsidian design tokens
│   └── content.config.ts         # Content collection schema
├── astro.config.mjs              # Astro configuration (hybrid + Cloudflare)
├── tailwind.config.js            # Tailwind configuration
├── wrangler.jsonc                # Cloudflare Pages config
└── package.json
```

## SEO

The site implements comprehensive SEO best practices:

- **Canonical URLs** on every page with trailing-slash consistency
- **JSON-LD structured data**: SoftwareApplication, TechArticle, FAQPage, HowTo, BreadcrumbList
- **Open Graph + Twitter Card** meta tags with 1200×630 OG image
- **Auto-generated XML sitemap** with priority and changefreq
- **Custom 404 page** to prevent soft 404s
- **robots.txt** with sitemap reference
- **Cloudflare Pages** headers for caching and security
- **Semantic HTML** with proper heading hierarchy and ARIA labels

## License

[GPL-3.0](https://github.com/catalystctl/catalyst/blob/main/LICENSE)
