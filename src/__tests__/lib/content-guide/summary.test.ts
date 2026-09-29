import { describe, expect, it } from "vitest";
import { POSITION_LABELS, computeSummary, positionLabel } from "@/lib/content-guide/summary";
import type { SkillStateId } from "@/lib/content-guide/skill-states";

describe("content-guide 診断結果の要約（12_仕様書 §6 / 13_仕様書 §5）", () => {
  it("目標S10でチェックなし → 現在地0、次はS3、あと8ステップ・16週間", () => {
    const s = computeSummary("S10", []);
    expect(s.stages.map((x) => [x.done, x.total])).toEqual([
      [0, 5],
      [0, 7],
      [0, 6],
    ]);
    expect(s.label).toBe(POSITION_LABELS.none);
    expect(s.progress).toBe(0);
    expect(s.next).toBe("S3");
    expect(s.remainingSteps).toBe(8);
    expect(s.weeks).toBe(16);
    expect(s.requiredTotal).toBe(8);
    expect(s.requiredDone).toBe(0);
  });

  it("目標S10でS1にチェック → 基礎2（S3・S1）、次はS6、あと6ステップ・12週間", () => {
    const s = computeSummary("S10", ["S1"]);
    expect(s.stages.map((x) => x.done)).toEqual([2, 0, 0]);
    expect(s.doneTotal).toBe(2);
    expect(s.label).toBe(POSITION_LABELS.early);
    expect(s.progress).toBe(2 / 8);
    expect(s.next).toBe("S6");
    expect(s.remainingSteps).toBe(6);
    expect(s.weeks).toBe(12);
    expect(s.requiredDone).toBe(2);
  });

  it("目標S14でS8にチェック → 前提の閉包（S3・S1・S6・S7・S8）を数える。5/7 で「日が、高く」、次はS13", () => {
    const s = computeSummary("S14", ["S8"]);
    expect(s.stages.map((x) => x.done)).toEqual([3, 2, 0]);
    expect(s.doneTotal).toBe(5);
    expect(s.label).toBe(POSITION_LABELS.high);
    expect(s.next).toBe("S13");
    expect(s.remainingSteps).toBe(2);
    expect(s.weeks).toBe(4);
  });

  it("目標S17 → 次もゴールもS17、あと1ステップ・2週間", () => {
    const s = computeSummary("S17", []);
    expect(s.next).toBe("S17");
    expect(s.remainingSteps).toBe(1);
    expect(s.weeks).toBe(2);
    expect(s.label).toBe(POSITION_LABELS.none);
  });

  it("目標自身がチェックに入っていても数えない（道筋と同じ扱い）", () => {
    expect(computeSummary("S14", ["S14"]).doneTotal).toBe(0);
  });
});

describe("content-guide 現在地のラベル（13_仕様書 §5: ゴールまでの進み具合で判定）", () => {
  // 目標S10（道筋の全状態8つ: S3・S1・S6・S11・S7・S9・S8・S10）の複数のチェックパターンで、到達しうる全ラベルを確かめる
  it.each([
    [[], 0, POSITION_LABELS.none],
    [["S3"], 1, POSITION_LABELS.early],
    [["S1"], 2, POSITION_LABELS.early],
    [["S6"], 3, POSITION_LABELS.middle],
    [["S6", "S11"], 4, POSITION_LABELS.middle],
    [["S8"], 5, POSITION_LABELS.middle],
    [["S8", "S11"], 6, POSITION_LABELS.high],
    [["S8", "S9", "S11"], 7, POSITION_LABELS.last],
  ] as const)("S10 で %j にチェック → できている %i/8 → %s", (checked, done, label) => {
    const s = computeSummary("S10", checked as readonly SkillStateId[]);
    expect(s.requiredDone).toBe(done);
    expect(s.label).toBe(label);
  });

  it("5つのラベルがすべて S10 で到達しうる", () => {
    const patterns: SkillStateId[][] = [[], ["S1"], ["S6"], ["S8", "S11"], ["S8", "S9", "S11"]];
    const labels = new Set(patterns.map((c) => computeSummary("S10", c).label));
    expect(labels).toEqual(new Set(Object.values(POSITION_LABELS)));
  });

  it("前提がない目標（S3・S9・S17）は 夜明け前", () => {
    for (const g of ["S3", "S9", "S17"] as const) expect(computeSummary(g).label).toBe(POSITION_LABELS.none);
  });

  it("境界: 1/3 ちょうどは「東の空」、2/3 ちょうどは「日が、高く」、残りが目標だけは「朝の光」", () => {
    expect(positionLabel(1, 6)).toBe(POSITION_LABELS.early);
    expect(positionLabel(2, 6)).toBe(POSITION_LABELS.middle);
    expect(positionLabel(4, 6)).toBe(POSITION_LABELS.high);
    expect(positionLabel(5, 6)).toBe(POSITION_LABELS.last);
    expect(positionLabel(1, 2)).toBe(POSITION_LABELS.last);
    expect(positionLabel(0, 0)).toBe(POSITION_LABELS.none);
  });
});
