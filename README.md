# Roamory

Roamory is a multi-end travel planning prototype. The first runnable surface is a Next.js + TypeScript Web/PWA shell that follows the blue-white watercolor reference style and validates the MVP loop with guest local storage.

## Demo Preview

![Roamory homepage](artifacts/home-desktop.png)

![Editable trip result](artifacts/trip-edit-saved-desktop.png)

![Route calibration panel](artifacts/route-map-desktop.png)

![Footprint space](artifacts/footprint-home-desktop.png)

![Share poster workflow](artifacts/share-poster-desktop.png)

![Privacy and data settings](artifacts/settings-desktop.png)

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

## Current Build

- Reference-image aligned homepage.
- Capsule navigation for plan, footprint space, and diary.
- Destination carousel with atmosphere selector and thumbnails.
- Guest local-storage draft flow.
- API-backed generation flow: `/create` -> `/generating` -> `/trips/mock-hangzhou`.
- TripPlan JSON Schema, mock LLM adapter, schema validation, and repair retry.
- Route calculation API at `/api/routes/calculate` with a normalized Gaode adapter boundary.
- Route panel on `/trips/[tripId]` with POI markers, daily route display, cache, reorder recalculation, and pending fallback when Gaode keys are not configured.
- Public share-link token API with a lightweight `/share/[token]` page.
- Share poster workflow at `/share-poster/[tripId]` with three fixed-ratio templates.
- Poster privacy toggles for budget, map, exact location, and exact time.
- Local PNG poster export and closeable public share links.
- Account, preference, privacy, and local data management at `/settings`.
- Guest save prompt for account binding without blocking local storage.
- Trip, Footprint, and SharePoster deletion from local data management.
- Editable itinerary result page with local save-to-planned persistence.
- Local footprint space: saving a planned trip lights its destination city.
- Manual city lighting, city privacy toggle, and `/footprints/[city]` detail pages.
- Lightweight SVG favicon to avoid missing favicon requests during browser checks.
- Gaode JS map SDK and fully confirmed real transit durations still require Gaode keys and production provider configuration.
