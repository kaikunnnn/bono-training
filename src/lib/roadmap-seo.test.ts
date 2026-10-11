import { describe, expect, it } from "vitest";
import { getRoadmapSeoOverride } from "./roadmap-seo";

describe("getRoadmapSeoOverride", () => {
  it("returns the career-change override (#236)", () => {
    expect(getRoadmapSeoOverride("uiux-career-change")).toEqual({
      title:
        "未経験からUI/UXデザイナーに転職するロードマップ｜6ヶ月のオンラインコース｜BONO",
      description:
        "未経験からUI/UXデザイナーを目指す人の6ヶ月の学習ロードマップ。UIデザインの基礎、情報設計、UXデザイン、ポートフォリオ制作までを順番に学べます。",
      heading: "未経験からUI/UXデザイナーになる|転職ロードマップ",
    });
  });

  it("leaves other roadmaps on Sanity values", () => {
    expect(getRoadmapSeoOverride("ui-visual")).toBeUndefined();
    expect(getRoadmapSeoOverride("constructor")).toBeUndefined();
  });
});
