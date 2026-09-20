import { fireEvent, render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import HowToIndexPage from "./page";

vi.mock("next/link", () => ({
  default: ({ prefetch, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    prefetch?: boolean | null;
  }) => (
    <a {...props} data-prefetch={String(prefetch)} />
  ),
}));

describe("how-to index performance", () => {
  it("prefetches guide destinations only after navigation intent", () => {
    render(<HowToIndexPage />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
    expect(links.every((link) => link.dataset.prefetch === "false")).toBe(true);

    fireEvent.mouseEnter(links[0]);
    expect(links[0].dataset.prefetch).toBe("null");
    expect(links.slice(1).every((link) => link.dataset.prefetch === "false")).toBe(
      true
    );
  });
});
