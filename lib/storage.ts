export type TravelPace = "relaxed" | "balanced" | "intense";

export type CompanionType = "solo" | "couple" | "friends" | "family";

export type GuestDraft = {
  taskId: string;
  destination: string;
  departureCity: string;
  startDate: string;
  days: number;
  mood: string;
  budget: string;
  interests: string[];
  companionType: CompanionType;
  pace: TravelPace;
  transportModes: string[];
  mustVisit: string;
  avoid: string;
  freeText: string;
  savedAt: string;
};

export type GenerationTask = {
  id: string;
  status: "queued" | "processing" | "succeeded" | "failed";
  progress: number;
  tripId?: string;
  schemaVersion?: string;
  errorCode?: string;
  errorMessage?: string;
  draft: GuestDraft;
  createdAt: string;
  updatedAt: string;
};

export type SavedTripStop = {
  id: string;
  time: string;
  name: string;
  duration: string;
  transportToNext: string;
  tags: string[];
  note: string;
  locked: boolean;
  replaced: boolean;
  originalName?: string;
};

export type SavedTripDay = {
  day: number;
  title: string;
  budget: number;
  travelMinutes: number;
  stops: SavedTripStop[];
};

export type SavedTrip = {
  id: string;
  status: "draft" | "planned";
  title: string;
  destination: string;
  startDate: string;
  budget: number;
  travelMinutes: number;
  score: number;
  summary: string;
  warnings: string[];
  days: SavedTripDay[];
  revision: number;
  createdAt: string;
  updatedAt: string;
  savedAt?: string;
};

export type FootprintPrivacy = "private" | "public";

export type FootprintSource = "saved_trip" | "manual";

export type FootprintCity = {
  city: string;
  privacy: FootprintPrivacy;
  tripIds: string[];
  visitCount: number;
  firstLitAt: string;
  lastVisitedAt: string;
  source: FootprintSource;
  note?: string;
};

export type SharePosterTemplate = "diary" | "route" | "memory";

export type SharePosterPrivacy = {
  showBudget: boolean;
  showMap: boolean;
  showExactLocation: boolean;
  showExactTimes: boolean;
  showThumbnail: boolean;
};

export type SharePosterDraft = {
  tripId: string;
  template: SharePosterTemplate;
  privacy: SharePosterPrivacy;
  publicUrl?: string;
  publicToken?: string;
  exportedImage?: string;
  updatedAt: string;
};

export type UserProfile = {
  displayName: string;
  email: string;
  syncStatus: "guest" | "linked";
  createdAt: string;
  updatedAt: string;
};

export type PreferenceSettings = {
  departureCity: string;
  pace: TravelPace;
  companionType: CompanionType;
  budget: string;
  interests: string[];
};

export type PrivacySettings = {
  defaultShowBudget: boolean;
  defaultShowMap: boolean;
  defaultShowExactLocation: boolean;
  defaultShowExactTimes: boolean;
  analyticsOptIn: boolean;
};

export const guestDraftStorageKey = "roamory.guestDraft";
export const generationTaskStorageKey = "roamory.generationTask";
export const savedTripsStorageKey = "roamory.savedTrips";
export const footprintsStorageKey = "roamory.footprints";
export const userProfileStorageKey = "roamory.userProfile";
export const preferenceSettingsStorageKey = "roamory.preferenceSettings";
export const privacySettingsStorageKey = "roamory.privacySettings";
export const mockTripId = "mock-hangzhou";

export function albumThumbnailStorageKey(tripId: string) {
  return `roamory.albumThumbnail.${tripId}`;
}

export function sharePosterStorageKey(tripId: string) {
  return `roamory.sharePoster.${tripId}`;
}

export function makeTaskId() {
  return `gen_${Date.now().toString(36)}`;
}

export function saveGuestDraft(draft: GuestDraft) {
  window.localStorage.setItem(guestDraftStorageKey, JSON.stringify(draft));
}

export function readGuestDraft(): GuestDraft | null {
  const saved = window.localStorage.getItem(guestDraftStorageKey);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as GuestDraft;
  } catch {
    window.localStorage.removeItem(guestDraftStorageKey);
    return null;
  }
}

export function saveGenerationTask(task: GenerationTask) {
  window.localStorage.setItem(generationTaskStorageKey, JSON.stringify(task));
}

export function readGenerationTask(): GenerationTask | null {
  const saved = window.localStorage.getItem(generationTaskStorageKey);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as GenerationTask;
  } catch {
    window.localStorage.removeItem(generationTaskStorageKey);
    return null;
  }
}

export function createQueuedTask(draft: GuestDraft): GenerationTask {
  const now = new Date().toISOString();
  return {
    id: draft.taskId,
    status: "queued",
    progress: 0,
    draft,
    createdAt: now,
    updatedAt: now
  };
}

export function saveAlbumThumbnail(tripId: string, dataUrl: string) {
  window.localStorage.setItem(albumThumbnailStorageKey(tripId), dataUrl);
}

export function readAlbumThumbnail(tripId: string): string | null {
  return window.localStorage.getItem(albumThumbnailStorageKey(tripId));
}

export function deleteAlbumThumbnail(tripId: string) {
  window.localStorage.removeItem(albumThumbnailStorageKey(tripId));
}

export function defaultPreferenceSettings(): PreferenceSettings {
  return {
    departureCity: "上海",
    pace: "balanced",
    companionType: "friends",
    budget: "2000",
    interests: ["拍照", "美食", "慢游", "海边"]
  };
}

export function defaultPrivacySettings(): PrivacySettings {
  return {
    defaultShowBudget: false,
    defaultShowMap: false,
    defaultShowExactLocation: false,
    defaultShowExactTimes: false,
    analyticsOptIn: false
  };
}

export function readUserProfile(): UserProfile | null {
  const saved = window.localStorage.getItem(userProfileStorageKey);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved) as UserProfile;
    if (!parsed.displayName || !parsed.email) return null;
    return {
      ...parsed,
      syncStatus: parsed.syncStatus === "linked" ? "linked" : "guest"
    };
  } catch {
    window.localStorage.removeItem(userProfileStorageKey);
    return null;
  }
}

export function saveUserProfile(profile: Omit<UserProfile, "createdAt" | "updatedAt">) {
  const existing = readUserProfile();
  const now = new Date().toISOString();
  const nextProfile: UserProfile = {
    ...profile,
    displayName: profile.displayName.trim(),
    email: profile.email.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
  window.localStorage.setItem(userProfileStorageKey, JSON.stringify(nextProfile));
  return nextProfile;
}

export function clearUserProfile() {
  window.localStorage.removeItem(userProfileStorageKey);
}

export function readPreferenceSettings(): PreferenceSettings {
  if (typeof window === "undefined") return defaultPreferenceSettings();
  const saved = window.localStorage.getItem(preferenceSettingsStorageKey);
  if (!saved) return defaultPreferenceSettings();
  try {
    const parsed = JSON.parse(saved) as Partial<PreferenceSettings>;
    return {
      ...defaultPreferenceSettings(),
      ...parsed,
      interests: Array.isArray(parsed.interests)
        ? parsed.interests.filter((item): item is string => typeof item === "string")
        : defaultPreferenceSettings().interests
    };
  } catch {
    window.localStorage.removeItem(preferenceSettingsStorageKey);
    return defaultPreferenceSettings();
  }
}

export function savePreferenceSettings(settings: PreferenceSettings) {
  const nextSettings: PreferenceSettings = {
    ...settings,
    departureCity: settings.departureCity.trim() || defaultPreferenceSettings().departureCity,
    budget: settings.budget.trim() || defaultPreferenceSettings().budget,
    interests: settings.interests.map((item) => item.trim()).filter(Boolean)
  };
  window.localStorage.setItem(preferenceSettingsStorageKey, JSON.stringify(nextSettings));
  return nextSettings;
}

export function readPrivacySettings(): PrivacySettings {
  if (typeof window === "undefined") return defaultPrivacySettings();
  const saved = window.localStorage.getItem(privacySettingsStorageKey);
  if (!saved) return defaultPrivacySettings();
  try {
    const parsed = JSON.parse(saved) as Partial<PrivacySettings>;
    return {
      ...defaultPrivacySettings(),
      ...parsed,
      defaultShowBudget: parsed.defaultShowBudget === true,
      defaultShowMap: parsed.defaultShowMap === true,
      defaultShowExactLocation: parsed.defaultShowExactLocation === true,
      defaultShowExactTimes: parsed.defaultShowExactTimes === true,
      analyticsOptIn: parsed.analyticsOptIn === true
    };
  } catch {
    window.localStorage.removeItem(privacySettingsStorageKey);
    return defaultPrivacySettings();
  }
}

export function savePrivacySettings(settings: PrivacySettings) {
  window.localStorage.setItem(privacySettingsStorageKey, JSON.stringify(settings));
  return settings;
}

export function readSavedTrips(): SavedTrip[] {
  const saved = window.localStorage.getItem(savedTripsStorageKey);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved) as SavedTrip[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(savedTripsStorageKey);
    return [];
  }
}

export function readSavedTrip(tripId: string): SavedTrip | null {
  return readSavedTrips().find((trip) => trip.id === tripId) ?? null;
}

export function saveSavedTrip(trip: SavedTrip) {
  const trips = readSavedTrips();
  const nextTrips = [
    trip,
    ...trips.filter((item) => item.id !== trip.id)
  ];
  window.localStorage.setItem(savedTripsStorageKey, JSON.stringify(nextTrips));
}

export function deleteSavedTrip(tripId: string) {
  const trips = readSavedTrips().filter((trip) => trip.id !== tripId);
  window.localStorage.setItem(savedTripsStorageKey, JSON.stringify(trips));
  deleteAlbumThumbnail(tripId);
  deleteSharePosterDraft(tripId);
}

function normalizeCityName(city: string) {
  return city.trim();
}

function cityKey(city: string) {
  return normalizeCityName(city).toLocaleLowerCase();
}

function sortFootprints(footprints: FootprintCity[]) {
  return [...footprints].sort((a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt));
}

export function readFootprints(): FootprintCity[] {
  const saved = window.localStorage.getItem(footprintsStorageKey);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved) as FootprintCity[];
    return Array.isArray(parsed) ? sortFootprints(parsed.filter((item) => item.city)) : [];
  } catch {
    window.localStorage.removeItem(footprintsStorageKey);
    return [];
  }
}

export function readFootprintCity(city: string): FootprintCity | null {
  const key = cityKey(city);
  if (!key) return null;
  return readFootprints().find((item) => cityKey(item.city) === key) ?? null;
}

export function saveFootprintCity(footprint: FootprintCity) {
  const normalizedCity = normalizeCityName(footprint.city);
  if (!normalizedCity) return;

  const footprints = readFootprints();
  const nextFootprints = sortFootprints([
    {
      ...footprint,
      city: normalizedCity,
      tripIds: Array.from(new Set(footprint.tripIds))
    },
    ...footprints.filter((item) => cityKey(item.city) !== cityKey(normalizedCity))
  ]);
  window.localStorage.setItem(footprintsStorageKey, JSON.stringify(nextFootprints));
}

export function lightFootprintCity({
  city,
  tripId,
  visitedAt,
  source = "manual",
  privacy = "private",
  note
}: {
  city: string;
  tripId?: string;
  visitedAt?: string;
  source?: FootprintSource;
  privacy?: FootprintPrivacy;
  note?: string;
}): FootprintCity | null {
  const normalizedCity = normalizeCityName(city);
  if (!normalizedCity) return null;

  const now = visitedAt || new Date().toISOString();
  const existing = readFootprintCity(normalizedCity);
  const nextTripIds = tripId
    ? Array.from(new Set([...(existing?.tripIds ?? []), tripId]))
    : existing?.tripIds ?? [];
  const visitCount = tripId
    ? Math.max(existing?.visitCount ?? 0, nextTripIds.length, 1)
    : (existing?.visitCount ?? 0) + 1;

  const footprint: FootprintCity = {
    city: existing?.city ?? normalizedCity,
    privacy: existing?.privacy ?? privacy,
    tripIds: nextTripIds,
    visitCount,
    firstLitAt: existing?.firstLitAt ?? now,
    lastVisitedAt: now,
    source: source === "saved_trip" || existing?.source === "saved_trip" ? "saved_trip" : "manual",
    note: note ?? existing?.note
  };

  saveFootprintCity(footprint);
  return footprint;
}

export function toggleFootprintPrivacy(city: string): FootprintCity | null {
  const existing = readFootprintCity(city);
  if (!existing) return null;
  const nextFootprint: FootprintCity = {
    ...existing,
    privacy: existing.privacy === "private" ? "public" : "private"
  };
  saveFootprintCity(nextFootprint);
  return nextFootprint;
}

export function deleteFootprintCity(city: string) {
  const key = cityKey(city);
  const footprints = readFootprints().filter((item) => cityKey(item.city) !== key);
  window.localStorage.setItem(footprintsStorageKey, JSON.stringify(footprints));
}

export function defaultSharePosterPrivacy(): SharePosterPrivacy {
  return {
    showBudget: false,
    showMap: false,
    showExactLocation: false,
    showExactTimes: false,
    showThumbnail: true
  };
}

export function readDefaultSharePosterPrivacy(): SharePosterPrivacy {
  const privacySettings = readPrivacySettings();
  return {
    showBudget: privacySettings.defaultShowBudget,
    showMap: privacySettings.defaultShowMap,
    showExactLocation: privacySettings.defaultShowExactLocation,
    showExactTimes: privacySettings.defaultShowExactTimes,
    showThumbnail: true
  };
}

export function readSharePosterDraft(tripId: string): SharePosterDraft | null {
  const saved = window.localStorage.getItem(sharePosterStorageKey(tripId));
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved) as SharePosterDraft;
    if (parsed.tripId !== tripId) return null;
    return {
      ...parsed,
      template: parsed.template ?? "diary",
      privacy: {
        ...defaultSharePosterPrivacy(),
        ...parsed.privacy
      }
    };
  } catch {
    window.localStorage.removeItem(sharePosterStorageKey(tripId));
    return null;
  }
}

export function saveSharePosterDraft(draft: SharePosterDraft) {
  window.localStorage.setItem(
    sharePosterStorageKey(draft.tripId),
    JSON.stringify({
      ...draft,
      updatedAt: new Date().toISOString()
    })
  );
}

export function readSharePosterDrafts(): SharePosterDraft[] {
  const drafts: SharePosterDraft[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith("roamory.sharePoster.")) continue;
    const tripId = key.replace("roamory.sharePoster.", "");
    const draft = readSharePosterDraft(tripId);
    if (draft) drafts.push(draft);
  }
  return drafts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function deleteSharePosterDraft(tripId: string) {
  window.localStorage.removeItem(sharePosterStorageKey(tripId));
}

export function clearRoamoryLocalData() {
  const keys: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith("roamory.")) keys.push(key);
  }
  keys.forEach((key) => window.localStorage.removeItem(key));
}
