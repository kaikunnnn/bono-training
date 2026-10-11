import { describe, expect, it } from "vitest";
import { generateBreadcrumbJsonLd } from "./jsonld";

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
