import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArticleRow, toArticleRowImageSrc } from "./ArticleRow";

describe("toArticleRowImageSrc", () => {
  it("Sanity の画像は Sanity CDN で縮小・切り抜き・形式変換する", () => {
    const src = toArticleRowImageSrc(
      "https://cdn.sanity.io/images/cqszh4up/production/abc-1920x1080.jpg",
    );
    const url = new URL(src);
    expect(url.hostname).toBe("cdn.sanity.io");
    expect(url.searchParams.get("w")).toBe("256");
    expect(url.searchParams.get("h")).toBe("144");
    expect(url.searchParams.get("fit")).toBe("crop");
    expect(url.searchParams.get("auto")).toBe("format");
  });

  it("Sanity 以外の画像と相対パスはそのまま返す", () => {
    expect(toArticleRowImageSrc("https://example.com/a.jpg")).toBe("https://example.com/a.jpg");
    expect(toArticleRowImageSrc("/images/questions-og.jpg")).toBe("/images/questions-og.jpg");
  });
});

describe("ArticleRow", () => {
  it("サムネを /_next/image を通さずに出す", () => {
    const html = renderToStaticMarkup(
      <ArticleRow
        image="https://cdn.sanity.io/images/cqszh4up/production/abc-1920x1080.jpg"
        category="イベント"
        title="みんなで作業会"
        href="/events/test"
      />,
    );
    expect(html).not.toContain("/_next/image");
    expect(html).toContain("cdn.sanity.io/images/cqszh4up/production/abc-1920x1080.jpg?w=256");
  });
});
