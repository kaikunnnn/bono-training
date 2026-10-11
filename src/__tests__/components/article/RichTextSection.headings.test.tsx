import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { PortableTextBlock } from "@portabletext/types";
import RichTextSection from "@/components/article/RichTextSection";

vi.mock("@/components/premium/ContentPreviewOverlay", () => ({
  default: () => null,
}));
vi.mock("@/components/analytics/CommunityJoinLink", () => ({
  CommunityJoinLink: () => null,
}));

const heading = (style: string, text: string, key: string) =>
  ({
    _type: "block",
    _key: key,
    style,
    markDefs: [],
    children: [{ _type: "span", _key: `${key}s`, text, marks: [] }],
  }) as PortableTextBlock;

const levels = (html: string) =>
  [...html.matchAll(/<(h[1-6])[\s>]/g)].map((m) => m[1]);

describe("RichTextSection の見出し階層（#236）", () => {
  it("本文に h1 があれば全見出しを1段下げ、h1 を出さない", () => {
    const html = renderToStaticMarkup(
      <RichTextSection
        content={[
          heading("h1", "大見出し", "a"),
          heading("h2", "中見出し", "b"),
          heading("h3", "小見出し", "c"),
          heading("h4", "細見出し", "d"),
        ]}
      />,
    );
    expect(levels(html)).toEqual(["h2", "h3", "h4", "h5"]);
    // 見た目は元のスタイルのまま（元 h2 のクラスが h3 タグに付く）
    expect(html).toMatch(/<h3 id="heading-b-[^"]*" class="[^"]*md:!text-\[24px\]/);
  });

  it("本文に h1 が無ければ従来どおり", () => {
    const html = renderToStaticMarkup(
      <RichTextSection
        content={[heading("h2", "中見出し", "b"), heading("h3", "小見出し", "c")]}
      />,
    );
    expect(levels(html)).toEqual(["h2", "h3"]);
  });
});

describe("RichTextSection の見出し飛ばし対策（#236）", () => {
  it("段を飛ばした見出しは直前+1段に詰める（クラスは元のまま）", () => {
    const html = renderToStaticMarkup(
      <RichTextSection
        content={[
          heading("h3", "いきなり小見出し", "a"),
          heading("h2", "中見出し", "b"),
          heading("h4", "飛ばした見出し", "c"),
        ]}
      />,
    );
    expect(levels(html)).toEqual(["h2", "h2", "h3"]);
    // 元 h4 のクラス（md:!text-[18px]）のまま h3 タグになる
    expect(html).toMatch(/<h3 id="heading-c-[^"]*" class="[^"]*md:!text-\[18px\]/);
  });

  it("h1 を含む記事で h1 の直後に h3 があっても飛ばさない", () => {
    const html = renderToStaticMarkup(
      <RichTextSection
        content={[heading("h1", "大", "a"), heading("h3", "小", "b"), heading("h2", "中", "c")]}
      />,
    );
    expect(levels(html)).toEqual(["h2", "h3", "h3"]);
  });
});
