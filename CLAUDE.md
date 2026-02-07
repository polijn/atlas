# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CC0 POI images on atproto. A SvelteKit app that lets users upload geotagged photos to AT Protocol (Bluesky-compatible), extract GPS from EXIF data, assign Points of Interest from OpenStreetMap, and view uploaded images on an interactive map.

## Commands

- `npm run dev` — Start dev server (127.0.0.1:5179)
- `npm run build` — Build for production (Cloudflare Workers)
- `npm run check` — Type-check with svelte-check
- `npm run lint` — Check formatting (Prettier) and lint (ESLint)
- `npm run format` — Auto-format code with Prettier

No test framework is configured.

## Tech Stack

- **Svelte 5** with runes (`$state`, `$derived`, `$effect`, `$props()`) and snippet-based composition
- **SvelteKit 2** with Cloudflare Workers adapter (`wrangler.jsonc`, worker name: "agi")
- **Tailwind CSS v4** (via Vite plugin)
- **Bits UI** for headless components (Command, Combobox, Avatar)
- **svelte-maplibre-gl** / **maplibre-gl** for interactive maps
- **@atcute** libraries for AT Protocol OAuth, API calls, identity resolution
- **exifr** for EXIF GPS extraction from photos

## Architecture

### Data Flow

1. **Image upload** (`+page.svelte`): User selects images → GPS extracted from EXIF (`$lib/image/exif.ts`) → stored in IndexedDB (`$lib/state/image-store.svelte.ts`)
2. **Location assignment** (`/upload`): User picks a POI via text search (Nominatim), nearby search (Overpass API + browser geolocation), or map click (`MapPicker.svelte`) → POI assigned to image
3. **AT Protocol upload**: Image compressed to WebP (`$lib/atproto/image-helper.ts`) → blob uploaded → record created as `pics.atmo.atlas.v0` collection
4. **Map view** (`/map`): Fetches user's records via `listRecords`, displays geotagged images as markers

### Key Modules

- **`$lib/atproto/auth.svelte.ts`** — OAuth session management, login/logout, profile loading. Module-level reactive state via Svelte runes.
- **`$lib/atproto/methods.ts`** — AT Protocol API wrappers (putRecord, listRecords, uploadBlob, deleteRecord)
- **`$lib/atproto/settings.ts`** — OAuth permissions config, PDS URLs, collection definitions (`pics.atmo.atlas.v0`)
- **`$lib/state/image-store.svelte.ts`** — IndexedDB-backed image storage with reactive state
- **`$lib/poi/`** — POI search: `nominatim.ts` (text search), `overpass.ts` (nearby POIs), `poi-cache.ts` (IndexedDB cache)
- **`$lib/components/MapPicker.svelte`** — Interactive map with click-to-place location selection

### State Management

- **IndexedDB** for persistent storage: images (database: `atp-geo-img`) and POI cache (database: `atp-geo-img-pois`)
- **localStorage** for session data (`current-login`, `recent-logins`)
- **Module-level Svelte runes** for reactive app state (auth, image store)

### External APIs

- **Nominatim** (`nominatim.openstreetmap.org`) — POI text search (no auth, User-Agent header required)
- **Overpass API** (`overpass-api.de`) — Nearby POI queries by category
- **Bluesky Public API** (`public.api.bsky.app`) — Actor typeahead/autocomplete
- **AT Protocol PDS** — User-specific endpoints, OAuth authenticated

## Code Style

- Tabs for indentation, single quotes, no trailing commas, print width 100
- Prettier with svelte and tailwindcss plugins (auto class sorting)
- ESLint flat config with TypeScript and Svelte support
