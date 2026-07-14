import { describe, it, expect } from "vitest";
import {
  parseInlineRuns,
  parseFormattedText,
  textToPortableBlocks,
  portableBlocksToText,
} from "@/lib/questions/text-format";

describe("parseInlineRuns", () => {
  it("プレーン行は text ラン 1 つ", () => {
    expect(parseInlineRuns("こんにちは")).toEqual([
      { type: "text", text: "こんにちは" },
    ]);
  });

  it("**太字** を strong ランに分解する", () => {
    expect(parseInlineRuns("これは**大事**です")).toEqual([
      { type: "text", text: "これは" },
      { type: "strong", text: "大事" },
      { type: "text", text: "です" },
    ]);
  });

  it("複数の太字を扱える", () => {
    expect(parseInlineRuns("**A**と**B**")).toEqual([
      { type: "strong", text: "A" },
      { type: "text", text: "と" },
      { type: "strong", text: "B" },
    ]);
  });

  it("閉じない ** はテキストとして残す（割り切り）", () => {
    expect(parseInlineRuns("未完 **bold")).toEqual([
      { type: "text", text: "未完 **bold" },
    ]);
  });

  it("空行は空 text ラン 1 つ", () => {
    expect(parseInlineRuns("")).toEqual([{ type: "text", text: "" }]);
  });
});

describe("parseFormattedText", () => {
  it("## 見出しを h3 ブロックにする", () => {
    const blocks = parseFormattedText("## タイトル");
    expect(blocks).toEqual([
      { type: "h3", runs: [{ type: "text", text: "タイトル" }] },
    ]);
  });

  it("- 行を listItem ブロックにする", () => {
    const blocks = parseFormattedText("- 項目A\n- 項目B");
    expect(blocks).toEqual([
      { type: "listItem", runs: [{ type: "text", text: "項目A" }] },
      { type: "listItem", runs: [{ type: "text", text: "項目B" }] },
    ]);
  });

  it("連続する通常行は改行を保持して 1 つの normal ブロックにまとめる", () => {
    const blocks = parseFormattedText("1行目\n2行目");
    expect(blocks).toEqual([
      { type: "normal", runs: [{ type: "text", text: "1行目\n2行目" }] },
    ]);
  });

  it("空行は段落区切りになる", () => {
    const blocks = parseFormattedText("前\n\n後");
    expect(blocks).toEqual([
      { type: "normal", runs: [{ type: "text", text: "前" }] },
      { type: "normal", runs: [{ type: "text", text: "後" }] },
    ]);
  });

  it("見出し・太字・リストの混在を扱える", () => {
    const blocks = parseFormattedText(
      "## 見出し\n本文の**太字**\n- リスト1\n- リスト2",
    );
    expect(blocks).toEqual([
      { type: "h3", runs: [{ type: "text", text: "見出し" }] },
      {
        type: "normal",
        runs: [
          { type: "text", text: "本文の" },
          { type: "strong", text: "太字" },
        ],
      },
      { type: "listItem", runs: [{ type: "text", text: "リスト1" }] },
      { type: "listItem", runs: [{ type: "text", text: "リスト2" }] },
    ]);
  });

  it("見出し内の太字も解析される", () => {
    const blocks = parseFormattedText("## 見出し**強調**");
    expect(blocks).toEqual([
      {
        type: "h3",
        runs: [
          { type: "text", text: "見出し" },
          { type: "strong", text: "強調" },
        ],
      },
    ]);
  });

  it("CRLF 改行を正規化する", () => {
    const blocks = parseFormattedText("A\r\nB");
    expect(blocks).toEqual([
      { type: "normal", runs: [{ type: "text", text: "A\nB" }] },
    ]);
  });
});

describe("textToPortableBlocks", () => {
  it("通常テキストは従来どおり normal ブロックになる（後方互換）", () => {
    const blocks = textToPortableBlocks("普通の文");
    expect(blocks).toEqual([
      {
        _type: "block",
        _key: "block-0",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "block-0-span-0",
            text: "普通の文",
            marks: [],
          },
        ],
      },
    ]);
  });

  it("## 見出しは style h3 になる（後方互換）", () => {
    const blocks = textToPortableBlocks("## みだし");
    expect(blocks[0]).toMatchObject({ style: "h3" });
    expect(
      (blocks[0] as unknown as { children: { text: string }[] }).children[0]
        .text,
    ).toBe("みだし");
  });

  it("- 行は bullet listItem になる", () => {
    const blocks = textToPortableBlocks("- 項目");
    expect(blocks[0]).toMatchObject({
      _type: "block",
      style: "normal",
      listItem: "bullet",
      level: 1,
    });
  });

  it("**太字** は strong マーク付き span になる", () => {
    const blocks = textToPortableBlocks("あ**い**う");
    const children = (
      blocks[0] as unknown as { children: { text: string; marks: string[] }[] }
    ).children;
    expect(children).toEqual([
      { _type: "span", _key: "block-0-span-0", text: "あ", marks: [] },
      { _type: "span", _key: "block-0-span-1", text: "い", marks: ["strong"] },
      { _type: "span", _key: "block-0-span-2", text: "う", marks: [] },
    ]);
  });

  it("全 span/block に一意な _key が付与される", () => {
    const blocks = textToPortableBlocks("## 見出し\n本文\n- リスト");
    const keys = blocks.map(
      (b) => (b as unknown as { _key: string })._key,
    );
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("portableBlocksToText", () => {
  it("h3 / normal を記法付きプレーンに戻す", () => {
    const blocks = [
      { style: "h3", children: [{ _type: "span", text: "見出し", marks: [] }] },
      { style: "normal", children: [{ _type: "span", text: "本文", marks: [] }] },
    ];
    expect(portableBlocksToText(blocks)).toBe("## 見出し\n本文");
  });

  it("strong マークを **...** に戻す", () => {
    const blocks = [
      {
        style: "normal",
        children: [
          { _type: "span", text: "あ", marks: [] },
          { _type: "span", text: "い", marks: ["strong"] },
          { _type: "span", text: "う", marks: [] },
        ],
      },
    ];
    expect(portableBlocksToText(blocks)).toBe("あ**い**う");
  });

  it("空・null は空文字を返す", () => {
    expect(portableBlocksToText([])).toBe("");
    expect(portableBlocksToText(null)).toBe("");
    expect(portableBlocksToText(undefined)).toBe("");
  });

  // ---- 往復テスト（textToPortableBlocks → portableBlocksToText で概ね保存される）----

  it("往復: 見出し・太字・リストの混在が保存される", () => {
    const text = "## 見出し\n本文の**太字**\n- リスト1\n- リスト2";
    expect(portableBlocksToText(textToPortableBlocks(text))).toBe(text);
  });

  it("往復: 複数行の通常段落（改行保持）が保存される", () => {
    const text = "1行目\n2行目\n3行目";
    expect(portableBlocksToText(textToPortableBlocks(text))).toBe(text);
  });

  it("往復: 見出し内の太字が保存される", () => {
    const text = "## 見出し**強調**";
    expect(portableBlocksToText(textToPortableBlocks(text))).toBe(text);
  });
});
