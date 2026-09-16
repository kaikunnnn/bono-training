import { describe, expect, it } from "vitest";
import {
  canAccessContent,
  getEffectiveLearningPlanType,
} from "@/lib/subscription-utils";

describe("learning content access", () => {
  it("keeps free content available without a plan", () => {
    expect(canAccessContent(false, null)).toBe(true);
  });

  it("allows premium content for an active learning plan", () => {
    const planType = getEffectiveLearningPlanType("standard", true);

    expect(canAccessContent(true, planType)).toBe(true);
  });

  it("locks premium content when a stored plan is inactive", () => {
    const planType = getEffectiveLearningPlanType("standard", false);

    expect(planType).toBeNull();
    expect(canAccessContent(true, planType)).toBe(false);
  });
});
