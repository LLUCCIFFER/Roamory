# Roamory

Roamory is a multi-end travel planning prototype. The first runnable surface is a Next.js + TypeScript Web/PWA shell that follows the blue-white watercolor reference style and validates the MVP loop with guest local storage.

## Demo Preview

![Roamory homepage](artifacts/home-desktop.png)

![Editable trip result](artifacts/trip-edit-saved-desktop.png)

![Route calibration panel](artifacts/route-map-desktop.png)

![Footprint space](artifacts/footprint-home-desktop.png)

![Share poster workflow](artifacts/share-poster-desktop.png)

![Privacy and data settings](artifacts/settings-desktop.png)

![Photo memory workbench](artifacts/memories-desktop.png)

![Weekend weather recommendations](artifacts/weekend-desktop.png)

![Souvenir memory workbench](artifacts/souvenirs-desktop.png)

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If port `3000` is already occupied, use another port:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3001
```

## Provider Configuration

Copy `.env.example` to `.env.local` for local provider tests. Do not commit real keys.

```bash
AMAP_WEB_SERVICE_KEY=your-gaode-web-service-key
NEXT_PUBLIC_AMAP_JSAPI_KEY=your-gaode-jsapi-key
NEXT_PUBLIC_AMAP_SECURITY_JS_CODE=your-gaode-jsapi-security-code
LLM_PROVIDER=mock
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.5-flash
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2
```

Current provider direction:

- China POI and routes: Gaode Web Service API as the primary provider.
- Browser map rendering: Gaode JavaScript API 2.0 through `@amap/amap-jsapi-loader`; the app falls back to the watercolor route sketch when JS API config is absent.
- Weather recommendations: Open-Meteo forecast adapter in Round 12.
- International route/geocoding fallback: reserved OpenRouteService adapter.
- Low-frequency development geocoding: Nominatim only as a cached fallback, not a production core path.
- AI trip generation: replaceable LLM adapter with `mock`, Gemini structured output, and local Ollama options. Keep `LLM_ALLOW_MOCK_FALLBACK=true` during development so provider failures fall back to local generation instead of blocking the user.

## Current Build

- Reference-image aligned homepage.
- Capsule navigation for plan, footprint space, and diary.
- Destination carousel with atmosphere selector and thumbnails.
- Guest local-storage draft flow.
- API-backed generation flow: `/create` -> `/generating` -> `/trips/mock-hangzhou`.
- TripPlan JSON Schema, replaceable LLM adapter, schema validation, repair retry, Gemini/Ollama configuration, normalized provider metadata, and local mock fallback.
- Generation failure UI now shows normalized error codes and creates a fresh retry task from the saved guest draft.
- Route calculation API at `/api/routes/calculate` with a normalized Gaode adapter boundary.
- Gaode Web Service POI search and walking/transit/driving route calls when `AMAP_WEB_SERVICE_KEY` or `GAODE_WEB_SERVICE_KEY` is configured.
- Route panel on `/trips/[tripId]` with Gaode JS SDK rendering when browser keys are configured, watercolor route fallback when they are absent, POI markers, daily route display, cache, reorder recalculation, confirmed durations when Gaode Web Service is available, and pending fallback when provider calls fail.
- Public share-link token API with a lightweight `/share/[token]` page.
- Share poster workflow at `/share-poster/[tripId]` with three fixed-ratio templates.
- Poster privacy toggles for budget, map, exact location, and exact time.
- Local PNG poster export and closeable public share links.
- Account, preference, privacy, and local data management at `/settings`.
- Photo memory workbench at `/memories` with local thumbnail import, file metadata clustering, candidate trips, merge/split, ignore, delete, and confirmation controls.
- Confirmed photo memories generate local trips, save a cover thumbnail, and light the related footprint city.
- Original image backup stays off by default; Round 11 only stores local thumbnails and file metadata.
- Weekend weather recommendations at `/weekend` with Open-Meteo daily forecasts, mood selection, public-transport/driving radius filters, evidence chips, risk tips, cache/fallback handling, and one-day trip generation.
- Homepage weekend entry links into the full weather recommendation page.
- Souvenir memory workbench at `/souvenirs` with upload/camera thumbnails, city and Trip association, 2.5D/plain card modes, local PNG share cards, and annual-report seed data.
- City detail pages show same-city souvenirs, and `/settings` can count/delete local souvenir records.
- Guest save prompt for account binding without blocking local storage.
- Trip, Footprint, and SharePoster deletion from local data management.
- Editable itinerary result page with local save-to-planned persistence.
- Local footprint space: saving a planned trip lights its destination city.
- Manual city lighting, city privacy toggle, and `/footprints/[city]` detail pages.
- Lightweight SVG favicon to avoid missing favicon requests during browser checks.
- Server Web Service keys and browser JS API keys are kept separate; no real provider key is committed.
