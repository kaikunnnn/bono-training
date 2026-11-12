import { describe, expect, it } from "vitest";
import { splitDuration } from "@/lib/roadmap-duration";

describe("splitDuration", () => {
  it("単位なしは「ヶ月」を付ける", () => {
    expect(splitDuration("6-9")).toEqual({ value: "6-9", unit: "ヶ月" });
  });
  it("「ヶ月」付きは二重にしない", () => {
    expect(splitDuration("6〜9ヶ月")).toEqual({ value: "6〜9", unit: "ヶ月" });
  });
  it("「年」付きは単位を足さない", () => {
    expect(splitDuration("約1年")).toEqual({ value: "約1年", unit: "" });
  });
});
