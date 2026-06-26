import "server-only";

import type { GuestDraft } from "../storage";
import {
  buildMockTripPlan,
  TripPlan,
  validateTripPlan
} from "../trip-plan-schema";

export type GenerateTripInput = {
  draft: GuestDraft;
};

export type GenerateTripOutput = {
  tripPlan: TripPlan;
  repaired: boolean;
  validationErrors: string[];
};

export type TravelGenerationAdapter = {
  name: string;
  generateTripPlan(input: GenerateTripInput): Promise<unknown>;
  repairTripPlan?(input: GenerateTripInput, errors: string[]): Promise<unknown>;
};

const mockTravelGenerationAdapter: TravelGenerationAdapter = {
  name: "mock-llm-adapter",
  async generateTripPlan({ draft }) {
    return buildMockTripPlan(draft);
  },
  async repairTripPlan({ draft }) {
    return buildMockTripPlan(draft);
  }
};

export async function generateValidatedTripPlan(
  input: GenerateTripInput,
  adapter: TravelGenerationAdapter = mockTravelGenerationAdapter
): Promise<GenerateTripOutput> {
  const rawTripPlan = await adapter.generateTripPlan(input);
  const validation = validateTripPlan(rawTripPlan);

  if (validation.ok) {
    return {
      tripPlan: validation.plan,
      repaired: false,
      validationErrors: []
    };
  }

  const repairedRawTripPlan = adapter.repairTripPlan
    ? await adapter.repairTripPlan(input, validation.errors)
    : buildMockTripPlan(input.draft);
  const repairedValidation = validateTripPlan(repairedRawTripPlan);

  if (!repairedValidation.ok) {
    throw new TripPlanValidationError(repairedValidation.errors);
  }

  return {
    tripPlan: repairedValidation.plan,
    repaired: true,
    validationErrors: validation.errors
  };
}

export class TripPlanValidationError extends Error {
  constructor(readonly validationErrors: string[]) {
    super("TripPlan JSON Schema validation failed.");
    this.name = "TripPlanValidationError";
  }
}
