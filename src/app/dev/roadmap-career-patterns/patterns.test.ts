import { describe, expect, it, vi } from "vitest";
import type { SanityReferenceContent, SanityRoadmapStep } from "@/types/sanity-roadmap";
import { AI_STEP_KEY, withAiStep } from "./guide-utils";
import { includesPattern, normalizePattern, normalizeView, resolveAiStep } from "./patterns";

describe("includesPattern", () => {
  it("all は A〜I だけを含み、J・K・L を含まない", () => {
    expect(includesPattern("all", "A")).toBe(true);
    expect(includesPattern("all", "I")).toBe(true);
    expect(includesPattern("all", "J")).toBe(false);
    expect(includesPattern("all", "K")).toBe(false);
    expect(includesPattern("all", "L")).toBe(false);
  });

  it("guide は guest で J＋L、member で J＋K", () => {
    expect(["J", "K", "L"].filter((k) => includesPattern("guide", k as "J", "guest"))).toEqual(["J", "L"]);
    expect(["J", "K", "L"].filter((k) => includesPattern("guide", k as "J", "member"))).toEqual(["J", "K"]);
    expect(includesPattern("guide", "A", "guest")).toBe(false);
  });

  it("now はどのパターンも含まない", () => {
    expect(includesPattern("now", "A")).toBe(false);
    expect(includesPattern("now", "J")).toBe(false);
  });
});

describe("normalizePattern / normalizeView", () => {
  it("guide と J を受け付け、不明な値は now", () => {
    expect(normalizePattern("guide")).toBe("guide");
    expect(normalizePattern("j")).toBe("J");
    expect(normalizePattern("xyz")).toBe("now");
  });

  it("view の既定は guest", () => {
    expect(normalizeView(undefined)).toBe("guest");
    expect(normalizeView("member")).toBe("member");
    expect(normalizeView("xyz")).toBe("guest");
  });
});

describe("resolveAiStep", () => {
  it("guide は既定であり、ai=0 で外れる", () => {
    expect(resolveAiStep("guide", undefined)).toBe(true);
    expect(resolveAiStep("guide", "1")).toBe(true);
    expect(resolveAiStep("guide", "0")).toBe(false);
  });

  it("それ以外は既定でなし、ai=1 で入る", () => {
    expect(resolveAiStep("now", undefined)).toBe(false);
    expect(resolveAiStep("J", undefined)).toBe(false);
    expect(resolveAiStep("J", "1")).toBe(true);
  });
});

describe("withAiStep", () => {
  const steps = ["step1", "step2", "step3", "step4", "step5", "step6"].map(
    (key): SanityRoadmapStep => ({ _key: key, title: key })
  );
  const lesson = { _id: "x", _type: "lesson", title: "x", slug: { current: "x" } } as SanityReferenceContent;

  it("step3 の次に足して7つにする", () => {
    const result = withAiStep(steps, [lesson]);
    expect(result).toHaveLength(7);
    expect(result[3]._key).toBe(AI_STEP_KEY);
    expect(result[4]._key).toBe("step4");
    expect(result[3].sections?.[0].contents).toEqual([lesson]);
  });

  it("レッスンが無い・step3 が無いときは元の並びのまま", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(withAiStep(steps, [])).toBe(steps);
    const noStep3 = steps.filter((s) => s._key !== "step3");
    expect(withAiStep(noStep3, [lesson])).toBe(noStep3);
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});
