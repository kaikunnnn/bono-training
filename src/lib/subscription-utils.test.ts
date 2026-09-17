import { describe, expect, it } from "vitest";
import {
  canAccessContent,
  getEffectiveLearningPlanType,
} from "@/lib/subscription-utils";

describe("learning content access", () => {
  it("keeps free content available without a plan", () => {
    expect(canAccessContent(false, null)).toBe(true);
  });

  it.each(["standard", "feedback"] as const)(
    "allows premium content for an active %s plan",
    (storedPlanType) => {
      const planType = getEffectiveLearningPlanType(storedPlanType, true);

      expect(canAccessContent(true, planType)).toBe(true);
    }
  );

  it.each(["standard", "feedback"] as const)(
    "locks premium content when a stored %s plan is inactive",
    (storedPlanType) => {
      const planType = getEffectiveLearningPlanType(storedPlanType, false);

      expect(planType).toBeNull();
      expect(canAccessContent(true, planType)).toBe(false);
    }
  );

  it("locks premium content for a free member", () => {
    const planType = getEffectiveLearningPlanType(null, false);

    expect(canAccessContent(true, planType)).toBe(false);
  });
});
