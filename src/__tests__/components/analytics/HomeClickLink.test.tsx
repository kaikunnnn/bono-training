import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomeClickLink } from "@/components/analytics/HomeClickLink";
import { IntentPrefetchLink } from "@/components/common/IntentPrefetchLink";
import { trackHomeClick } from "@/lib/activity-client";
import type { HomeClickTracking } from "@/lib/activity-utils";

vi.mock("@/lib/activity-client", () => ({ trackHomeClick: vi.fn() }));

// グローバルの next/link モックは onClick を落とすため、ここでは props をそのまま渡す
vi.mock("next/link", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return {
    default: ({ children, prefetch: _p, ...props }: { children: React.ReactNode; prefetch?: unknown }) => {
      void _p;
      return React.createElement("a", props, children);
    },
  };
});

const tracking: HomeClickTracking = {
  surface: "top",
  section: "new_content",
  itemType: "event",
  position: 2,
  contentId: "oct-meetup",
};

describe("HomeClickLink", () => {
  beforeEach(() => vi.clearAllMocks());

  it("見た目は呼び出し側のまま、クリックで home_click を計測して onClick も呼ぶ", () => {
    const onClick = vi.fn();
    render(
      <HomeClickLink href="/events/oct-meetup" className="x" tracking={tracking} onClick={onClick}>
        イベント
      </HomeClickLink>
    );
    const link = screen.getByText("イベント");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/events/oct-meetup");
    expect(link.className).toBe("x");
    expect(link.getAttribute("tracking")).toBeNull();
    fireEvent.click(link);
    expect(trackHomeClick).toHaveBeenCalledWith(tracking);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("intentPrefetch なら IntentPrefetchLink で描画する（hover まで prefetch しない）", () => {
    const element = HomeClickLink({ href: "/lessons/x", tracking, intentPrefetch: true, children: "x" });
    expect(element.type).toBe(IntentPrefetchLink);
    render(
      <HomeClickLink href="/lessons/x" tracking={tracking} intentPrefetch>
        レッスン
      </HomeClickLink>
    );
    fireEvent.click(screen.getByText("レッスン"));
    expect(trackHomeClick).toHaveBeenCalledTimes(1);
  });
});
