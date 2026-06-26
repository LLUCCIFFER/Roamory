export type RouteProvider = "gaode" | "mock";

export type RouteStatus = "confirmed" | "pending";

export type RouteMode = "walk" | "transit" | "taxi" | "mixed";

export type GeoPoint = {
  lng: number;
  lat: number;
};

export type RouteStopInput = {
  id: string;
  name: string;
  city: string;
  time?: string;
};

export type NormalizedPoi = {
  stopId: string;
  name: string;
  city: string;
  location: GeoPoint;
  confidence: "seeded" | "estimated" | "gaode";
};

export type NormalizedRouteLeg = {
  fromStopId: string;
  toStopId: string;
  mode: RouteMode;
  minutes: number | null;
  distanceMeters: number | null;
  label: string;
  status: RouteStatus;
  provider: RouteProvider;
  polyline: GeoPoint[];
  note?: string;
};

export type RouteCalculationRequest = {
  tripId: string;
  city: string;
  dayIndex: number;
  stops: RouteStopInput[];
};

export type RouteCalculationResult = {
  cacheKey: string;
  provider: RouteProvider;
  status: RouteStatus;
  generatedAt: string;
  city: string;
  pois: NormalizedPoi[];
  legs: NormalizedRouteLeg[];
  summary: {
    totalMinutes: number | null;
    totalDistanceMeters: number | null;
    pendingReason?: string;
  };
};
