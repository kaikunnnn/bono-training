import { describe, expect, it } from "vitest";
import { mapNodeStates } from "@/lib/content-guide/map-state";
import type { SkillStateId } from "@/lib/content-guide/skill-states";

const ids = (states: ReturnType<typeof mapNodeStates>, status: string) =>
  (Object.keys(states) as SkillStateId[]).filter((id) => states[id].status === status).sort();

describe("content-guide A案 スキルマップのノード状態（12_仕様書 §4）", () => {
  it("Q1 はすべて選べる", () => {
    expect(ids(mapNodeStates("pick", null), "selectable")).toHaveLength(18);
  });

  it("Q2（S10・S1にチェック）: 前提だけ選べる／S3はロックされたできている／他は対象外", () => {
    const s = mapNodeStates("check", "S10", ["S1"]);
    expect(s.S10).toEqual({ status: "goal", isGoal: true, locked: false });
    expect(s.S1).toMatchObject({ status: "done", locked: false });
    expect(s.S3).toMatchObject({ status: "done", locked: true });
    expect(ids(s, "selectable")).toEqual(["S11", "S6", "S7", "S8", "S9"].sort());
    expect(ids(s, "inactive")).toHaveLength(18 - 8);
  });

  it("結果（S10・チェックなし）: いまここS3、これから6つ、ゴールS10", () => {
    const s = mapNodeStates("result", "S10", []);
    expect(ids(s, "current")).toEqual(["S3"]);
    expect(ids(s, "upcoming")).toEqual(["S1", "S11", "S6", "S7", "S8", "S9"].sort());
    expect(s.S10).toMatchObject({ status: "goal", isGoal: true });
    expect(ids(s, "done")).toEqual([]);
  });

  it("結果（S14・S8にチェック）: できている5つ、いまここS13、ゴールS14", () => {
    const s = mapNodeStates("result", "S14", ["S8"]);
    expect(ids(s, "done")).toEqual(["S1", "S3", "S6", "S7", "S8"].sort());
    expect(ids(s, "current")).toEqual(["S13"]);
    expect(s.S14.status).toBe("goal");
    expect(ids(s, "upcoming")).toEqual([]);
  });

  it("結果（S17）: ゴールがそのまま、いまここ", () => {
    const s = mapNodeStates("result", "S17", []);
    expect(s.S17).toEqual({ status: "current", isGoal: true, locked: false });
    expect(ids(s, "inactive")).toHaveLength(17);
  });
});
