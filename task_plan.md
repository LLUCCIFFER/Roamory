# Task Plan: Roamory PRD/Design/TODO Upgrade

## Goal
Analyze the existing `AI_Travel_Memory_PRD.md`, infer the missing reference-image direction as far as possible from available context, and create polished root-level `PRD.md`, `DESIGN.md`, and `TODO.md` documents for phased development.

## Current Phase
Complete

## Phases

### Phase 1: Requirements & Discovery
- [x] Read the user request.
- [x] Check whether planning files already exist.
- [x] Search the project root for the referenced image.
- [x] Re-read the PRD with correct UTF-8 output.
- [x] Capture findings in `findings.md`.
- **Status:** complete

### Phase 2: Product Analysis & Scope Refinement
- [x] Extract product positioning, MVP loop, target users, core features, data/privacy constraints, and risks.
- [x] Identify gaps and contradictions in the existing PRD.
- [x] Decide the refined MVP and post-MVP scope.
- **Status:** complete

### Phase 3: Design Direction
- [x] Create a first-pass design direction before the image was available.
- [x] Define palette, typography, spacing, components, interaction states, and visual signature.
- [x] Align design with frontend implementation rounds.
- **Status:** complete

### Phase 4: Root Deliverables
- [x] Create polished `PRD.md`.
- [x] Create polished `DESIGN.md`.
- [x] Create actionable `TODO.md` with clear development rounds.
- **Status:** complete

### Phase 5: Review & Handoff
- [x] Verify the generated documents exist and are readable.
- [x] Summarize outputs and note the missing-image limitation.
- **Status:** complete

### Phase 6: Reference Image Alignment
- [x] Inspect the provided reference image.
- [x] Update `PRD.md` reference-image status.
- [x] Rewrite `DESIGN.md` to match the image's style, color, layout, and component language.
- [x] Update `TODO.md` frontend rounds to include reference-image implementation tasks.
- [x] Update planning notes with the corrected visual findings.
- **Status:** complete

### Phase 7: Startup Decisions Lock-in
- [x] Record multi-end launch decision.
- [x] Record 高德地图 decision.
- [x] Record AI structured-output approach and leave provider behind adapter.
- [x] Record guest + local storage decision.
- [x] Record public link sharing decision.
- [x] Record thumbnail upload decision for photo memory.
- [x] Update `PRD.md`, `TODO.md`, `findings.md`, and progress notes.
- **Status:** complete

### Phase 8: Round 1 Frontend Skeleton
- [x] Create Next.js + TypeScript project files.
- [x] Implement reference-image-aligned visual system.
- [x] Build capsule navigation, destination carousel, travel diary card, and basic controls.
- [x] Add guest local-storage draft flow and mock itinerary preview.
- [x] Add README startup instructions.
- [x] Run install/build verification.
- **Status:** complete

### Phase 9: Round 2-4 Guest Trip Flow
- [x] Add shared localStorage helpers for guest drafts, generation tasks, and album thumbnails.
- [x] Build `/create` full trip requirement form with validation and example-fill flow.
- [x] Build `/generating` progress page with visible structured-generation steps.
- [x] Build `/trips/[tripId]` result page with summary, Day tabs, timeline, route status, warnings, public-link generation, and thumbnail upload.
- [x] Update homepage CTA flow to route through generation and result pages.
- [x] Run typecheck, production build, security audit, and Playwright desktop/mobile visual checks.
- **Status:** complete

### Phase 10: Round 6 API Contract Foundation
- [x] Define TripPlan JSON Schema and server-side validation helpers.
- [x] Add replaceable mock LLM adapter that returns validated TripPlan data.
- [x] Implement `POST /api/trips/generate` and `GET /api/trips/generate/[taskId]`.
- [x] Change `/generating` from pure client simulation to API-backed polling.
- [x] Implement public share-link token API and connect the result-page sharing action.
- [x] Run typecheck, production build, API checks, and browser smoke tests.
- **Status:** complete

### Phase 11: Round 5 Edit & Save Flow
- [x] Add local saved-trip data model and persistence helpers.
- [x] Convert `/trips/[tripId]` from read-only mock rendering to editable trip state.
- [x] Implement delete, lock, mock replace, and stable reorder controls for POI stops.
- [x] Implement local timeline recalculation after edits.
- [x] Implement save-to-planned state and refresh persistence.
- [x] Run typecheck, production build, and browser interaction checks.
- **Status:** complete

### Phase 12: Round 7 Footprint Space
- [x] Add local footprint city persistence helpers.
- [x] Light the destination city when a planned trip is saved.
- [x] Replace the homepage placeholder with a searchable footprint space.
- [x] Support manual city lighting and privacy toggles in guest local storage.
- [x] Add a city detail page that links local trips to the lit city.
- [x] Update TODO, README, findings, and progress notes.
- [x] Run typecheck, production build, audit, and browser layout checks.
- **Status:** complete

### Phase 13: Round 8 Share Poster & Privacy Check
- [x] Add local poster/privacy preference types and storage helpers.
- [x] Add a dedicated share-poster page for saved trips.
- [x] Implement 2-3 fixed-ratio poster templates.
- [x] Implement content toggles for budget, map, exact location, and exact time.
- [x] Implement calm pre-share privacy checks.
- [x] Generate and save a local PNG poster from the preview.
- [x] Connect the result page to the poster workflow.
- [x] Update TODO, README, findings, and progress notes.
- [x] Run typecheck, production build, audit, and browser layout checks.
- **Status:** complete

### Phase 14: Round 9 Privacy, Account & Data Management
- [x] Add local account, preference, privacy, and data cleanup helpers.
- [x] Add `/settings` with account binding modal, preference settings, privacy defaults, and local data management.
- [x] Trigger an account-binding prompt after guest save without blocking local persistence.
- [x] Support deleting Trip, Footprint, and SharePoster records from local data management.
- [x] Connect share-poster defaults to saved privacy settings after client mount.
- [x] Add README demo screenshots and update TODO/findings/progress notes.
- [x] Run typecheck, production build, npm audit, and browser regression checks.
- [x] Initialize git and create a local commit with a brief update summary.
- [ ] Push the local commit to GitHub after `github.com:443` connectivity is restored.
- **Status:** implementation complete; remote push blocked by network connectivity

### Phase 15: Round 10 Route Adapter & Map Panel
- [x] Add normalized route calculation types.
- [x] Add server-side Gaode route adapter boundary with in-memory cache.
- [x] Connect Gaode Web Service POI search through `place/text`.
- [x] Connect Gaode walking, transit, and driving route calls behind the normalized adapter.
- [x] Add `POST /api/routes/calculate`.
- [x] Add pending fallback when Gaode Web Service key is missing or route requests fail.
- [x] Connect `/trips/[tripId]` to route calculation and route label updates.
- [x] Show a route map panel with POI markers, daily route line, total duration, distance, and pending state.
- [x] Recalculate route labels after route reorder/edit operations.
- [x] Update README, TODO, findings, and progress.
- [x] Run typecheck and browser route-panel checks.
- [x] Create a local git commit for this round.
- [ ] Push the local commits to GitHub after `github.com:443` connectivity is restored.
- [x] Validate Gaode Web Service POI and route calls with a local environment variable key.
- [x] Add Gaode JS SDK loader boundary and browser map canvas.
- [x] Keep the watercolor route sketch as fallback when browser JS API config is absent or SDK loading fails.
- [ ] Validate production Gaode JS API key, security code, and domain whitelist on the final deployment domain.
- **Status:** Round 10 SDK boundary complete; production JS API domain validation remains

### Phase 16: Round 11 Photo Memory Workbench
- [x] Add local photo-memory candidate data model and storage helpers.
- [x] Add `/memories` workbench with album authorization/privacy copy.
- [x] Support thumbnail import with local file metadata and compressed previews.
- [x] Keep original-image backup off by default with a separate confirmation toggle.
- [x] Add local clustering into candidate trips.
- [x] Support confirm, ignore, merge, split, and delete candidate actions.
- [x] Generate a local Trip from a confirmed photo memory.
- [x] Light the related footprint city after confirmation.
- [x] Link the workbench from homepage navigation and Mine panel.
- [x] Run browser regression checks and production verification.
- [x] Create and push a local git commit for this round.
- **Status:** complete

### Phase 17: Round 12 Weekend Weather Recommendations
- [x] Add app-owned weather recommendation types.
- [x] Add Open-Meteo forecast adapter with in-memory cache and fallback recommendations.
- [x] Add `/api/weather/recommendations`.
- [x] Add `/weekend` with mood, transport mode, and travel-radius controls.
- [x] Show recommendation cards with weather evidence, travel time, and risk tips.
- [x] Generate a one-day guest draft from a recommendation.
- [x] Link the weekend entry from homepage navigation.
- [x] Run API, browser, production, and audit verification.
- [x] Create and push a local git commit for this round.
- **Status:** complete

### Phase 18: Round 13 Souvenir Memory & Annual Report Seed
- [x] Add local souvenir memory and annual-report seed data models.
- [x] Add `/souvenirs` workbench with upload/camera thumbnail input.
- [x] Support city and Trip association for souvenir cards.
- [x] Support 2.5D layered display and plain-card fallback.
- [x] Generate a local PNG share card for each souvenir.
- [x] Connect souvenir counts to the homepage Mine panel.
- [x] Show same-city souvenirs on `/footprints/[city]`.
- [x] Add souvenir deletion to `/settings` local data management.
- [x] Update README, TODO, findings, and progress notes.
- [x] Run typecheck and browser regression checks.
- **Status:** complete

## Key Questions
1. What is the smallest valuable MVP loop for Roamory?
2. Which features should be P0, P1, and P2 to avoid scope creep?
3. What visual system should guide future frontend development without the unavailable image?
4. What should each development round deliver and verify?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Use root-level planning files during this session | The task spans discovery, analysis, design, and multiple deliverables. |
| Treat the referenced PNG as unavailable unless rediscovered locally | The provided path does not exist in the workspace scan. |
| Build the refined MVP around Plan -> Save -> Share -> Footprint | It keeps the product distinctive while reducing first-release complexity. |
| Push photo memory, weather weekend mode, and 3D souvenirs after the first shippable loop | These are strong differentiators but increase privacy, API, and implementation complexity. |
| Align the visual system to the provided blue-white watercolor reference | The user supplied the image after the initial docs were created. |
| Use `Cloud Diary Carousel` as the home-page visual signature | It productizes the reference image's destination carousel and seasonal thumbnail strip. |
| Launch as multi-end | User confirmed multi-end as the first-release shape. |
| Use 高德 for maps | User confirmed 高德 as the map provider. |
| Use guest + local storage first | User confirmed no full account system is needed at MVP start. |
| Support public links in MVP sharing | User confirmed share links should be supported, not only local images. |
| Allow thumbnail upload for photo memory | User confirmed P1 album memory may upload thumbnails; original images remain opt-in. |
| Keep AI provider replaceable while locking JSON Schema output | User did not specify a model vendor, so this preserves implementation flexibility. |
| Use Next.js + TypeScript for the first runnable web/PWA shell | It matches the TODO default and gives a practical multi-end validation surface. |
| Keep Round 2-4 data local-first | This matches the confirmed guest + local storage strategy and allows the UI flow to be verified before backend services are introduced. |
| Represent public sharing as a generated URL in the result page for now | It proves the interaction contract before a server-side token store exists. |
| Store album memory thumbnail as a local data URL in the prototype | It validates the upload/preview UX while keeping original images out of scope. |
| Use in-memory stores for generation jobs and share links in this phase | It proves API contracts without introducing database setup before the core flow is settled. |
| Keep the visible generation UI stable while changing the state source to API polling | This avoids visual churn and lets backend contract work land cleanly. |
| Treat `/settings` as the local-first account bridge | It closes Round 9 without introducing real auth before sync infrastructure exists. |
| Push each completed development round to GitHub with a brief commit summary | The user requested upload after each follow-up update; if GitHub connectivity is unavailable, keep the local commit ready and retry push once the network is restored. |
| Expose route data through a normalized API instead of raw Gaode fields | Keeps the frontend portable and satisfies the Round 10 privacy/adapter boundary requirement. |
| Use a pending map panel when Gaode keys are absent | It improves route credibility without pretending unavailable provider data is confirmed. |
| Use Gaode Web Service as the China POI/route provider | The user provided a Gaode key and confirmed the China-first map stack. |
| Keep provider keys out of git | `.env.example` documents placeholders; real keys belong in `.env.local` or process environment only. |
| Use Open-Meteo for Round 12 weather recommendations | It fits the low-cost no-key P1 weekend recommendation scope. |
| Reserve OpenRouteService, Nominatim, Gemini, and Ollama behind adapters | Keeps international fallback, low-frequency geocoding, and AI provider choices replaceable. |
| Separate Gaode Web Service keys from browser JS API keys | Server routes use `AMAP_WEB_SERVICE_KEY`; browser map rendering uses `NEXT_PUBLIC_AMAP_JSAPI_KEY` and can safely fall back when absent. |
| Build photo memory as local-first thumbnail workflow | It satisfies P1 privacy constraints before platform photo-library integrations or server clustering are introduced. |
| Build Round 12 weather as Open-Meteo forecast adapter plus local transport-radius estimates | It validates the no-key weather loop now while keeping city-to-city routing replaceable by Gaode later. |
| Build Round 13 souvenirs as local-first 2.5D cards before real 3D | It validates emotional value and sharing without introducing heavy asset processing or commerce dependencies. |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Referenced image file was not found during the first pass at `D:\DEMO\Roamory\e565697a07772940ec7e69c9e899ccd6.png` | 1 | Superseded after the user provided the image; `DESIGN.md` and `TODO.md` now align to the reference. |
| Initial PRD terminal output was mojibake | 1 | Re-read using explicit UTF-8 console/output settings. |
| `git status --short` failed because the directory is not a git repository | 1 | Noted that no git diff/status is available. |
| npm audit reported moderate `postcss` issue through Next dependency chain | 1 | Added `postcss` override to `^8.5.10`; audit now reports 0 vulnerabilities. |
| Port 3000 was occupied by an older dev server with stale chunks | 1 | Started a clean dev server on `http://127.0.0.1:3001` and reran visual checks there. |
| Parallel `npm run typecheck` and `npm run build` raced on `.next/types` | 1 | Reran `npm run typecheck` after build completed; typecheck passed. Use serial commands for final verification. |
| Playwright bundled Chromium was unavailable | 1 | Used the installed Chrome channel for browser verification. |
| Browser requested missing `/favicon.ico` | 1 | Added `public/favicon.svg` and declared it in Next metadata. |
| Next dev hot reload hit a stale module after metadata change | 1 | Restarted the 3001 dev server cleanly before final browser verification. |
| Running `next build` while `next dev` served 3001 mixed development and production `.next` chunks | 1 | Stopped Roamory Next processes, verified `.next` was inside the workspace, removed the generated cache, restarted only the 3001 dev server, and reran timestamp-filtered browser checks. |
| Share poster default privacy caused a hydration mismatch after reading localStorage during initial render | 1 | Split static default poster privacy from client-mounted privacy settings and applied saved settings in `useEffect`. |
| `git push -u origin main` could not reach GitHub over port 443 | 2 | Local commit is complete; retry push after network connectivity to GitHub is restored. |
| Second-round push after route work still failed against GitHub over port 443 | 1 | Current local branch has both commits ready; retry `git push -u origin main` when the network recovers. |

## Notes
- Use `frontend-design` guidance for a distinctive, non-template visual direction.
- Do not overwrite the original `AI_Travel_Memory_PRD.md`; create refined root deliverables.
