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
      "w=1440"
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
      "https://cdn.test/abc-1920x2742.png?w=1440&fit=max&auto=format&q=80"
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

  it("サイズが読めない画像も今までどおり出す", () => {
    const { container } = render(
      <GuideContent content={imageBlock("image-abc")} />
    );
    expect(container.querySelector(".aspect-video")).not.toBeNull();
  });
});
