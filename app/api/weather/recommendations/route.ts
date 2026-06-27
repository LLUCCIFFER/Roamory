import { NextResponse } from "next/server";

import { recommendWeekendTrips } from "../../../../lib/server/weather-recommendation-adapter";
import type { WeekendRecommendationRequest, WeekendTravelMode, WeatherMood } from "../../../../lib/weather-types";

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

  const recommendationRequest = readRecommendationRequest(body);
  if (!recommendationRequest) {
    return NextResponse.json(
      {
        errorCode: "INVALID_WEATHER_REQUEST",
        message: "缺少有效的天气推荐参数。"
      },
      { status: 400 }
    );
  }

  const result = await recommendWeekendTrips(recommendationRequest);
  return NextResponse.json(result);
}

export async function GET() {
  const result = await recommendWeekendTrips({
    departureCity: "上海",
    mood: "sunset",
    maxTravelMinutes: 180,
    travelMode: "public_transport"
  });
  return NextResponse.json(result);
}

function readRecommendationRequest(value: unknown): Partial<WeekendRecommendationRequest> | null {
  if (!isRecord(value)) return null;
  const mood = typeof value.mood === "string" && isWeatherMood(value.mood) ? value.mood : "sunset";
  const travelMode = typeof value.travelMode === "string" && isTravelMode(value.travelMode)
    ? value.travelMode
    : "public_transport";
  const maxTravelMinutes = typeof value.maxTravelMinutes === "number" ? value.maxTravelMinutes : 180;

  return {
    departureCity: typeof value.departureCity === "string" ? value.departureCity : "上海",
    mood,
    maxTravelMinutes,
    travelMode
  };
}

function isWeatherMood(value: string): value is WeatherMood {
  return value === "sunny" || value === "sunset" || value === "seaside" || value === "rainy-town" || value === "snow";
}

function isTravelMode(value: string): value is WeekendTravelMode {
  return value === "public_transport" || value === "driving";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
