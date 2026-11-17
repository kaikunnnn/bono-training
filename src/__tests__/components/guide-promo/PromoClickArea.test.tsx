import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { trackEvent } from "@/lib/analytics";
import { PromoClickArea } from "@/components/guide-promo/PromoClickArea";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("PromoClickArea", () => {
  it("sends roadmap_promo_click with placement and destination from the clicked link", () => {
    render(
      <PromoClickArea
        tracking={{ placement: "end", pageType: "guide", pageSlug: "x", roadmapSlug: "uiux-career-change" }}
      >
        <a href="/roadmap/uiux-career-change">
          <span>card</span>
        </a>
        <a href="/subscription?from=other">料金を見る</a>
        <p>text</p>
      </PromoClickArea>
    );
    fireEvent.click(screen.getByText("card"));
    fireEvent.click(screen.getByText("料金を見る"));
    fireEvent.click(screen.getByText("text"));
    expect(trackEvent).toHaveBeenCalledTimes(2);
    expect(trackEvent).toHaveBeenNthCalledWith(1, "roadmap_promo_click", {
      placement: "end",
      destination: "roadmap",
      page_type: "guide",
      page_slug: "x",
      roadmap_slug: "uiux-career-change",
    });
    expect(vi.mocked(trackEvent).mock.calls[1][1]).toMatchObject({ destination: "pricing" });
  });
});
