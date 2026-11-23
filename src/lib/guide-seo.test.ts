import { describe, expect, it } from "vitest";
import { getGuideSeoOverride } from "./guide-seo";

describe("getGuideSeoOverride", () => {
  it("returns the how-to-be-a-designer override (rebono#24)", () => {
    expect(getGuideSeoOverride("rdm-howtobeadesigner")).toEqual({
      title:
        "未経験からUI/UXデザイナーになるには？必要なスキル3つと書類で落ちない条件 | BONO",
      description:
        "未経験からUI/UXデザイナーをめざす人向けに、採用で見られる3つのスキル（ふつうに使えるUIを作る基礎・課題解決の力・未経験者のポテンシャル）と、その身につけ方を解説します。",
    });
  });

  it("overrides only the title of the roadmap explainer (rebono#20)", () => {
    const seo = getGuideSeoOverride("rdm-howtostart-roadmap");
    expect(seo).toEqual({
      title:
        "転職ロードマップの中身を解説｜フェーズごとに目指すレベルと習得すること | BONO",
    });
    expect(seo?.description).toBeUndefined();
  });

  it("narrows become-uiux to salary and future without 未経験 (#236 B / #276)", () => {
    const seo = getGuideSeoOverride("become-uiux-designer-beginner-guide");
    expect(seo?.title).toBe(
      "UI/UXデザイナーの年収と将来性｜仕事の役割・年収の目安・キャリアの広げ方 | BONO",
    );
    for (const word of ["未経験", "なるには", "スクール", "講座"]) {
      expect(seo?.title).not.toContain(word);
      expect(seo?.description).not.toContain(word);
    }
  });

  it("leaves other guides on Sanity values", () => {
    expect(getGuideSeoOverride("beginner-to-uiux-designer-examples")).toBeUndefined();
    expect(getGuideSeoOverride("constructor")).toBeUndefined();
    expect(getGuideSeoOverride("toString")).toBeUndefined();
  });
});
