import { fireEvent, render, screen } from "@testing-library/react";
import type {
  AnchorHTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from "react";
import { describe, expect, it, vi } from "vitest";
import { GuideCard } from "./GuideCard";
import StoryCardItem from "@/components/story/StoryCardItem";
import OutputBannerCardItem from "@/components/output/OutputBannerCardItem";
import type { Guide } from "@/types/guide";
import type { StorySummary, UserOutputSummary } from "@/types/sanity";

vi.mock("next/link", () => ({
  default: ({
    prefetch,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    prefetch?: boolean | null;
    children: ReactNode;
  }) => (
    <a {...props} data-prefetch={String(prefetch)}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    fill,
    sizes,
    loading,
    preload,
    unoptimized,
    alt,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    preload?: boolean;
    unoptimized?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt ?? ""}
      data-fill={String(fill)}
      data-sizes={sizes}
      data-loading={loading}
      data-preload={String(preload)}
      data-unoptimized={String(unoptimized)}
    />
  ),
}));

const guide: Guide = {
  _id: "guide-1",
  title: "デザインの学び方",
  description: "学習を続けるヒント",
  slug: "how-to-learn-design",
  category: "learning",
  thumbnailUrl: "https://cdn.sanity.io/images/test/guide.jpg",
  author: "カイクン",
  publishedAt: "2026-09-20T00:00:00.000Z",
};

const story: StorySummary = {
  _id: "story-1",
  _type: "story",
  title: "UIデザイナーへの転職",
  slug: { _type: "slug", current: "career-change" },
  publishedAt: "2026-09-20T00:00:00.000Z",
  excerpt: "学習の記録",
  heroImageUrl: "https://cdn.sanity.io/images/test/story.jpg",
  category: "uiux_career_change",
  categoryLabel: "UIUX転職",
  tags: ["未経験"],
  person: {
    name: "BONOメンバー",
    profileImageUrl: "https://cdn.sanity.io/images/test/profile.jpg",
    currentRole: "UIデザイナー",
  },
};

const output: UserOutputSummary = {
  _id: "output-1",
  _type: "userOutput",
  articleUrl: "https://example.com/output",
  articleTitle: "学習アウトプット",
  articleImage: "https://cdn.sanity.io/images/test/output.jpg",
  submittedAt: "2026-09-20T00:00:00.000Z",
  author: { displayName: "BONOメンバー" },
};

describe("guide and achievements list performance", () => {
  it("prefetches guide and story details only after navigation intent", () => {
    render(
      <>
        <GuideCard guide={guide} />
        <StoryCardItem story={story} />
      </>
    );

    const guideLink = screen.getByRole("link", { name: /デザインの学び方/ });
    const storyLink = screen.getByRole("link", { name: /UIデザイナーへの転職/ });
    expect(guideLink.getAttribute("data-prefetch")).toBe("false");
    expect(storyLink.getAttribute("data-prefetch")).toBe("false");

    fireEvent.mouseEnter(guideLink);
    expect(guideLink.getAttribute("data-prefetch")).toBe("null");
  });

  it("preloads only explicitly prioritized responsive images", () => {
    render(
      <>
        <GuideCard guide={guide} imagePreload />
        <StoryCardItem story={story} />
        <OutputBannerCardItem output={output} />
      </>
    );

    const guideImage = screen.getByRole("img", { name: guide.title });
    expect(guideImage.getAttribute("data-preload")).toBe("true");
    expect(guideImage.getAttribute("data-loading")).toBeNull();
    expect(guideImage.getAttribute("data-sizes")).toContain("31vw");
    expect(guideImage.getAttribute("data-unoptimized")).not.toBe("true");

    const storyImage = screen.getByRole("img", { name: story.title });
    expect(storyImage.getAttribute("data-preload")).toBe("false");
    expect(storyImage.getAttribute("data-loading")).toBe("lazy");
    expect(storyImage.getAttribute("data-unoptimized")).not.toBe("true");

    const outputImage = screen.getByRole("img", { name: "学習アウトプット" });
    expect(outputImage.getAttribute("data-loading")).toBe("lazy");
    expect(outputImage.getAttribute("data-unoptimized")).not.toBe("true");
  });
});
