import { render } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import IconBlock from "./IconBlock";

vi.mock("next/image", () => ({
  default: ({
    fill,
    sizes,
    loading,
    alt,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt ?? ""}
      data-fill={String(fill)}
      data-sizes={sizes}
      data-loading={loading}
    />
  ),
}));

describe("training detail performance", () => {
  it("uses the lightweight responsive icon asset on the detail hero", () => {
    const { container } = render(
      <IconBlock
        iconSrc="/assets/emoji/check.svg"
        iconAlt="習慣化のアイコン"
        size="lg"
      />
    );
    const image = container.querySelector("img");

    expect(image?.getAttribute("src")).toBe(
      "/assets/emoji/optimized/check.webp"
    );
    expect(image?.getAttribute("data-fill")).toBe("true");
    expect(image?.getAttribute("data-sizes")).toBe("68px");
    expect(image?.getAttribute("data-loading")).toBe("eager");
  });
});
