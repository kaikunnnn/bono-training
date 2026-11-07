import { render } from "@testing-library/react";
import type { PortableTextBlock } from "@portabletext/types";
import { describe, expect, it, vi } from "vitest";
import GuideContent from "./GuideContent";

vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({
    width: (w: number) => ({
      fit: () => ({
        auto: () => ({
          quality: () => ({ url: () => `https://cdn.test/image.png?w=${w}` }),
        }),
      }),
    }),
  }),
}));

const imageBlock = (ref: string) =>
  [
    {
      _type: "image",
      _key: "a",
      alt: "図",
      asset: { _type: "reference", _ref: ref },
    },
  ] as unknown as PortableTextBlock[];

describe("GuideContent の画像", () => {
  it("縦長の画像は本来の比率で出す", () => {
    const { container } = render(
      <GuideContent content={imageBlock("image-abc-1920x2742-png")} />
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("width")).toBe("1920");
    expect(img?.getAttribute("height")).toBe("2742");
    expect(img?.className).toContain("h-auto");
    expect(container.querySelector(".aspect-video")).toBeNull();
  });

  it("横長の画像は今までどおり16:9の枠に出す", () => {
    const { container } = render(
      <GuideContent content={imageBlock("image-abc-1920x1080-png")} />
    );
    expect(container.querySelector(".aspect-video")).not.toBeNull();
    expect(container.querySelector("img")?.getAttribute("src")).toContain(
      "w=1296"
    );
  });

  const urlBlock = (url: string) =>
    [
      { _type: "image", _key: "a", alt: "図", asset: { _id: "x", url } },
    ] as unknown as PortableTextBlock[];

  it("URLの画像は幅と形式を指定して軽くする", () => {
    const { container } = render(
      <GuideContent
        content={urlBlock("https://cdn.test/abc-1920x2742.png")}
      />
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe(
      "https://cdn.test/abc-1920x2742.png?w=1296&fit=max&auto=format&q=80"
    );
    expect(img?.getAttribute("height")).toBe("2742");
  });

  it("GIFは動きを保つためそのまま出す", () => {
    const { container } = render(
      <GuideContent content={urlBlock("https://cdn.test/abc-800x600.gif")} />
    );
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "https://cdn.test/abc-800x600.gif"
    );
  });

  it("リンクカードは白背景で、画像があれば出す", () => {
    const { container } = render(
      <GuideContent
        content={
          [
            {
              _type: "linkCard",
              _key: "c",
              title: "転職ロードマップ",
              url: "https://www.bo-no.design/roadmap/uiux-career-change",
              imageUrl: "https://cdn.test/ogp.webp?w=480",
            },
          ] as unknown as PortableTextBlock[]
        }
      />
    );
    expect(container.querySelector("a")?.className).toContain("bg-surface");
    expect(container.querySelector("a img")?.getAttribute("src")).toBe(
      "https://cdn.test/ogp.webp?w=480"
    );
  });

  it("目次のリンク先は本文の見出しのIDと一致する", () => {
    const heading = (style: string, text: string) => ({
      _type: "block",
      _key: text,
      style,
      markDefs: [],
      children: [{ _type: "span", _key: `${text}s`, text, marks: [] }],
    });
    const { container } = render(
      <GuideContent
        showToc
        content={
          [
            {
              _type: "block",
              _key: "p",
              style: "normal",
              markDefs: [],
              children: [{ _type: "span", _key: "ps", text: "あいさつ", marks: [] }],
            },
            heading("h2", "UI/UXデザイナーを目指そう！"),
            heading("h3", "小見出し"),
            heading("h2", "ステップ1 ツールを習得"),
          ] as unknown as PortableTextBlock[]
        }
      />
    );
    const links = [...container.querySelectorAll("nav a")];
    const ids = [...container.querySelectorAll("h2")].map((h) => h.id);
    expect(links.map((a) => a.getAttribute("href"))).toEqual(
      ids.map((id) => `#${id}`)
    );
    expect(ids).toHaveLength(2);
    // あいさつの後、最初の見出しの前に目次が出る
    const nav = container.querySelector("nav") as Element;
    expect(
      container.querySelector("p")?.compareDocumentPosition(nav)
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("showToc がなければ目次は出ない", () => {
    const { container } = render(
      <GuideContent content={imageBlock("image-abc-1920x1080-png")} />
    );
    expect(container.querySelector("nav")).toBeNull();
  });

  it("サイズが読めない画像も今までどおり出す", () => {
    const { container } = render(
      <GuideContent content={imageBlock("image-abc")} />
    );
    expect(container.querySelector(".aspect-video")).not.toBeNull();
  });
});
