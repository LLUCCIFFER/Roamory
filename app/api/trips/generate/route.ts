import { NextResponse } from "next/server";

import {
  createGenerationJob,
  toGenerationJobResponse
} from "../../../../lib/server/generation-store";
import { tripPlanJsonSchema } from "../../../../lib/trip-plan-schema";
import type { GuestDraft } from "../../../../lib/storage";

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

  const draft = readDraft(body);
  if (!draft) {
    return NextResponse.json(
      {
        errorCode: "INVALID_DRAFT",
        message: "缺少有效的游客行程草稿。"
      },
      { status: 400 }
    );
  }

  const job = await createGenerationJob(draft);

  return NextResponse.json(
    {
      schemaVersion: tripPlanJsonSchema.$id,
      task: toGenerationJobResponse(job)
    },
    { status: job.status === "failed" ? 422 : 202 }
  );
}

function readDraft(body: unknown): GuestDraft | null {
  if (!isRecord(body)) return null;
  const candidate = isRecord(body.draft) ? body.draft : body;
  if (!isGuestDraft(candidate)) return null;
  return candidate;
}

function isGuestDraft(value: Record<string, unknown>): value is GuestDraft {
  return (
    typeof value.taskId === "string" &&
    typeof value.destination === "string" &&
    typeof value.departureCity === "string" &&
    typeof value.startDate === "string" &&
    typeof value.days === "number" &&
    typeof value.mood === "string" &&
    typeof value.budget === "string" &&
    Array.isArray(value.interests) &&
    value.interests.every((item) => typeof item === "string") &&
    typeof value.companionType === "string" &&
    typeof value.pace === "string" &&
    Array.isArray(value.transportModes) &&
    value.transportModes.every((item) => typeof item === "string") &&
    typeof value.mustVisit === "string" &&
    typeof value.avoid === "string" &&
    typeof value.freeText === "string" &&
    typeof value.savedAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
