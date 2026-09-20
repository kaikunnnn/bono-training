import { fireEvent, render, screen } from "@testing-library/react";
import type {
  AnchorHTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from "react";
import { describe, expect, it, vi } from "vitest";
import CategoryNav from "@/components/common/CategoryNav";
import { LessonCardRenderer } from "@/app/lessons/LessonCardRenderer";
import RoadmapCardV2 from "@/components/roadmap/RoadmapCardV2";

const emptySearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/lessons",
  useSearchParams: () => emptySearchParams,
}));

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
    unoptimized,
    alt,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    unoptimized?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt ?? ""}
      data-fill={String(fill)}
      data-sizes={sizes}
      data-loading={loading}
      data-unoptimized={String(unoptimized)}
    />
  ),
}));

vi.mock("@/lib/sanity", () => ({
  urlFor: vi.fn(),
}));

const lesson = {
  _id: "lesson-1",
  _type: "lesson" as const,
  _createdAt: "2026-09-20T00:00:00.000Z",
  title: "UIの基本",
  slug: { _type: "slug" as const, current: "ui-basics" },
  description: "UIを基礎から学ぶ",
  lessonNumber: 1,
  iconImageUrl: "https://cdn.sanity.io/images/test/lesson.jpg",
  tags: ["UI"],
  isPremium: false,
};

describe("lesson and roadmap list performance", () => {
  it("prefetches category and detail routes only after navigation intent", () => {
    render(
      <>
        <CategoryNav
          items={[
            { label: "おすすめ", href: "/lessons" },
            { label: "UI", href: "/lessons/category/ui" },
          ]}
        />
        <LessonCardRenderer lesson={lesson} imageLoading="lazy" />
        <RoadmapCardV2
          slug="ui-roadmap"
          title="UIロードマップ"
          description="UIの学習順序"
          estimatedDuration="3ヶ月"
        />
      </>
    );

    const links = screen.getAllByRole("link");
    expect(links.every((link) => link.getAttribute("data-prefetch") === "false"))
      .toBe(true);

    const lessonLink = screen.getByRole("link", { name: /UIの基本/ });
    fireEvent.mouseEnter(lessonLink);
    expect(lessonLink.getAttribute("data-prefetch")).toBe("null");
  });

  it("uses responsive optimized images and keeps only the first image eager", () => {
    render(
      <>
        <LessonCardRenderer lesson={lesson} imageLoading="eager" />
        <RoadmapCardV2
          slug="ui-roadmap"
          title="UIロードマップ"
          description="UIの学習順序"
          thumbnailUrl="https://cdn.sanity.io/images/test/roadmap.webp"
          estimatedDuration="3ヶ月"
          imageLoading="lazy"
          imageSizes="45vw"
        />
      </>
    );

    const lessonImage = screen.getByRole("img", {
      name: "UIの基本のサムネイル",
    });
    expect(lessonImage.getAttribute("data-fill")).toBe("true");
    expect(lessonImage.getAttribute("data-loading")).toBe("eager");

    const roadmapImage = screen.getByRole("img", { name: "UIロードマップ" });
    expect(roadmapImage.getAttribute("data-sizes")).toBe("45vw");
    expect(roadmapImage.getAttribute("data-loading")).toBe("lazy");
    expect(roadmapImage.getAttribute("data-unoptimized")).not.toBe("true");
  });
});
