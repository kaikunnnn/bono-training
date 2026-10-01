import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PricingCtaLink } from "@/components/analytics/PricingCtaLink";
import { trackPricingCtaClick } from "@/lib/activity-client";

vi.mock("@/lib/activity-client", () => ({ trackPricingCtaClick: vi.fn() }));

// グローバルの next/link モックは onClick を落とすため、ここでは props をそのまま渡す
vi.mock("next/link", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return {
    default: ({ children, ...props }: { children: React.ReactNode }) =>
      React.createElement("a", props, children),
  };
});

describe("PricingCtaLink", () => {
  beforeEach(() => vi.clearAllMocks());

  it("href に from を付け、クリックで source_group を計測する", () => {
    const onClick = vi.fn();
    render(
      <PricingCtaLink group="content_lock" className="x" onClick={onClick}>
        プランを見る
      </PricingCtaLink>
    );
    const link = screen.getByText("プランを見る");
    expect(link.getAttribute("href")).toBe("/subscription?from=content_lock");
    expect(link.className).toBe("x");
    fireEvent.click(link);
    expect(trackPricingCtaClick).toHaveBeenCalledWith("content_lock");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
