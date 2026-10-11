import { describe, expect, it } from "vitest";
import { generateArticleJsonLd, generateBreadcrumbJsonLd } from "./jsonld";

describe("generateBreadcrumbJsonLd（#236）", () => {
  it("位置を1から振り、url の無い最後の項目は item を省略する", () => {
    const data = generateBreadcrumbJsonLd([
      { name: "レッスン", url: "/lessons" },
      { name: "Figma入門", url: "/lessons/figma" },
      { name: "記事" },
    ]);
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(data.itemListElement[0]).toMatchObject({
      name: "レッスン",
      item: expect.stringMatching(/\/lessons$/),
    });
    expect(data.itemListElement[2]).not.toHaveProperty("item");
  });
});

describe("generateArticleJsonLd paywalled content（#236）", () => {
  const base = {
    title: "記事",
    description: "説明",
    url: "/contents/x",
    publishedAt: "2026-01-01T00:00:00.000Z",
  };

  it("有料部分のセレクタを渡すと isAccessibleForFree:false と hasPart を付ける", () => {
    const data = generateArticleJsonLd({ ...base, paywalledCssSelector: ".paywalled-content" });
    expect(data).toMatchObject({
      "@type": "Article",
      isAccessibleForFree: false,
      hasPart: [
        {
          "@type": "WebPageElement",
          isAccessibleForFree: false,
          cssSelector: ".paywalled-content",
        },
      ],
    });
  });

  it("渡さなければ従来どおり（無料記事・対象外の会員限定記事）", () => {
    const data = generateArticleJsonLd(base);
    expect(data).not.toHaveProperty("isAccessibleForFree");
    expect(data).not.toHaveProperty("hasPart");
  });
});
