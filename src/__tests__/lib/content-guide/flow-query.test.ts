import { describe, expect, it } from "vitest";
import { buildFlowSearch, carryOverSearch, parseFlowQuery } from "@/app/dev/content-guide/flow-query";
import { buildGuideSearch, parseGuideQuery } from "@/app/dev/content-guide/query";

const p = (s: string) => new URLSearchParams(s);

describe("content-guide A案・B案の URL（12_仕様書 §2）", () => {
  it("クエリなしは導入", () => {
    expect(parseFlowQuery(p(""), "map").step).toBe("intro");
    expect(parseFlowQuery(p(""), "quiz").step).toBe("intro");
  });

  it("B案: step=goal は段階がないと Q1（段階）に戻す", () => {
    expect(parseFlowQuery(p("step=goal"), "quiz").step).toBe("stage");
    expect(parseFlowQuery(p("step=goal&stage=practice"), "quiz")).toMatchObject({ step: "goal", stage: "practice" });
    expect(parseFlowQuery(p("step=goal&stage=xxx"), "quiz").step).toBe("stage");
  });

  it("A案: step=stage は使わない（導入）。step=goal は Q1", () => {
    expect(parseFlowQuery(p("step=stage"), "map").step).toBe("intro");
    expect(parseFlowQuery(p("step=goal"), "map").step).toBe("goal");
  });

  it("目標があれば、いまできること／前提なしは結果。目標の前提以外のチェックは捨てる", () => {
    expect(parseFlowQuery(p("goal=S10&done=S1,S2"), "quiz")).toMatchObject({
      step: "check",
      checked: ["S1"],
      stage: "advanced",
    });
    expect(parseFlowQuery(p("goal=S17"), "map").step).toBe("result");
    expect(parseFlowQuery(p("goal=S10&step=result"), "map").step).toBe("result");
  });

  it("build と parse が往復する", () => {
    for (const s of ["", "step=stage", "step=goal&stage=basic", "goal=S14&done=S8", "goal=S10&done=S1&step=result", "goal=S17&viewer=member"]) {
      const q = parseFlowQuery(p(s), "quiz");
      expect(parseFlowQuery(p(buildFlowSearch(q).slice(1)), "quiz")).toEqual(q);
    }
  });

  it("切り替えで goal・done・結果・viewer を引き継ぎ、現行の parser でも同じ状態になる", () => {
    const s = carryOverSearch({ goal: "S10", checked: ["S1"], isResult: true, viewer: "member" });
    expect(s).toBe("?goal=S10&done=S1&step=result&viewer=member");
    const list = parseGuideQuery(p(s.slice(1)));
    expect(list).toEqual({ goal: "S10", checked: ["S1"], step: "result", viewer: "member" });
    expect(buildGuideSearch(list)).toBe(s);
    expect(parseFlowQuery(p(s.slice(1)), "map")).toMatchObject({ goal: "S10", checked: ["S1"], step: "result" });
    expect(carryOverSearch({ goal: null, checked: [], isResult: false, viewer: "guest" })).toBe("");
  });
});
