import { NextResponse } from "next/server";

import { calculateRoute } from "../../../../lib/server/gaode-route-adapter";
import type { RouteCalculationRequest, RouteStopInput } from "../../../../lib/route-types";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        errorCode: "INVALID_JSON",
        message: "请求体必须是 JSON。"
      },
      { status: 400 }
    );
  }

  const routeRequest = readRouteRequest(body);
  if (!routeRequest) {
    return NextResponse.json(
      {
        errorCode: "INVALID_ROUTE_REQUEST",
        message: "缺少有效的路线计算参数。"
      },
      { status: 400 }
    );
  }

  const route = await calculateRoute(routeRequest);
  return NextResponse.json({ route });
}

function readRouteRequest(value: unknown): RouteCalculationRequest | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.tripId !== "string" ||
    typeof value.city !== "string" ||
    typeof value.dayIndex !== "number" ||
    !Array.isArray(value.stops)
  ) {
    return null;
  }

  const stops = value.stops.map(readStop).filter((stop): stop is RouteStopInput => Boolean(stop));
  if (stops.length !== value.stops.length || stops.length < 2) return null;

  return {
    tripId: value.tripId,
    city: value.city,
    dayIndex: value.dayIndex,
    stops
  };
}

function readStop(value: unknown): RouteStopInput | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string" || typeof value.city !== "string") {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    city: value.city,
    time: typeof value.time === "string" ? value.time : undefined
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
