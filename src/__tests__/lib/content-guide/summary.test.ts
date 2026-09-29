import { describe, expect, it } from "vitest";
import { computeSummary, positionLabel, type StageCount } from "@/lib/content-guide/summary";

const stages = (basic: number, practice: number, advanced: number): StageCount[] => [
  { id: "basic", stageLabel: "基礎", done: basic, total: 5 },
  { id: "practice", stageLabel: "実践", done: practice, total: 7 },
  { id: "advanced", stageLabel: "応用", done: advanced, total: 6 },
];

describe("content-guide 診断結果の要約（12_仕様書 §6）", () => {
  it("目標S10でチェックなし → 現在地0、次はS3、あと8ステップ・16週間", () => {
    const s = computeSummary("S10", []);
    expect(s.stages.map((x) => [x.done, x.total])).toEqual([
      [0, 5],
      [0, 7],
      [0, 6],
    ]);
    expect(s.label).toBe("これから始めるところ");
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
    expect(s.label).toBe("基本を固めている途中");
    expect(s.next).toBe("S6");
    expect(s.remainingSteps).toBe(6);
    expect(s.weeks).toBe(12);
    expect(s.requiredDone).toBe(2);
  });

  it("目標S14でS8にチェック → 前提の閉包（S3・S1・S6・S7・S8）を数える。実践2で「実践に入ったところ」、次はS13", () => {
    const s = computeSummary("S14", ["S8"]);
    expect(s.stages.map((x) => x.done)).toEqual([3, 2, 0]);
    expect(s.doneTotal).toBe(5);
    expect(s.label).toBe("実践に入ったところ");
    expect(s.next).toBe("S13");
    expect(s.remainingSteps).toBe(2);
    expect(s.weeks).toBe(4);
  });

  it("目標S17 → 次もゴールもS17、あと1ステップ・2週間", () => {
    const s = computeSummary("S17", []);
    expect(s.next).toBe("S17");
    expect(s.remainingSteps).toBe(1);
    expect(s.weeks).toBe(2);
    expect(s.label).toBe("これから始めるところ");
  });

  it("目標自身がチェックに入っていても数えない（道筋と同じ扱い）", () => {
    expect(computeSummary("S14", ["S14"]).doneTotal).toBe(0);
  });
});

describe("content-guide 現在地のラベル（§6 の既定値）", () => {
  it.each([
    [stages(0, 0, 0), "これから始めるところ"],
    [stages(2, 0, 0), "基本を固めている途中"],
    [stages(5, 0, 0), "基本ができている"],
    [stages(4, 1, 0), "実践に入ったところ"],
    [stages(4, 3, 0), "実践に入ったところ"],
    [stages(4, 4, 0), "実践を積んでいる"],
    [stages(4, 2, 1), "応用に進んでいる"],
  ] as const)("%j → %s", (input, expected) => {
    expect(positionLabel(input)).toBe(expected);
  });
});
