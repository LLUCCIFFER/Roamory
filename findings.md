# Findings & Decisions

## Requirements
- Analyze the current `AI_Travel_Memory_PRD.md`.
- Refer to the uploaded image's style, color tone, format, and layout if available.
- Generate improved root-level `PRD.md`, `DESIGN.md`, and `TODO.md`.
- Use frontend-design principles for later UI development.
- Make each development round explicit.

## Research Findings
- The repository initially only contained `AI_Travel_Memory_PRD.md`; the reference image was later provided by the user and is now visible at `D:\DEMO\Roamory\e565697a07772940ec7e69c9e899ccd6.png`.
- The reference image shows a dreamy blue-white watercolor destination webpage: large "Choose a Destination" heading, pill navigation, destination carousel, season selector, thumbnail strip, translucent diary cards, lace borders, mountains/clouds, flowers/butterflies, and a handwritten quote.
- The first shell read showed mojibake, so the PRD needs to be read with explicit UTF-8 handling before analysis.
- The source PRD defines Roamory as an AI travel lifecycle product: planning -> trip editing -> saving -> sharing -> footprint/memory.
- The existing MVP path is ambitious: AI itinerary generation, map editing, poster sharing, footprint lighting, and post-trip photo memory.
- P0 modules include login/guest, preferences, AI planning, map itinerary, editing, saving, poster sharing, footprint map, and privacy settings.
- P1/P2 include photo memory, weather-driven weekend recommendations, collaboration, budget enhancement, annual reports, 3D souvenirs, and commerce.
- The strongest product wedge is not "travel guide generation" alone, but turning a generated/saved trip into a durable personal travel memory asset.
- The highest delivery risks are scope creep, unreliable AI/POI output, map/weather/AI API cost, and privacy leakage from location/photo data.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Create new polished documents instead of editing the source PRD | Preserves the original requirement source while producing cleaner implementation handoff docs. |
| Update `DESIGN.md` to match the now-available reference image | The user provided the reference image after the first deliverable pass. |
| Use phased rounds in `TODO.md` | The user specifically asked to clarify each development round. |
| Reframe MVP as "Plan -> Save -> Share -> Footprint" | This preserves the travel-memory thesis while keeping photo memory and weather recommendation out of the first shippable slice. |
| Treat true route/map integration as a late-MVP hardening round | Static/list-first itinerary validation can start faster; route APIs add trust after the core loop exists. |
| Put privacy checks in the first product slice | Location and photo data are sensitive, so defaults and share-preview rules must be foundational. |
| Shift the visual signature from `Memory Atlas Strip` to `Cloud Diary Carousel` on the home page | The reference image's strongest productizable pattern is the destination carousel with seasonal thumbnails; `Memory Atlas Strip` remains useful for itinerary/results. |
| Launch shape is multi-end | User confirmed multi-end launch; docs should avoid a single-platform assumption. |
| Use Amap/Gaode as the map provider | User confirmed 高德; map/POI/route/weather work should use an adapter around 高德 APIs. |
| MVP account strategy is guest + local storage | User confirmed local-first guest mode before full account requirements. |
| Public links are in MVP sharing scope | User confirmed public links should be supported alongside image export. |
| Photo memory may upload thumbnails | User confirmed thumbnail upload is allowed for P1; original images remain opt-in. |
| AI output uses JSON Schema validation | User did not name a specific model provider, so docs lock the structured-output approach while leaving the model behind a replaceable adapter. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Uploaded PNG was unavailable during the first pass | Updated PRD/DESIGN/TODO after the user provided the reference image. |
| PRD output encoding appeared corrupted in the terminal | Re-read with UTF-8 output settings and infer from the source file content. |

## Resources
- Source PRD: `D:\DEMO\Roamory\AI_Travel_Memory_PRD.md`
- Planned outputs: `D:\DEMO\Roamory\PRD.md`, `D:\DEMO\Roamory\DESIGN.md`, `D:\DEMO\Roamory\TODO.md`
- Working files: `D:\DEMO\Roamory\task_plan.md`, `D:\DEMO\Roamory\findings.md`, `D:\DEMO\Roamory\progress.md`

## Visual/Browser Findings
- Reference image details: pastel sky-blue watercolor background; cloud and mountain texture; white lace dividers; rounded pill navigation; large rounded display heading; central beach/destination carousel; `SUMMER` season selector; thumbnail strip; translucent frosted diary card; profile/day-life diary section; stacked image cards; small circular icon buttons; decorative white flowers and butterflies; handwritten quote on a white panel.
- Updated visual brief: dreamy blue-white travel diary space, with `Cloud Diary Carousel` as the home signature, `Travel Diary Card` for saved trips/footprints, capsule nav for main controls, lace dividers for emotional pages, and reduced decoration in dense editing/privacy flows.

## Implementation Findings
- Round 2-4 guest flow is now implemented locally: `/create` -> `/generating` -> `/trips/mock-hangzhou`.
- Guest drafts and generation tasks are stored in localStorage through `lib/storage.ts`.
- Public sharing is represented by a generated route URL on the result page until a server-side token model exists.
- Album memory thumbnail upload is implemented as a local data URL preview keyed by `tripId`; original image upload remains out of scope.
- The result page uses mock TripPlan data from `lib/mock-data.ts` and keeps route calibration behind a visible 高德 route status placeholder.
- Clean browser verification was run on `http://127.0.0.1:3001`; port `3000` was occupied by an older stale dev process.
- Round 6 API contract foundation is now implemented: TripPlan JSON Schema, mock LLM adapter, validation + one repair retry, generation job API, API-backed generating page, public share-link token API, and `/share/[token]` public page.
- Current server stores are intentionally in-memory. They validate endpoint contracts but will lose generation/share state on server restart until a database is introduced.
- Public share privacy currently supports budget, exact time, map, and thumbnail display flags. The UI hides exact map by default and uses coarse time buckets on the public page.
- Round 5 edit/save flow is implemented on `/trips/[tripId]`: editable local trip state, POI delete, lock/unlock, mock replace, up/down controls, desktop drag sorting, local route-time recalculation, save-to-planned, and refresh persistence in `roamory.savedTrips`.
- Locked POIs cannot be replaced or deleted, but they can be moved in the route order. This keeps the MVP behavior simple while preserving the key "do not let AI replace this" promise.
- Saved trips remain local-only in this phase; moving to account sync or PostgreSQL should preserve the same `SavedTrip` shape or map it explicitly.
- Round 7 footprint work should remain local-first: saving a planned trip can light the destination city in `roamory.footprints`, while manual lighting covers cities without a generated trip yet.
- City detail can be client-rendered from localStorage because guest footprint data does not exist on the server in the MVP prototype.
- Round 7 footprint space is implemented: homepage footstep panel reads `roamory.footprints`, supports manual lighting/search, privacy toggles, city cards, and a map-like Virtual Space surface.
- Saving `/trips/mock-hangzhou` as planned now lights 杭州 with `tripIds: ["mock-hangzhou"]`; `/footprints/杭州` shows the linked Trip.
- Mobile footprint view hides the fixed bottom tab while the 足迹 tab is active to avoid covering city card actions; top capsule navigation remains available.
- Browser verification uses installed Chrome because the Playwright-managed Chromium executable is not present on this machine.
- Round 8 should use a dedicated poster workflow instead of crowding the result page: result page opens `/share-poster/[tripId]`, and the poster page owns template selection, privacy toggles, preview, image export, and public-link creation checks.
- Round 8 share poster is implemented at `/share-poster/[tripId]`: three fixed-ratio templates, privacy toggles, pre-share review, canvas PNG export, local poster draft persistence, public link generation, and public link closing.
- Public share links now carry `showExactLocation`; when it is off, day titles and stop names are replaced with city-level memory labels so point-of-interest words such as 西湖 are not exposed.
- Browser audit confirmed a draft/private trip cannot generate a public link, budget-hidden poster preview omits `CNY`, exported images are stored as `data:image/png`, closed share links return 404, and mobile poster layout has no horizontal overflow.
- Round 9 privacy/account/data management is implemented at `/settings`: account binding modal, preference settings, privacy defaults, local data metrics, and delete actions for Trip, Footprint, and SharePoster.
- Guest save now remains non-blocking but triggers an account binding prompt, preserving local-first behavior while closing the account loop for later sync.
- `lib/storage.ts` now owns local profile, preference, privacy, footprint deletion, poster deletion, thumbnail deletion, and Roamory local-data cleanup helpers.
- Share poster defaults must not read localStorage during initial render; saved privacy settings are applied after mount to avoid SSR/client hydration mismatch.
- Running `next build` while `next dev` serves the same `.next` directory can mix production and development chunks. Stop dev before production builds or restart dev and clear generated `.next` cache afterward.
- README now includes committed demo screenshots from `artifacts/` while logs and temporary audit files remain ignored.
