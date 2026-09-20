import { fireEvent, render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { Footer } from "./Footer";
import { SidebarMenuItem } from "./Sidebar/SidebarMenuItem";
import { SidebarLogo } from "./Sidebar/SidebarLogo";

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
});
