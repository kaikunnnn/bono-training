import { describe, expect, it } from "vitest";
import { getRoadmapSeoOverride, roadmapTitleForMetadata } from "./roadmap-seo";

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

describe("roadmapTitleForMetadata", () => {
  it("改行マーカーの | を取り除き、h1 の文字列とそろえる", () => {
    expect(roadmapTitleForMetadata("UIデザイン見た目のきほん|習得ロードマップ")).toBe(
      "UIデザイン見た目のきほん習得ロードマップ",
    );
    expect(roadmapTitleForMetadata("Figmaからデザインを | はじめるロードマップ")).toBe(
      "Figmaからデザインをはじめるロードマップ",
    );
    expect(roadmapTitleForMetadata("区切りなし")).toBe("区切りなし");
  });
});
