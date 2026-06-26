import { NextResponse } from "next/server";

import {
  createShareLink,
  type SharePrivacy
} from "../../../lib/server/share-store";

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

  if (!isRecord(body) || typeof body.tripId !== "string" || !body.tripId.trim()) {
    return NextResponse.json(
      {
        errorCode: "INVALID_TRIP",
        message: "缺少有效的行程 ID。"
      },
      { status: 400 }
    );
  }

  const privacy = normalizePrivacy(body.privacy);
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const shareLink = createShareLink({
    origin,
    tripId: body.tripId,
    privacy
  });

  return NextResponse.json({ shareLink }, { status: 201 });
}

function normalizePrivacy(value: unknown): SharePrivacy {
  if (!isRecord(value)) {
    return {
      showBudget: false,
      showExactTimes: false,
      showExactLocation: false,
      showMap: false,
      showThumbnail: true
    };
  }

  return {
    showBudget: value.showBudget === true,
    showExactTimes: value.showExactTimes === true,
    showExactLocation: value.showExactLocation === true,
    showMap: value.showMap === true,
    showThumbnail: value.showThumbnail !== false
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
