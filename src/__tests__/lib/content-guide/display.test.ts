import { describe, expect, it } from "vitest";
import { SHORT_TITLES, STAGE_GROUPS } from "@/lib/content-guide/display";
import { SKILL_STATE_IDS } from "@/lib/content-guide/skill-states";
import { LESSON_MAP, isMemberHeavy } from "@/lib/content-guide/lesson-map";

describe("content-guide 見せ方データ（11_UI改善仕様書 §2A）", () => {
  it("18個すべてに短い見出しがある", () => {
    for (const id of SKILL_STATE_IDS) expect(SHORT_TITLES[id].length).toBeGreaterThan(0);
  });

  it("段階グループは 基本5・実践7・応用6 で、18個をちょうど1回ずつ含む", () => {
    expect(STAGE_GROUPS.map((g) => g.stateIds.length)).toEqual([5, 7, 6]);
    const all = STAGE_GROUPS.flatMap((g) => g.stateIds);
    expect([...all].sort()).toEqual([...SKILL_STATE_IDS].sort());
  });
});

describe("content-guide 会員限定の判定（独立レビュー 中1: 無料が3分の1未満）", () => {
  it("入口のレッスン（ゼロからはじめるUIビジュアル 4/11）には付かない", () => {
    expect(isMemberHeavy({ freeCount: 4, totalCount: 11 })).toBe(false);
  });

  it("07 で明記された3つには付く", () => {
    const slugs = new Set(
      SKILL_STATE_IDS.flatMap((id) => LESSON_MAP[id].lessons).filter(isMemberHeavy).map((l) => l.slug)
    );
    for (const s of ["uivisual", "ui-pattern", "ai-ui-styling-beginner"]) expect(slugs.has(s)).toBe(true);
  });
});
