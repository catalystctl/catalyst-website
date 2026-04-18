<p align="center">
  <img src="public/logo.png" alt="Catalyst logo" width="64" height="64" />
</p>

<h1 align="center">Catalyst Website</h1>

<p align="center">
  <strong>The official website for <a href="https://github.com/catalystctl/catalyst">Catalyst</a> — a fast, secure, and modern game server management platform.</strong>
</p>

<p align="center">
  <a href="https://catalystctl.github.io/catalyst-website/">Live Site</a> ·
  <a href="https://github.com/catalystctl/catalyst">Catalyst Panel</a> ·
  <a href="https://catalystctl.github.io/catalyst-website/screenshots/">Screenshots</a>
</p>

---

The website is a static site built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), deployed to GitHub Pages. It visually matches the Catalyst panel's **Obsidian Design System** — same fonts, colors, component patterns, and layout conventions.

## Pages

| Page | Description |
|------|-------------|
| **[Homepage](https://catalystctl.github.io/catalyst-website/)** | Overview with features, quick start, architecture diagram, and screenshot previews |
| **[Screenshots](https://catalystctl.github.io/catalyst-website/screenshots/)** | Full gallery of all panel screenshots organized by section (auth, user, admin) |

## Tech Stack

- **Astro 6** — static site generation with zero client-side JS
- **Tailwind CSS 4** — utility-first styling matching the panel's design tokens
- **@astrojs/sitemap** — auto-generated XML sitemap for SEO
- **GitHub Actions** — automatic deployment on push

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

# Preview the production build
npm run preview
```

## Project Structure

```
├── .github/workflows/deploy.yml   # GitHub Pages deployment
├── catalyst/                       # Git submodule → docs/screenshots
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── logo.png
│   ├── robots.txt
│   └── img/screenshots/            # Copied at build time (gitignored)
├── scripts/
│   ├── copy-screenshots.sh         # Copies submodule screenshots → public/
│   └── setup.sh                    # Initial project setup
├── src/
│   ├── layouts/Layout.astro        # Shared layout (header, footer, SEO)
│   ├── pages/
│   │   ├── index.astro             # Homepage
│   │   └── screenshots.astro       # Screenshot gallery
│   └── styles/global.css           # Tailwind + Obsidian design tokens
├── astro.config.mjs
├── tailwind.config.js
└── package.json
```

## License

[GPL-3.0](https://github.com/catalystctl/catalyst/blob/main/LICENSE)
