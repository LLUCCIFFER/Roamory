import type {
  GeoPoint,
  NormalizedPoi,
  NormalizedRouteLeg,
  RouteCalculationRequest,
  RouteCalculationResult,
  RouteMode,
  RouteProvider,
  RouteStatus
} from "../route-types";

type GaodeWalkingResponse = {
  status?: string;
  route?: {
    paths?: Array<{
      distance?: string;
      duration?: string;
      steps?: Array<{ polyline?: string }>;
    }>;
  };
};

type GaodeTransitResponse = {
  status?: string;
  route?: {
    transits?: Array<{
      distance?: string;
      duration?: string;
      segments?: Array<{
        walking?: {
          steps?: Array<{ polyline?: string }>;
        };
      }>;
    }>;
  };
};

type GaodeDrivingResponse = {
  status?: string;
  route?: {
    paths?: Array<{
      distance?: string;
      duration?: string;
      steps?: Array<{ polyline?: string }>;
    }>;
  };
};

type GaodePoiSearchResponse = {
  status?: string;
  pois?: Array<{
    name?: string;
    cityname?: string | string[];
    adname?: string;
    location?: string;
  }>;
};

const routeCache = new Map<string, RouteCalculationResult>();

const seededPois: Record<string, GeoPoint> = {
  "西湖": { lng: 120.1432, lat: 30.2592 },
  "浙江省博物馆": { lng: 120.1465, lat: 30.2587 },
  "湖滨步行街": { lng: 120.1655, lat: 30.2554 },
  "灵隐寺": { lng: 120.1021, lat: 30.2401 },
  "龙井村": { lng: 120.1002, lat: 30.2212 },
  "中国茶叶博物馆": { lng: 120.1035, lat: 30.2297 },
  "南山路夜景": { lng: 120.1519, lat: 30.2441 },
  "馒头山社区": { lng: 120.1573, lat: 30.2241 },
  "小河直街": { lng: 120.1487, lat: 30.3139 },
  "桥西历史文化街区": { lng: 120.143, lat: 30.3228 },
  "大兜路历史街区": { lng: 120.1481, lat: 30.3108 }
};

export async function calculateRoute(request: RouteCalculationRequest): Promise<RouteCalculationResult> {
  const gaodeKey = getGaodeKey();
  const cacheKey = `${createRouteCacheKey(request)}:${gaodeKey ? "gaode" : "fallback"}:v2`;
  const cached = routeCache.get(cacheKey);
  if (cached) return cached;

  const pois = await Promise.all(request.stops.map((stop, index) => resolvePoi(stop, index, gaodeKey)));
  const legs: NormalizedRouteLeg[] = [];

  for (let index = 0; index < pois.length - 1; index += 1) {
    const from = pois[index];
    const to = pois[index + 1];
    const distance = calculateDistanceMeters(from.location, to.location);
    const mode = inferMode(distance);
    const leg = gaodeKey
      ? await calculateGaodeLeg(from, to, mode, request.city, gaodeKey).catch(() => createFallbackLeg(from, to, mode))
      : createFallbackLeg(from, to, mode);
    legs.push(leg);
  }

  const status: RouteStatus = legs.length > 0 && legs.every((leg) => leg.status === "confirmed")
    ? "confirmed"
    : "pending";
  const provider: RouteProvider = status === "confirmed" ? "gaode" : "mock";
  const totalMinutes = sumNullable(legs.map((leg) => leg.minutes));
  const totalDistanceMeters = sumNullable(legs.map((leg) => leg.distanceMeters));

  const result: RouteCalculationResult = {
    cacheKey,
    provider,
    status,
    generatedAt: new Date().toISOString(),
    city: request.city,
    pois,
    legs,
    summary: {
      totalMinutes,
      totalDistanceMeters,
      pendingReason: status === "pending" ? "高德 Key 未配置或接口暂不可用，已保留待确认路线。" : undefined
    }
  };

  routeCache.set(cacheKey, result);
  return result;
}

export function createRouteCacheKey(request: RouteCalculationRequest) {
  const stopsKey = request.stops.map((stop) => `${stop.id}:${stop.name}`).join(">");
  return `${request.tripId}:${request.dayIndex}:${request.city}:${stopsKey}`;
}

async function resolvePoi(
  stop: RouteCalculationRequest["stops"][number],
  index: number,
  gaodeKey: string | undefined
): Promise<NormalizedPoi> {
  if (gaodeKey) {
    const gaodePoi = await searchGaodePoi(stop, gaodeKey).catch(() => null);
    if (gaodePoi) return gaodePoi;
  }

  const seeded = seededPois[stop.name];
  const location = seeded ?? estimateCityPoint(index);
  return {
    stopId: stop.id,
    name: stop.name,
    city: stop.city,
    location,
    confidence: seeded ? "seeded" : "estimated"
  };
}

async function searchGaodePoi(
  stop: RouteCalculationRequest["stops"][number],
  gaodeKey: string
): Promise<NormalizedPoi | null> {
  const url = new URL("https://restapi.amap.com/v3/place/text");
  url.searchParams.set("keywords", stop.name);
  url.searchParams.set("city", stop.city);
  url.searchParams.set("citylimit", "true");
  url.searchParams.set("offset", "1");
  url.searchParams.set("page", "1");
  url.searchParams.set("extensions", "base");
  url.searchParams.set("key", gaodeKey);

  const response = await fetch(url);
  const payload = (await response.json()) as GaodePoiSearchResponse;
  const poi = payload.pois?.[0];
  const location = parseLocation(poi?.location);
  if (!response.ok || payload.status !== "1" || !poi || !location) return null;

  return {
    stopId: stop.id,
    name: poi.name ?? stop.name,
    city: normalizeGaodeText(poi.cityname) || stop.city,
    location,
    confidence: "gaode"
  };
}

async function calculateGaodeLeg(
  from: NormalizedPoi,
  to: NormalizedPoi,
  mode: RouteMode,
  city: string,
  gaodeKey: string
): Promise<NormalizedRouteLeg> {
  if (mode === "walk") {
    return calculateWalkingLeg(from, to, gaodeKey);
  }
  if (mode === "taxi") {
    return calculateDrivingLeg(from, to, gaodeKey);
  }
  return calculateTransitLeg(from, to, city, gaodeKey);
}

async function calculateWalkingLeg(
  from: NormalizedPoi,
  to: NormalizedPoi,
  gaodeKey: string
): Promise<NormalizedRouteLeg> {
  const url = new URL("https://restapi.amap.com/v3/direction/walking");
  url.searchParams.set("origin", formatPoint(from.location));
  url.searchParams.set("destination", formatPoint(to.location));
  url.searchParams.set("key", gaodeKey);

  const response = await fetch(url);
  const payload = (await response.json()) as GaodeWalkingResponse;
  const path = payload.route?.paths?.[0];
  if (!response.ok || payload.status !== "1" || !path) {
    throw new Error("Gaode walking route failed.");
  }

  const minutes = secondsToMinutes(path.duration);
  const distanceMeters = parseNumber(path.distance);
  return createLeg({
    from,
    to,
    mode: "walk",
    provider: "gaode",
    status: "confirmed",
    minutes,
    distanceMeters,
    polyline: parsePolyline(path.steps?.flatMap((step) => step.polyline ? [step.polyline] : []) ?? []),
    note: "高德步行路径已确认。"
  });
}

async function calculateTransitLeg(
  from: NormalizedPoi,
  to: NormalizedPoi,
  city: string,
  gaodeKey: string
): Promise<NormalizedRouteLeg> {
  const url = new URL("https://restapi.amap.com/v3/direction/transit/integrated");
  url.searchParams.set("origin", formatPoint(from.location));
  url.searchParams.set("destination", formatPoint(to.location));
  url.searchParams.set("city", city);
  url.searchParams.set("key", gaodeKey);

  const response = await fetch(url);
  const payload = (await response.json()) as GaodeTransitResponse;
  const transit = payload.route?.transits?.[0];
  if (!response.ok || payload.status !== "1" || !transit) {
    throw new Error("Gaode transit route failed.");
  }

  const minutes = secondsToMinutes(transit.duration);
  const distanceMeters = parseNumber(transit.distance);
  const polyline = parsePolyline(
    transit.segments?.flatMap((segment) =>
      segment.walking?.steps?.flatMap((step) => step.polyline ? [step.polyline] : []) ?? []
    ) ?? []
  );

  return createLeg({
    from,
    to,
    mode: "transit",
    provider: "gaode",
    status: "confirmed",
    minutes,
    distanceMeters,
    polyline,
    note: "高德公交路径已确认。"
  });
}

async function calculateDrivingLeg(
  from: NormalizedPoi,
  to: NormalizedPoi,
  gaodeKey: string
): Promise<NormalizedRouteLeg> {
  const url = new URL("https://restapi.amap.com/v3/direction/driving");
  url.searchParams.set("origin", formatPoint(from.location));
  url.searchParams.set("destination", formatPoint(to.location));
  url.searchParams.set("key", gaodeKey);

  const response = await fetch(url);
  const payload = (await response.json()) as GaodeDrivingResponse;
  const path = payload.route?.paths?.[0];
  if (!response.ok || payload.status !== "1" || !path) {
    throw new Error("Gaode driving route failed.");
  }

  const minutes = secondsToMinutes(path.duration);
  const distanceMeters = parseNumber(path.distance);
  return createLeg({
    from,
    to,
    mode: "taxi",
    provider: "gaode",
    status: "confirmed",
    minutes,
    distanceMeters,
    polyline: parsePolyline(path.steps?.flatMap((step) => step.polyline ? [step.polyline] : []) ?? []),
    note: "高德驾车路径已确认。"
  });
}

function createFallbackLeg(from: NormalizedPoi, to: NormalizedPoi, mode: RouteMode): NormalizedRouteLeg {
  const distanceMeters = calculateDistanceMeters(from.location, to.location);
  const minutes = estimateMinutes(distanceMeters, mode);
  return createLeg({
    from,
    to,
    mode,
    provider: "mock",
    status: "pending",
    minutes,
    distanceMeters,
    polyline: [from.location, to.location],
    note: "待高德接口确认。"
  });
}

function createLeg({
  distanceMeters,
  from,
  minutes,
  mode,
  note,
  polyline,
  provider,
  status,
  to
}: {
  from: NormalizedPoi;
  to: NormalizedPoi;
  mode: RouteMode;
  provider: RouteProvider;
  status: RouteStatus;
  minutes: number | null;
  distanceMeters: number | null;
  polyline: GeoPoint[];
  note?: string;
}): NormalizedRouteLeg {
  return {
    fromStopId: from.stopId,
    toStopId: to.stopId,
    mode,
    minutes,
    distanceMeters,
    label: `${status === "pending" ? "待确认 · " : ""}${modeLabel(mode)} ${minutes ?? "?"} 分钟`,
    status,
    provider,
    polyline: polyline.length >= 2 ? polyline : [from.location, to.location],
    note
  };
}

function inferMode(distanceMeters: number): RouteMode {
  if (distanceMeters <= 1300) return "walk";
  if (distanceMeters <= 5200) return "transit";
  return "taxi";
}

function estimateMinutes(distanceMeters: number, mode: RouteMode) {
  const metersPerMinute = mode === "walk" ? 72 : mode === "taxi" ? 310 : 190;
  return Math.max(8, Math.round(distanceMeters / metersPerMinute));
}

function calculateDistanceMeters(a: GeoPoint, b: GeoPoint) {
  const earthRadius = 6371000;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(2 * earthRadius * Math.asin(Math.sqrt(h)));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function estimateCityPoint(index: number): GeoPoint {
  return {
    lng: 120.1432 + index * 0.011,
    lat: 30.2592 - index * 0.008
  };
}

function formatPoint(point: GeoPoint) {
  return `${point.lng},${point.lat}`;
}

function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseLocation(value: string | undefined): GeoPoint | null {
  if (!value) return null;
  const [lng, lat] = value.split(",").map(Number);
  return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat } : null;
}

function normalizeGaodeText(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.find(Boolean) ?? "";
  return value ?? "";
}

function secondsToMinutes(value: string | undefined): number | null {
  const seconds = parseNumber(value);
  return seconds === null ? null : Math.max(1, Math.round(seconds / 60));
}

function parsePolyline(values: string[]): GeoPoint[] {
  return values
    .flatMap((value) => value.split(";"))
    .map((pair) => {
      const [lng, lat] = pair.split(",").map(Number);
      return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat } : null;
    })
    .filter((point): point is GeoPoint => Boolean(point));
}

function modeLabel(mode: RouteMode) {
  if (mode === "walk") return "步行";
  if (mode === "taxi") return "打车";
  if (mode === "transit") return "公交/地铁";
  return "步行/公交";
}

function getGaodeKey() {
  return process.env.AMAP_WEB_SERVICE_KEY || process.env.GAODE_WEB_SERVICE_KEY;
}

function sumNullable(values: Array<number | null>) {
  if (values.some((value) => value === null)) return null;
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}
