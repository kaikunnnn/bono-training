import { describe, it, expect } from "vitest";
import { linkifyText, type LinkifySegment } from "@/lib/questions/linkify";

// テスト補助: link セグメントだけ抽出
function links(segments: LinkifySegment[]): string[] {
  return segments
    .filter((s): s is Extract<LinkifySegment, { type: "link" }> => s.type === "link")
    .map((s) => s.href);
}

describe("linkifyText", () => {
  it("URL を含まない素のテキストは text セグメント 1 つ", () => {
    const result = linkifyText("これはただのテキストです");
    expect(result).toEqual([
      { type: "text", value: "これはただのテキストです" },
    ]);
  });

  it("空文字は空配列", () => {
    expect(linkifyText("")).toEqual([]);
  });

  it("文中の https URL は 前text + link + 後text に分解", () => {
    const result = linkifyText("前 https://example.com 後");
    expect(result).toEqual([
      { type: "text", value: "前 " },
      { type: "link", href: "https://example.com", label: "https://example.com" },
      { type: "text", value: " 後" },
    ]);
  });

  it("複数 URL を検出する", () => {
    const result = linkifyText(
      "a https://one.example.com b https://two.example.com c",
    );
    expect(links(result)).toEqual([
      "https://one.example.com",
      "https://two.example.com",
    ]);
  });

  it("日本語句読点直後の URL を検出する", () => {
    const result = linkifyText("詳しくはhttps://example.com を見て");
    expect(result).toEqual([
      { type: "text", value: "詳しくは" },
      { type: "link", href: "https://example.com", label: "https://example.com" },
      { type: "text", value: " を見て" },
    ]);
  });

  it("URL 末尾の「。」はリンクに含めず text 側へ残す", () => {
    const result = linkifyText("参考: https://example.com。");
    expect(result).toEqual([
      { type: "text", value: "参考: " },
      { type: "link", href: "https://example.com", label: "https://example.com" },
      { type: "text", value: "。" },
    ]);
  });

  it("URL 末尾の全角閉じ括弧「）」はリンクに含めない", () => {
    const result = linkifyText("（詳細はhttps://example.com）");
    expect(result).toEqual([
      { type: "text", value: "（詳細は" },
      { type: "link", href: "https://example.com", label: "https://example.com" },
      { type: "text", value: "）" },
    ]);
  });

  it("URL 末尾の半角ピリオド・カンマ・閉じ括弧を切る", () => {
    expect(links(linkifyText("see https://example.com."))).toEqual([
      "https://example.com",
    ]);
    expect(links(linkifyText("see https://example.com,"))).toEqual([
      "https://example.com",
    ]);
    expect(links(linkifyText("(https://example.com)"))).toEqual([
      "https://example.com",
    ]);
  });

  it("釣り合った () を含む URL（Wikipedia 等）は括弧を保持", () => {
    const result = linkifyText(
      "https://ja.wikipedia.org/wiki/Foo_(bar) を参照",
    );
    expect(links(result)).toEqual([
      "https://ja.wikipedia.org/wiki/Foo_(bar)",
    ]);
  });

  it("http:// も対象にする", () => {
    const result = linkifyText("http://example.com");
    expect(result).toEqual([
      { type: "link", href: "http://example.com", label: "http://example.com" },
    ]);
  });

  it("ftp:// はリンク化しない", () => {
    const result = linkifyText("ftp://example.com/file");
    expect(result).toEqual([
      { type: "text", value: "ftp://example.com/file" },
    ]);
    expect(links(result)).toEqual([]);
  });

  it("javascript: はリンク化しない", () => {
    const result = linkifyText("javascript:alert(1)");
    expect(links(result)).toEqual([]);
    expect(result).toEqual([{ type: "text", value: "javascript:alert(1)" }]);
  });

  it("パス・クエリ付き URL をそのまま保持", () => {
    const url = "https://example.com/path/to/page?q=1&x=2#frag";
    const result = linkifyText(`link: ${url}`);
    expect(links(result)).toEqual([url]);
  });
});
