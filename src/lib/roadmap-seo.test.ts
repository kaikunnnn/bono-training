import { describe, expect, it } from "vitest";
import { getRoadmapSeoOverride, roadmapTitleForMetadata } from "./roadmap-seo";

describe("getRoadmapSeoOverride", () => {
  it("returns the career-change override (#236)", () => {
    expect(getRoadmapSeoOverride("uiux-career-change")).toEqual({
      title:
        "UI/UXデザインの勉強ロードマップ｜未経験から転職まで6ヶ月の学ぶ順番｜BONO",
      description:
        "UI/UXデザインを何から勉強すればいいか迷う人へ。UIの基礎→情報設計→UXデザイン→ポートフォリオの順に、未経験から転職まで6ヶ月で進める学習ロードマップです。",
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
