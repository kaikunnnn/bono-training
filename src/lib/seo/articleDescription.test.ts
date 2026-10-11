import { describe, expect, it } from "vitest";
import {
  buildArticleDescription,
  leadBlocksOf,
  summarizePortableText,
  type DescriptionSourceBlock,
} from "./articleDescription";

const p = (text: string, extra: Partial<DescriptionSourceBlock> = {}) => ({
  _type: "block",
  style: "normal",
  children: [{ text }],
  ...extra,
});

describe("buildArticleDescription", () => {
  it("excerpt があればそれを使う", () => {
    expect(
      buildArticleDescription({ title: "T", excerpt: " 要約 です ", content: [p("本文")] }),
    ).toBe("要約 です");
  });

  it("excerpt が無ければ本文の冒頭段落を使う（見出し・リスト・URL行は除く）", () => {
    const content = [
      { _type: "block", style: "h2", children: [{ text: "見出し" }] },
      p("https://example.com"),
      p("リスト", { listItem: "bullet" }),
      { _type: "image" },
      p("Figmaは、UI/UXデザインに特化したツールです。"),
      p("ブラウザで動きます。"),
    ];
    expect(buildArticleDescription({ title: "T", content })).toBe(
      "Figmaは、UI/UXデザインに特化したツールです。 ブラウザで動きます。",
    );
  });

  it("本文も無ければ従来の文にフォールバックする", () => {
    expect(buildArticleDescription({ title: "記事A", content: [] })).toBe(
      "記事Aの学習コンテンツ",
    );
  });
});

describe("summarizePortableText", () => {
  it("120字を超えるときは後半の「。」で切る", () => {
    const first = "あ".repeat(80) + "。";
    const second = "い".repeat(80) + "。";
    expect(summarizePortableText([p(first), p(second)])).toBe(first);
  });

  it("切れ目が無ければ119字＋…にする", () => {
    const long = "う".repeat(200);
    const result = summarizePortableText([p(long)]);
    expect(result).toBe("う".repeat(119) + "…");
    expect(result?.length).toBe(120);
  });
});

describe("leadBlocksOf", () => {
  it("GROQ の leadBlocks と同じく通常の段落だけを先頭から取り出す", () => {
    const blocks = [
      { _type: "block", style: "h2", children: [{ text: "見出し" }] },
      { _type: "image" },
      p("リスト", { listItem: "bullet" }),
      p("段落1"),
      { _type: "block", children: [{ text: "style なし" }] },
    ];
    expect(leadBlocksOf(blocks).map((b) => (b.children?.[0] as { text: string }).text)).toEqual([
      "段落1",
      "style なし",
    ]);
  });
});
