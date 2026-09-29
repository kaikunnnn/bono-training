import { describe, expect, it } from "vitest";
import {
  closure,
  computePath,
  hasPrerequisites,
  prerequisitesOf,
} from "@/lib/content-guide/path";
import {
  LEARNING_ORDER,
  SKILL_STATES,
  SKILL_STATE_IDS,
  type SkillStateId,
} from "@/lib/content-guide/skill-states";
import {
  LESSON_MAP,
  isMemberHeavy,
  orderLessonsForResult,
} from "@/lib/content-guide/lesson-map";

describe("content-guide 道筋の計算（10_仕様書 §4 の検算例）", () => {
  it("目標S10でチェックなし → S3→S1→S6→S11→S7→S9→S8→S10（最初はS3）", () => {
    const r = computePath("S10", []);
    expect(r.path).toEqual(["S3", "S1", "S6", "S11", "S7", "S9", "S8", "S10"]);
    expect(r.first).toBe("S3");
    expect(r.weeks).toBe(16);
  });

  it("目標S10でS1にチェック → S6→S11→S7→S9→S8→S10（最初はS6）", () => {
    const r = computePath("S10", ["S1"]);
    expect(r.path).toEqual(["S6", "S11", "S7", "S9", "S8", "S10"]);
    expect(r.first).toBe("S6");
    expect(r.weeks).toBe(12);
  });

  it("目標S14でS8にチェック → S13→S14（最初はS13）", () => {
    const r = computePath("S14", ["S8"]);
    expect(r.path).toEqual(["S13", "S14"]);
    expect(r.first).toBe("S13");
    expect(r.weeks).toBe(4);
  });

  it("目標S17 → S17のみ", () => {
    const r = computePath("S17");
    expect(r.path).toEqual(["S17"]);
    expect(r.first).toBe("S17");
    expect(r.weeks).toBe(2);
  });

  it("チェックした状態の前提も、できているものとして扱う（S10でS7にチェック → S11→S9→S8→S10）", () => {
    expect(computePath("S10", ["S7"]).path).toEqual(["S11", "S9", "S8", "S10"]);
  });

  it("前提をすべてチェックしても、目標そのものは道筋に残る", () => {
    expect(computePath("S10", ["S8", "S9", "S11"]).path).toEqual(["S10"]);
  });
});

describe("content-guide 何もできない場合の道筋（09_前提関係と道筋.md の表）", () => {
  const expected: Record<SkillStateId, SkillStateId[]> = {
    S1: ["S3", "S1"],
    S2: ["S3", "S1", "S2"],
    S3: ["S3"],
    S4: ["S3", "S1", "S4"],
    S5: ["S3", "S1", "S4", "S5"],
    S6: ["S3", "S1", "S6"],
    S7: ["S3", "S1", "S6", "S7"],
    S8: ["S3", "S1", "S6", "S7", "S8"],
    S9: ["S9"],
    S10: ["S3", "S1", "S6", "S11", "S7", "S9", "S8", "S10"],
    S11: ["S3", "S1", "S11"],
    S12: ["S3", "S1", "S11", "S4", "S12"],
    S13: ["S3", "S1", "S6", "S13"],
    S14: ["S3", "S1", "S6", "S7", "S13", "S8", "S14"],
    S15: ["S3", "S1", "S6", "S7", "S13", "S15"],
    S16: ["S3", "S1", "S16"],
    S17: ["S17"],
    S18: ["S3", "S1", "S6", "S7", "S9", "S8", "S18"],
  };

  it.each(SKILL_STATE_IDS.map((id) => [id]))("目標%s", (id) => {
    const r = computePath(id);
    expect(r.path).toEqual(expected[id]);
    expect(r.weeks).toBe(expected[id].length * 2);
  });
});

describe("content-guide データの整合", () => {
  it("学ぶ順は18個の状態をちょうど1回ずつ含む", () => {
    expect([...LEARNING_ORDER].sort()).toEqual([...SKILL_STATE_IDS].sort());
  });

  it("学ぶ順では、どの状態も前提より後ろにある（トポロジカル順）", () => {
    for (const id of SKILL_STATE_IDS) {
      for (const pre of SKILL_STATES[id].prerequisites) {
        expect(LEARNING_ORDER.indexOf(pre)).toBeLessThan(LEARNING_ORDER.indexOf(id));
      }
    }
  });

  it("前提がない目標は S3・S9・S17 だけ（ステップ2を飛ばす）", () => {
    const none = SKILL_STATE_IDS.filter((id) => !hasPrerequisites(id));
    expect(none).toEqual(["S3", "S9", "S17"]);
    for (const id of none) expect(prerequisitesOf(id)).toEqual([]);
  });

  it("ステップ2の候補は目標の前提の閉包（目標を除く）を学ぶ順で並べたもの", () => {
    expect(prerequisitesOf("S14")).toEqual(["S3", "S1", "S6", "S7", "S13", "S8"]);
    expect(prerequisitesOf("S1")).toEqual(["S3"]);
  });

  it("closure は自分自身を含む", () => {
    expect([...closure(["S3"])]).toEqual(["S3"]);
  });

  it("対応度×は S12・S13。S12 はレッスンなし、S13 は近いレッスンあり", () => {
    const missing = SKILL_STATE_IDS.filter((id) => LESSON_MAP[id].coverage === "×");
    expect(missing).toEqual(["S12", "S13"]);
    expect(LESSON_MAP.S12.lessons).toHaveLength(0);
    expect(LESSON_MAP.S13.lessons.length).toBeGreaterThan(0);
  });

  it("×以外の状態にはレッスンが1つ以上ある", () => {
    for (const id of SKILL_STATE_IDS) {
      if (LESSON_MAP[id].coverage !== "×") {
        expect(LESSON_MAP[id].lessons.length).toBeGreaterThan(0);
      }
    }
  });

  it("無料記事数は全記事数以下", () => {
    for (const id of SKILL_STATE_IDS) {
      for (const l of LESSON_MAP[id].lessons) {
        expect(l.freeCount).toBeLessThanOrEqual(l.totalCount);
      }
    }
  });
});

describe("content-guide レッスンの並び・会員限定の判定", () => {
  it("無料で始められないレッスン（無料0本）は後ろに回し、ほかは07の順を保つ", () => {
    expect(orderLessonsForResult(LESSON_MAP.S9.lessons).map((l) => l.slug)).toEqual([
      "ux-beginner-2",
      "failurepoint",
      "ux-biginner",
      "zerokara-userinterview",
    ]);
    // S1 は入口（ゼロからはじめるUIビジュアル）が先頭のまま
    expect(orderLessonsForResult(LESSON_MAP.S1.lessons)[0].slug).toBe("tutorial-uivisual");
  });

  it("07で「会員限定が多い」とされたレッスンは isMemberHeavy が true", () => {
    expect(isMemberHeavy({ freeCount: 7, totalCount: 37 })).toBe(true); // UIビジュアル基礎
    expect(isMemberHeavy({ freeCount: 7, totalCount: 23 })).toBe(true); // UI PATTERN 入門
    expect(isMemberHeavy({ freeCount: 3, totalCount: 14 })).toBe(true); // AIでUIスタイリング入門
    expect(isMemberHeavy({ freeCount: 0, totalCount: 5 })).toBe(true); // ユーザーインタビュー
    expect(isMemberHeavy({ freeCount: 20, totalCount: 21 })).toBe(false); // Figmaの使い方入門
  });
});
