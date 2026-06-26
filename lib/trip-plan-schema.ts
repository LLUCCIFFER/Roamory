import { mockTrip } from "./mock-data";
import type { GuestDraft } from "./storage";

export type RouteStatus = "confirmed" | "pending";
export type SourceProvider = "mock" | "gaode" | "user";

export type TripPlanStop = {
  id: string;
  time: string;
  name: string;
  durationMinutes: number;
  durationLabel: string;
  transportToNext: {
    mode: "walking" | "public_transport" | "taxi" | "driving" | "mixed" | "none";
    minutes: number | null;
    label: string;
    provider: SourceProvider;
    status: RouteStatus;
  };
  tags: string[];
  note: string;
  source: {
    provider: SourceProvider;
    status: RouteStatus;
    poiId?: string;
    coordinate?: {
      lat: number;
      lng: number;
    };
  };
};

export type TripPlanDay = {
  day: number;
  title: string;
  budgetCny: number;
  travelMinutes: number;
  stops: TripPlanStop[];
};

export type TripPlan = {
  schemaVersion: "trip-plan.v1";
  id: string;
  title: string;
  destination: string;
  startDate: string;
  daysCount: number;
  budgetCny: number;
  travelMinutes: number;
  score: number;
  summary: string;
  warnings: string[];
  routeProvider: "gaode" | "mock";
  routeStatus: RouteStatus;
  days: TripPlanDay[];
};

export type TripPlanValidationResult =
  | { ok: true; plan: TripPlan; errors: [] }
  | { ok: false; plan?: never; errors: string[] };

export const tripPlanJsonSchema = {
  $id: "https://roamory.local/schema/trip-plan.v1.json",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Roamory TripPlan",
  type: "object",
  additionalProperties: false,
  required: [
    "schemaVersion",
    "id",
    "title",
    "destination",
    "startDate",
    "daysCount",
    "budgetCny",
    "travelMinutes",
    "score",
    "summary",
    "warnings",
    "routeProvider",
    "routeStatus",
    "days"
  ],
  properties: {
    schemaVersion: { const: "trip-plan.v1" },
    id: { type: "string", minLength: 1 },
    title: { type: "string", minLength: 1 },
    destination: { type: "string", minLength: 1 },
    startDate: { type: "string", minLength: 8 },
    daysCount: { type: "integer", minimum: 1, maximum: 14 },
    budgetCny: { type: "integer", minimum: 0 },
    travelMinutes: { type: "integer", minimum: 0 },
    score: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string", minLength: 1 },
    warnings: { type: "array", items: { type: "string" } },
    routeProvider: { enum: ["gaode", "mock"] },
    routeStatus: { enum: ["confirmed", "pending"] },
    days: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["day", "title", "budgetCny", "travelMinutes", "stops"],
        properties: {
          day: { type: "integer", minimum: 1 },
          title: { type: "string", minLength: 1 },
          budgetCny: { type: "integer", minimum: 0 },
          travelMinutes: { type: "integer", minimum: 0 },
          stops: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: [
                "id",
                "time",
                "name",
                "durationMinutes",
                "durationLabel",
                "transportToNext",
                "tags",
                "note",
                "source"
              ]
            }
          }
        }
      }
    }
  }
} as const;

export function validateTripPlan(input: unknown): TripPlanValidationResult {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: ["TripPlan must be an object."] };
  }

  requireString(input, "schemaVersion", errors);
  requireString(input, "id", errors);
  requireString(input, "title", errors);
  requireString(input, "destination", errors);
  requireString(input, "startDate", errors);
  requireNumber(input, "daysCount", errors);
  requireNumber(input, "budgetCny", errors);
  requireNumber(input, "travelMinutes", errors);
  requireNumber(input, "score", errors);
  requireString(input, "summary", errors);

  if (input.schemaVersion !== "trip-plan.v1") {
    errors.push("schemaVersion must be trip-plan.v1.");
  }

  if (!Array.isArray(input.warnings) || !input.warnings.every((item) => typeof item === "string")) {
    errors.push("warnings must be a string array.");
  }

  if (input.routeProvider !== "gaode" && input.routeProvider !== "mock") {
    errors.push("routeProvider must be gaode or mock.");
  }

  if (input.routeStatus !== "confirmed" && input.routeStatus !== "pending") {
    errors.push("routeStatus must be confirmed or pending.");
  }

  if (!Array.isArray(input.days) || input.days.length < 1) {
    errors.push("days must contain at least one day.");
  } else {
    input.days.forEach((day, dayIndex) => validateDay(day, dayIndex, errors));
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, plan: input as TripPlan, errors: [] };
}

export function buildMockTripPlan(draft?: Partial<GuestDraft>): TripPlan {
  const requestedDestination = draft?.destination?.trim() || mockTrip.destination;
  const daysCount = clampInteger(draft?.days ?? mockTrip.days.length, 1, mockTrip.days.length);
  const budgetCny = Number.parseInt(String(draft?.budget ?? mockTrip.budget), 10) || mockTrip.budget;
  const selectedDays = mockTrip.days.slice(0, daysCount);

  return {
    schemaVersion: "trip-plan.v1",
    id: mockTrip.id,
    title: `${requestedDestination} ${daysCount} 日慢游计划`,
    destination: requestedDestination,
    startDate: draft?.startDate || mockTrip.startDate,
    daysCount,
    budgetCny,
    travelMinutes: selectedDays.reduce((sum, day) => sum + day.travelMinutes, 0),
    score: mockTrip.score,
    summary: buildSummary(requestedDestination, draft),
    warnings: mockTrip.warnings,
    routeProvider: "mock",
    routeStatus: "pending",
    days: selectedDays.map((day) => ({
      day: day.day,
      title: day.title,
      budgetCny: day.budget,
      travelMinutes: day.travelMinutes,
      stops: day.stops.map((stop, stopIndex) => ({
        id: `d${day.day}-s${stopIndex + 1}`,
        time: stop.time,
        name: stop.name,
        durationMinutes: parseMinutes(stop.duration),
        durationLabel: stop.duration,
        transportToNext: {
          mode: inferTransportMode(stop.transportToNext),
          minutes: parseMinutes(stop.transportToNext),
          label: stop.transportToNext,
          provider: "mock",
          status: "pending"
        },
        tags: stop.tags,
        note: stop.note,
        source: {
          provider: "mock",
          status: "pending"
        }
      }))
    }))
  };
}

function validateDay(input: unknown, index: number, errors: string[]) {
  if (!isRecord(input)) {
    errors.push(`days[${index}] must be an object.`);
    return;
  }

  requireNumber(input, "day", errors, `days[${index}]`);
  requireString(input, "title", errors, `days[${index}]`);
  requireNumber(input, "budgetCny", errors, `days[${index}]`);
  requireNumber(input, "travelMinutes", errors, `days[${index}]`);

  if (!Array.isArray(input.stops) || input.stops.length < 1) {
    errors.push(`days[${index}].stops must contain at least one stop.`);
    return;
  }

  input.stops.forEach((stop, stopIndex) => validateStop(stop, index, stopIndex, errors));
}

function validateStop(input: unknown, dayIndex: number, stopIndex: number, errors: string[]) {
  const path = `days[${dayIndex}].stops[${stopIndex}]`;
  if (!isRecord(input)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  requireString(input, "id", errors, path);
  requireString(input, "time", errors, path);
  requireString(input, "name", errors, path);
  requireNumber(input, "durationMinutes", errors, path);
  requireString(input, "durationLabel", errors, path);
  requireString(input, "note", errors, path);

  if (!Array.isArray(input.tags) || !input.tags.every((item) => typeof item === "string")) {
    errors.push(`${path}.tags must be a string array.`);
  }

  if (!isRecord(input.transportToNext)) {
    errors.push(`${path}.transportToNext must be an object.`);
  } else {
    requireString(input.transportToNext, "label", errors, `${path}.transportToNext`);
    if (input.transportToNext.minutes !== null && typeof input.transportToNext.minutes !== "number") {
      errors.push(`${path}.transportToNext.minutes must be number or null.`);
    }
  }

  if (!isRecord(input.source)) {
    errors.push(`${path}.source must be an object.`);
  }
}

function requireString(
  input: Record<string, unknown>,
  key: string,
  errors: string[],
  path = "TripPlan"
) {
  if (typeof input[key] !== "string" || String(input[key]).trim().length === 0) {
    errors.push(`${path}.${key} must be a non-empty string.`);
  }
}

function requireNumber(
  input: Record<string, unknown>,
  key: string,
  errors: string[],
  path = "TripPlan"
) {
  if (typeof input[key] !== "number" || Number.isNaN(input[key])) {
    errors.push(`${path}.${key} must be a number.`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMinutes(value: string) {
  const match = value.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function inferTransportMode(value: string): TripPlanStop["transportToNext"]["mode"] {
  if (value.includes("今日结束")) return "none";
  if (value.includes("打车")) return "taxi";
  if (value.includes("公交") || value.includes("地铁")) return "public_transport";
  if (value.includes("自驾")) return "driving";
  if (value.includes("步行")) return "walking";
  return "mixed";
}

function clampInteger(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.round(value), min), max);
}

function buildSummary(destination: string, draft?: Partial<GuestDraft>) {
  const interests = draft?.interests?.length ? draft.interests.slice(0, 4).join("、") : "拍照、美食、寺庙和咖啡";
  const pace = draft?.pace === "relaxed" ? "松弛" : draft?.pace === "intense" ? "紧凑" : "均衡";
  return `适合喜欢${interests}的${pace}路线。默认以公共交通和步行为主，路线时间待高德校准后确认。`;
}
