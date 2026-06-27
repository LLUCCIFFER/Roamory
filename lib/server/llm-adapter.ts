import "server-only";

import type { GuestDraft } from "../storage";
import {
  buildMockTripPlan,
  tripPlanStructuredOutputSchema,
  TripPlan,
  validateTripPlan
} from "../trip-plan-schema";

export type TravelGenerationProvider = "mock" | "gemini" | "ollama";

export type GenerateTripInput = {
  draft: GuestDraft;
};

export type GenerateTripOutput = {
  tripPlan: TripPlan;
  repaired: boolean;
  validationErrors: string[];
  provider: TravelGenerationProvider;
  adapterName: string;
  model?: string;
  fallbackUsed: boolean;
};

export type TravelGenerationAdapter = {
  name: string;
  provider: TravelGenerationProvider;
  model?: string;
  generateTripPlan(input: GenerateTripInput): Promise<unknown>;
  repairTripPlan?(input: GenerateTripInput, errors: string[]): Promise<unknown>;
};

const defaultTimeoutMs = 30_000;

const mockTravelGenerationAdapter: TravelGenerationAdapter = {
  name: "mock-llm-adapter",
  provider: "mock",
  model: "local-fixture",
  async generateTripPlan({ draft }) {
    return buildMockTripPlan(draft);
  },
  async repairTripPlan({ draft }) {
    return buildMockTripPlan(draft);
  }
};

export async function generateValidatedTripPlan(
  input: GenerateTripInput,
  adapter: TravelGenerationAdapter = getConfiguredTravelGenerationAdapter()
): Promise<GenerateTripOutput> {
  try {
    return await generateWithAdapter(input, adapter, false);
  } catch (error) {
    if (adapter.provider === "mock" || !allowMockFallback()) {
      throw error;
    }

    const fallback = await generateWithAdapter(input, mockTravelGenerationAdapter, true);
    return {
      ...fallback,
      validationErrors:
        error instanceof TripPlanValidationError
          ? error.validationErrors
          : [`${adapter.provider} provider fallback: ${getPublicErrorMessage(error)}`],
      fallbackUsed: true
    };
  }
}

export function getConfiguredTravelGenerationAdapter(): TravelGenerationAdapter {
  const provider = readProvider();

  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new LlmConfigurationError("GEMINI_API_KEY is required when LLM_PROVIDER=gemini.");
    }
    return createGeminiAdapter(apiKey);
  }

  if (provider === "ollama") {
    return createOllamaAdapter();
  }

  return mockTravelGenerationAdapter;
}

async function generateWithAdapter(
  input: GenerateTripInput,
  adapter: TravelGenerationAdapter,
  fallbackUsed: boolean
): Promise<GenerateTripOutput> {
  const rawTripPlan = await adapter.generateTripPlan(input);
  const validation = validateTripPlan(normalizeTripPlanJson(rawTripPlan));

  if (validation.ok) {
    return {
      tripPlan: validation.plan,
      repaired: false,
      validationErrors: [],
      provider: adapter.provider,
      adapterName: adapter.name,
      model: adapter.model,
      fallbackUsed
    };
  }

  const repairedRawTripPlan = adapter.repairTripPlan
    ? await adapter.repairTripPlan(input, validation.errors)
    : buildMockTripPlan(input.draft);
  const repairedValidation = validateTripPlan(normalizeTripPlanJson(repairedRawTripPlan));

  if (!repairedValidation.ok) {
    throw new TripPlanValidationError(repairedValidation.errors);
  }

  return {
    tripPlan: repairedValidation.plan,
    repaired: true,
    validationErrors: validation.errors,
    provider: adapter.provider,
    adapterName: adapter.name,
    model: adapter.model,
    fallbackUsed
  };
}

function createGeminiAdapter(apiKey: string): TravelGenerationAdapter {
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const baseUrl = (process.env.GEMINI_API_BASE_URL || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");

  async function callGemini(input: GenerateTripInput, errors: string[] = []) {
    const endpoint = `${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetchWithTimeout(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemPrompt() }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildTripPrompt(input.draft, errors) }]
          }
        ],
        generationConfig: {
          temperature: 0.35,
          responseFormat: {
            text: {
              mimeType: "application/json",
              schema: tripPlanStructuredOutputSchema
            }
          }
        }
      })
    });

    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw new LlmProviderError("GEMINI_REQUEST_FAILED", readProviderMessage(payload, response.statusText));
    }

    const text = readGeminiText(payload);
    return parseJsonLike(text);
  }

  return {
    name: "gemini-json-schema-adapter",
    provider: "gemini",
    model,
    generateTripPlan: callGemini,
    repairTripPlan: callGemini
  };
}

function createOllamaAdapter(): TravelGenerationAdapter {
  const model = process.env.OLLAMA_MODEL || "llama3.2";
  const baseUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");

  async function callOllama(input: GenerateTripInput, errors: string[] = []) {
    const response = await fetchWithTimeout(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        system: buildSystemPrompt(),
        prompt: buildTripPrompt(input.draft, errors),
        stream: false,
        format: tripPlanStructuredOutputSchema,
        options: {
          temperature: 0.35
        }
      })
    });

    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw new LlmProviderError("OLLAMA_REQUEST_FAILED", readProviderMessage(payload, response.statusText));
    }

    if (!isRecord(payload) || typeof payload.response !== "string") {
      throw new LlmProviderError("OLLAMA_EMPTY_RESPONSE", "Ollama did not return a response string.");
    }

    return parseJsonLike(payload.response);
  }

  return {
    name: "ollama-json-schema-adapter",
    provider: "ollama",
    model,
    generateTripPlan: callOllama,
    repairTripPlan: callOllama
  };
}

function buildSystemPrompt() {
  return [
    "You are Roamory's travel planning engine.",
    "Return only valid JSON matching the provided TripPlan schema.",
    "Do not wrap the answer in Markdown.",
    "Use routeStatus pending and provider user/mock when exact POI, route, opening-hour, coordinate, or price data is not verified.",
    "Never invent confirmed POI identifiers, coordinates, prices, or opening hours without provider evidence."
  ].join(" ");
}

function buildTripPrompt(draft: GuestDraft, errors: string[]) {
  const repairNote = errors.length
    ? `\nThe previous JSON failed validation. Fix these errors:\n- ${errors.join("\n- ")}`
    : "";

  return `Create a ${draft.days}-day TripPlan JSON for this guest draft.
Destination: ${draft.destination}
Departure city: ${draft.departureCity}
Start date: ${draft.startDate}
Mood: ${draft.mood}
Budget CNY: ${draft.budget}
Interests: ${draft.interests.join(", ")}
Companion type: ${draft.companionType}
Pace: ${draft.pace}
Transport modes: ${draft.transportModes.join(", ")}
Must visit: ${draft.mustVisit || "none"}
Avoid: ${draft.avoid || "none"}
Extra notes: ${draft.freeText || "none"}

Rules:
- schemaVersion must be trip-plan.v1.
- routeProvider must be mock unless a verified route provider is used later by Roamory.
- routeStatus should usually be pending at generation time.
- Every stop must include source.provider, source.status, transportToNext.provider, and transportToNext.status.
- transportToNext.minutes must be an integer. Use 0 for the final stop of a day.
- Use Chinese user-facing title, summary, warnings, tags, and notes.${repairNote}`;
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeoutMs = readTimeoutMs();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new LlmProviderError("LLM_REQUEST_TIMEOUT", `LLM provider did not respond within ${timeoutMs}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function readGeminiText(payload: unknown) {
  if (!isRecord(payload) || !Array.isArray(payload.candidates)) {
    throw new LlmProviderError("GEMINI_EMPTY_RESPONSE", "Gemini did not return candidates.");
  }

  const candidate = payload.candidates.find(isRecord);
  const content = candidate && isRecord(candidate.content) ? candidate.content : null;
  const parts = Array.isArray(content?.parts) ? content.parts : [];
  const text = parts
    .filter(isRecord)
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();

  if (!text) {
    throw new LlmProviderError("GEMINI_EMPTY_RESPONSE", "Gemini response did not include text.");
  }

  return text;
}

function parseJsonLike(value: unknown) {
  if (isRecord(value)) return value;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonText = fenced?.[1]?.trim() || trimmed;
  return JSON.parse(jsonText) as unknown;
}

function normalizeTripPlanJson(value: unknown) {
  if (!isRecord(value)) return value;
  return {
    ...value,
    routeProvider: value.routeProvider === "gaode" ? "gaode" : "mock",
    routeStatus: value.routeStatus === "confirmed" ? "confirmed" : "pending"
  };
}

function readProvider(): TravelGenerationProvider {
  const rawProvider = (process.env.ROAMORY_LLM_PROVIDER || process.env.LLM_PROVIDER || "mock").toLowerCase();
  if (rawProvider === "gemini" || rawProvider === "ollama" || rawProvider === "mock") {
    return rawProvider;
  }
  return "mock";
}

function allowMockFallback() {
  return (process.env.LLM_ALLOW_MOCK_FALLBACK || "true").toLowerCase() !== "false";
}

function readTimeoutMs() {
  const value = Number.parseInt(process.env.LLM_REQUEST_TIMEOUT_MS || "", 10);
  return Number.isFinite(value) && value > 0 ? value : defaultTimeoutMs;
}

function readProviderMessage(payload: unknown, fallback: string) {
  if (isRecord(payload)) {
    if (typeof payload.error === "string") return payload.error;
    if (typeof payload.message === "string") return payload.message;
    if (isRecord(payload.error) && typeof payload.error.message === "string") return payload.error.message;
  }
  return fallback || "LLM provider request failed.";
}

function getPublicErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "unknown provider error";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class TripPlanValidationError extends Error {
  constructor(readonly validationErrors: string[]) {
    super("TripPlan JSON Schema validation failed.");
    this.name = "TripPlanValidationError";
  }
}

export class LlmConfigurationError extends Error {
  readonly code = "LLM_CONFIGURATION_MISSING";

  constructor(message: string) {
    super(message);
    this.name = "LlmConfigurationError";
  }
}

export class LlmProviderError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "LlmProviderError";
  }
}
