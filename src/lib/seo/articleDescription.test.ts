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

describe("buildArticleDescription（会員限定記事）", () => {
  const paid = "ここから先は有料部分の文章です。";

  it("非会員に見えている先頭3ブロックだけを使い、有料部分の文を含めない", () => {
    const blocks = [
      { _type: "block", style: "h2", children: [{ text: "見出し" }] },
      p("無料で見える導入文で、この記事で学べることを説明する。"),
      { _type: "image" },
      p(paid),
      p(paid),
    ];
    const result = buildArticleDescription({
      title: "T",
      excerpt: "要約",
      isPremium: true,
      previewBlocks: blocks,
      content: leadBlocksOf(blocks),
    });
    expect(result).toBe("無料で見える導入文で、この記事で学べることを説明する。");
    expect(result).not.toContain("有料");
  });

  it("見えている部分に文が無ければ excerpt、それも無ければ従来文", () => {
    const blocks = [
      { _type: "block", style: "h2", children: [{ text: "見出し" }] },
      { _type: "image" },
      p("https://example.com"),
      p(paid),
    ];
    expect(
      buildArticleDescription({ title: "T", excerpt: " 要約 ", isPremium: true, previewBlocks: blocks }),
    ).toBe("要約");
    expect(
      buildArticleDescription({ title: "記事A", isPremium: true, previewBlocks: blocks }),
    ).toBe("記事Aの学習コンテンツ");
  });

  it("検索に戻す会員限定記事は広げた無料範囲（previewBlockCount）まで使い、その先は使わない", () => {
    const blocks = [
      { _type: "block", style: "h2", children: [{ text: "見出し" }] },
      { _type: "image" },
      p("https://example.com"),
      p("4つ目の無料の文で、記事の内容を短く紹介する。"),
      p("有料の文。"),
    ];
    const result = buildArticleDescription({
      title: "T",
      isPremium: true,
      previewBlocks: blocks,
      previewBlockCount: 4,
    });
    expect(result).toBe("4つ目の無料の文で、記事の内容を短く紹介する。");
    expect(result).not.toContain("有料");
  });

  it("見えている部分の文が短すぎるときは excerpt を優先する", () => {
    const blocks = [{ _type: "block", style: "h1", children: [{ text: "見出し" }] }, p("ちなみに書くと")];
    expect(
      buildArticleDescription({ title: "T", excerpt: "要約の文", isPremium: true, previewBlocks: blocks }),
    ).toBe("要約の文");
    expect(
      buildArticleDescription({ title: "記事A", isPremium: true, previewBlocks: blocks }),
    ).toBe("記事Aの学習コンテンツ");
  });

  it("無料記事は従来どおり excerpt 優先", () => {
    expect(
      buildArticleDescription({ title: "T", excerpt: "要約", isPremium: false, previewBlocks: [p("本文")] }),
    ).toBe("要約");
  });
});
