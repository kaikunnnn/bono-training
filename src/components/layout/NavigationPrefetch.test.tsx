import { fireEvent, render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { Footer } from "./Footer";
import { SidebarMenuItem } from "./Sidebar/SidebarMenuItem";
import { SidebarLogo } from "./Sidebar/SidebarLogo";
import { PricingCtaLink } from "@/components/analytics/PricingCtaLink";
import { PurposeItem } from "@/components/top-next/molecules/PurposeItem";
import { PromoCard } from "@/components/top-next/molecules/PromoCard";
import { trackPricingCtaClick } from "@/lib/activity-client";

vi.mock("@/lib/activity-client", () => ({
  trackPricingCtaClick: vi.fn(),
  trackHomeClick: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ prefetch, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    prefetch?: boolean | null;
  }) => <a {...props} data-prefetch={String(prefetch)} />,
}));

describe("persistent navigation prefetch", () => {
  it("does not eagerly fetch every route while the footer or sidebar is visible", () => {
    render(
      <>
        <SidebarLogo />
        <SidebarMenuItem href="/lessons" icon={<span />}>レッスン</SidebarMenuItem>
        <Footer />
      </>
    );

    const internalLinks = screen.getAllByRole("link").filter((link) =>
      link.getAttribute("href")?.startsWith("/")
    );
    expect(internalLinks.length).toBeGreaterThan(10);
    expect(internalLinks.every((link) => link.getAttribute("data-prefetch") === "false"))
      .toBe(true);

    const lessonsLink = screen.getByRole("link", { name: "レッスン" });
    fireEvent.mouseEnter(lessonsLink);
    expect(lessonsLink.getAttribute("data-prefetch")).toBe("null");
  });

  // #277: 画面に入っただけで /subscription・トップの導線を先読みしていた共通部品
  it("defers pricing CTA and top navigation prefetch until intent", () => {
    render(
      <>
        <PricingCtaLink group="top">メンバーになってはじめる</PricingCtaLink>
        <PurposeItem
          subLabel="UI・UXのコンテンツ"
          label="レッスン"
          icon={<span />}
          href="/lessons"
          tracking={{ surface: "top", section: "purpose_nav", itemType: "lesson" }}
        />
        <PromoCard title="UIUX転職ロードマップ" href="/roadmap/uiux-career-change" />
      </>
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links.every((link) => link.getAttribute("data-prefetch") === "false")).toBe(true);

    const pricing = screen.getByRole("link", { name: "メンバーになってはじめる" });
    expect(pricing.getAttribute("href")).toBe("/subscription?from=top");
    fireEvent.mouseEnter(pricing);
    expect(pricing.getAttribute("data-prefetch")).toBe("null");
    fireEvent.click(pricing);
    expect(trackPricingCtaClick).toHaveBeenCalledWith("top");
  });
});
