import "server-only";

import type { GuestDraft, GenerationTask } from "../storage";
import { tripPlanJsonSchema, type TripPlan } from "../trip-plan-schema";
import {
  generateValidatedTripPlan,
  LlmConfigurationError,
  LlmProviderError,
  type TravelGenerationProvider,
  TripPlanValidationError
} from "./llm-adapter";

export type GenerationJob = {
  id: string;
  status: GenerationTask["status"];
  progress: number;
  draft: GuestDraft;
  tripId?: string;
  tripPlan?: TripPlan;
  schemaVersion: string;
  repaired: boolean;
  validationErrors: string[];
  provider: TravelGenerationProvider;
  adapterName: string;
  model?: string;
  fallbackUsed: boolean;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  createdAtMs: number;
  readyAtMs: number;
};

export type GenerationJobResponse = Omit<GenerationJob, "createdAtMs" | "readyAtMs">;

const generationDurationMs = 3200;

const globalForGeneration = globalThis as typeof globalThis & {
  __roamoryGenerationJobs?: Map<string, GenerationJob>;
};

const generationJobs =
  globalForGeneration.__roamoryGenerationJobs ??
  new Map<string, GenerationJob>();

globalForGeneration.__roamoryGenerationJobs = generationJobs;

export async function createGenerationJob(draft: GuestDraft) {
  const existingJob = generationJobs.get(draft.taskId);
  if (existingJob) return updateGenerationProgress(existingJob);

  const nowMs = Date.now();
  const now = new Date(nowMs).toISOString();
  const baseJob: GenerationJob = {
    id: draft.taskId,
    status: "processing",
    progress: 12,
    draft,
    schemaVersion: String(tripPlanJsonSchema.$id),
    repaired: false,
    validationErrors: [],
    provider: "mock",
    adapterName: "pending",
    fallbackUsed: false,
    createdAt: now,
    updatedAt: now,
    createdAtMs: nowMs,
    readyAtMs: nowMs + generationDurationMs
  };

  try {
    if (!draft.destination.trim()) {
      throw new GenerationInputError("INVALID_DESTINATION", "目的地不能为空。");
    }

    const output = await generateValidatedTripPlan({ draft });
    const job: GenerationJob = {
      ...baseJob,
      tripPlan: output.tripPlan,
      tripId: output.tripPlan.id,
      repaired: output.repaired,
      validationErrors: output.validationErrors,
      provider: output.provider,
      adapterName: output.adapterName,
      model: output.model,
      fallbackUsed: output.fallbackUsed
    };
    generationJobs.set(job.id, job);
    return updateGenerationProgress(job);
  } catch (error) {
    const failedJob: GenerationJob = {
      ...baseJob,
      status: "failed",
      progress: 100,
      errorCode: getErrorCode(error),
      errorMessage: getErrorMessage(error),
      updatedAt: new Date().toISOString()
    };
    generationJobs.set(failedJob.id, failedJob);
    return failedJob;
  }
}

export function getGenerationJob(taskId: string) {
  const job = generationJobs.get(taskId);
  if (!job) return null;
  return updateGenerationProgress(job);
}

export function toGenerationJobResponse(job: GenerationJob): GenerationJobResponse {
  const { createdAtMs: _createdAtMs, readyAtMs: _readyAtMs, ...response } = job;
  return response;
}

function updateGenerationProgress(job: GenerationJob): GenerationJob {
  if (job.status === "failed" || job.status === "succeeded") return job;

  const nowMs = Date.now();
  const elapsed = nowMs - job.createdAtMs;
  const ratio = Math.min(elapsed / generationDurationMs, 1);
  const nextProgress = Math.min(100, Math.max(job.progress, Math.round(12 + ratio * 88)));
  const nextStatus = nowMs >= job.readyAtMs ? "succeeded" : "processing";

  const nextJob: GenerationJob = {
    ...job,
    status: nextStatus,
    progress: nextStatus === "succeeded" ? 100 : Math.min(nextProgress, 96),
    tripId: nextStatus === "succeeded" ? job.tripPlan?.id : job.tripId,
    updatedAt: new Date(nowMs).toISOString()
  };

  generationJobs.set(nextJob.id, nextJob);
  return nextJob;
}

function getErrorCode(error: unknown) {
  if (error instanceof GenerationInputError) return error.code;
  if (error instanceof TripPlanValidationError) return "SCHEMA_VALIDATION_FAILED";
  if (error instanceof LlmConfigurationError) return error.code;
  if (error instanceof LlmProviderError) return error.code;
  return "GENERATION_FAILED";
}

function getErrorMessage(error: unknown) {
  if (error instanceof GenerationInputError) return error.message;
  if (error instanceof TripPlanValidationError) {
    return "AI 输出未通过 TripPlan Schema 校验。";
  }
  if (error instanceof LlmConfigurationError) {
    return "AI 服务未正确配置，请检查 LLM_PROVIDER 和对应 Key。";
  }
  if (error instanceof LlmProviderError) {
    return "AI 服务请求失败，可以稍后重试或切回 mock provider。";
  }
  return "生成服务暂时不可用，请稍后重试。";
}

class GenerationInputError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "GenerationInputError";
  }
}
