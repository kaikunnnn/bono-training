import { fireEvent, render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { IntentPrefetchLink } from "./IntentPrefetchLink";

vi.mock("next/link", () => ({
  default: ({ prefetch, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    prefetch?: boolean | null;
  }) => (
    <a {...props} data-prefetch={String(prefetch)} />
  ),
}));

describe("IntentPrefetchLink", () => {
  it("avoids viewport prefetch and enables it only after navigation intent", () => {
    render(<IntentPrefetchLink href="/lessons">レッスン</IntentPrefetchLink>);
    const link = screen.getByRole("link", { name: "レッスン" });

    expect(link.getAttribute("data-prefetch")).toBe("false");
    fireEvent.mouseEnter(link);
    expect(link.getAttribute("data-prefetch")).toBe("null");
  });
});
