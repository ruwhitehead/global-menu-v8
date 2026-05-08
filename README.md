# Global Menu Explorer

A single-page React app that lets you browse 600 authentic dishes across 12 countries, spin a wheel to pick a random dish or country, and fetch AI-generated recipes on demand.

**Live demo:** [ruwhitehead.github.io/global-menu-v8](https://ruwhitehead.github.io/global-menu-v8/)

## Features

- Country picker with inline SVG flags for 12 cuisines (France, Italy, Germany, Spain, China, Brazil, Nigeria, Thailand, Poland, Vietnam, UK, India)
- 50 ranked dishes per country with local-language names and English translations
- Spin-wheel random selector for both countries and dishes
- On-demand recipes fetched from Claude (Haiku) — description, ingredients (scaled by diner count), prep/cook times, and step-by-step method
- In-session recipe cache so the same dish is never fetched twice

## Tech stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Hosting | GitHub Pages (via `gh-pages`) |
| AI | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

## Deploying

```bash
npm run deploy     # builds and pushes to the gh-pages branch
```

## Project structure

```
global_menu_v8.tsx   # entire app — types, data, components, and routing
src/main.tsx         # React entry point
index.html           # HTML shell
vite.config.ts       # Vite config (base path set for GitHub Pages)
```

## Security note

Recipe fetches call the Anthropic API directly from the browser using `anthropic-dangerous-direct-browser-access`. This is fine for prototyping but **should not be used in production** — it exposes your API key and rate limits to end users. Move `apiFetch` to a serverless function or backend proxy before a public release.

## Customising

- **Add a country:** add an entry to `COUNTRIES` and a matching key in `MENU_DATA` (50 dishes, same shape as the others).
- **Add a dish type:** add an entry to `DISH_TYPES` with the relevant keywords and an emoji icon.
- **Change the AI model:** update the `model` field in `apiFetch`.
