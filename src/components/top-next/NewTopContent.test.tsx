import { Children, isValidElement, Suspense, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { NewTopContent } from "./NewTopContent";
import { HeroSection, MembershipCta } from "./organisms/HeroSection";
import { LessonCardRenderer } from "@/app/lessons/LessonCardRenderer";
import {
  getAllLessonsWithArticleIds,
  getAchievementGroups,
  getLatestMixedContent,
  getAllGuidesFromSanity,
} from "@/lib/sanity";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/sanity", () => ({
  getAllLessonsWithArticleIds: vi.fn(),
  getAchievementGroups: vi.fn(),
  getLatestMixedContent: vi.fn(),
  getAllGuidesFromSanity: vi.fn(),
}));

type Element = ReactElement<{ children?: ReactNode; fallback?: ReactNode }>;

function descendants(node: ReactNode): Element[] {
  return Children.toArray(node).flatMap((child) => {
    if (!isValidElement(child)) return [];
    const element = child as Element;
    return [element, ...descendants(element.props.children)];
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe("top-page streaming contract", () => {
  it.each([true, false])("returns the shell without awaiting CMS (isMember=%s)", (isMember) => {
    vi.clearAllMocks();
    const shell = NewTopContent({ isMember });
    expect(isValidElement(shell)).toBe(true);
    const elements = descendants(shell);
    const hero = elements.find((element) => element.type === HeroSection);
    expect(hero?.props).toEqual({ isMember, membershipCta: undefined });
    for (const fetcher of [getAllLessonsWithArticleIds, getAchievementGroups, getLatestMixedContent, getAllGuidesFromSanity]) {
      expect(fetcher).not.toHaveBeenCalled();
    }
    const boundaries = elements.filter((element) => element.type === Suspense);
    expect(boundaries).toHaveLength(4);
    for (const boundary of boundaries) {
      expect(boundary.props.fallback).toBeTruthy();
      expect(descendants(boundary.props.children).some((element) => element.type === HeroSection)).toBe(false);
    }
  });

  it("resolves each CMS section independently and preserves its data mapping", async () => {
    const latest = deferred<Awaited<ReturnType<typeof getLatestMixedContent>>>();
    const guides = deferred<Awaited<ReturnType<typeof getAllGuidesFromSanity>>>();
    const lessons = deferred<Awaited<ReturnType<typeof getAllLessonsWithArticleIds>>>();
    const achievements = deferred<Awaited<ReturnType<typeof getAchievementGroups>>>();
    vi.mocked(getLatestMixedContent).mockReturnValue(latest.promise);
    vi.mocked(getAllGuidesFromSanity).mockReturnValue(guides.promise);
    vi.mocked(getAllLessonsWithArticleIds).mockReturnValue(lessons.promise);
    vi.mocked(getAchievementGroups).mockReturnValue(achievements.promise);

    const boundaries = descendants(NewTopContent({ isMember: true }))
      .filter((element) => element.type === Suspense);
    // Unit-test async functions directly; Vitest cannot render async RSC trees.
    // Real streaming/SEO/layout must also be checked against `next build && next start`.
    const pending = boundaries.map((boundary) => {
      const child = Children.only(boundary.props.children) as Element;
      const component = child.type as (props: Element["props"]) => Promise<ReactElement>;
      return component(child.props);
    });
    expect(getLatestMixedContent).toHaveBeenCalledWith(4);
    expect(getAchievementGroups).toHaveBeenCalledWith(3);
    expect(getAllGuidesFromSanity).toHaveBeenCalled();
    expect(getAllLessonsWithArticleIds).toHaveBeenCalled();

    // These finish even though the guide and lesson requests are still pending.
    latest.resolve([
      { type: "記事", title: "新しい記事", href: "/contents/test", thumbnail: "/test.jpg", publishedAt: "2026-09-18" },
      { type: "掲示板", title: "画像なし", href: "/questions/test", thumbnail: "", publishedAt: "2026-09-17" },
    ]);
    expect((await pending[0]).props).toMatchObject({
      articles: [
        { category: "記事", title: "新しい記事", href: "/contents/test", image: "/test.jpg" },
        { category: "掲示板", title: "画像なし", href: "/questions/test", image: undefined },
      ],
      viewAllHref: "/updates",
    });
    const groups: Awaited<ReturnType<typeof getAchievementGroups>> = {
      stories: [{ type: "story", title: "体験談", thumbnailUrl: "/story.jpg", href: "/stories/test", publishedAt: "2026-09-18" }],
      outputs: [{ type: "output", title: "作品", thumbnailUrl: "/output.jpg", href: "https://example.com/work", publishedAt: "2026-09-18" }],
    };
    achievements.resolve(groups);
    expect((await pending[3]).props).toMatchObject({ storyItems: groups.stories, outputItems: groups.outputs });
    guides.resolve([{
      _id: "guide", title: "ガイド", description: "", slug: "portfolio-01",
      category: "career", author: "BONO", publishedAt: "2026-09-18", thumbnailUrl: "/guide.jpg",
    }]);
    expect((await pending[1]).props).toMatchObject({ guides: expect.arrayContaining([
      expect.objectContaining({ href: "/guide/portfolio-01", image: "/guide.jpg" }),
    ]) });
    const lesson: Awaited<ReturnType<typeof getAllLessonsWithArticleIds>>[number] = {
      _id: "figma", _type: "lesson", title: "Figmaの使い方入門",
      slug: { _type: "slug", current: "figmabeginner" }, articleIds: [],
    };
    lessons.resolve([lesson]);
    expect((await pending[2]).props).toMatchObject({
      imageLoading: "lazy",
      rows: [
        { subheading: "基本のデザインフローを身につける", lessons: [] },
        { subheading: "UIデザインをはじめる", lessons: [lesson] },
      ],
    });
  });

  it("keeps membership CTA behavior and a single h1 in the hero", () => {
    const member = renderToStaticMarkup(<HeroSection isMember />);
    const guest = renderToStaticMarkup(<HeroSection isMember={false} />);
    expect(member).not.toContain("メンバーになってはじめる");
    expect(guest).toContain("メンバーになってはじめる");
    expect(member.match(/<h1[ >]/g)).toHaveLength(1);
  });

  it("can stream only the membership CTA without blocking the hero shell", () => {
    const membershipCta = (
      <Suspense fallback={null}>
        <MembershipCta />
      </Suspense>
    );
    const shell = NewTopContent({ membershipCta });
    const hero = descendants(shell).find((element) => element.type === HeroSection);
    expect(hero?.props).toEqual({ isMember: false, membershipCta });
    expect(renderToStaticMarkup(<HeroSection membershipCta={null} />)).not.toContain(
      "メンバーになってはじめる",
    );
  });

  it("renders fallbacks without fake links or duplicate main headings", () => {
    const boundaries = descendants(NewTopContent({ isMember: true }))
      .filter((element) => element.type === Suspense);
    const html = boundaries.map((boundary) => renderToStaticMarkup(boundary.props.fallback)).join("");
    expect(html).not.toMatch(/<h1[ >]/);
    expect(html).not.toContain('href="#"');
    expect(html.match(/aria-busy="true"/g)).toHaveLength(3);
    expect(html).toContain('/guide/portfolio-01');
  });

  it.each([undefined, "lazy", "eager"] as const)("preserves explicit image loading policy (%s)", (imageLoading) => {
    const html = renderToStaticMarkup(<LessonCardRenderer
      lesson={{ _id: "test", _type: "lesson", title: "テスト", slug: { _type: "slug", current: "test" }, thumbnailUrl: "/book.webp" }}
      imageLoading={imageLoading}
    />);
    if (imageLoading) expect(html).toContain(`loading="${imageLoading}"`);
    else expect(html).not.toContain('loading="');
    if (imageLoading === "lazy") {
      expect(html).toContain('decoding="async"');
      expect(html).not.toContain('rel="preload"');
    }
    expect(html).toContain("aspect-[2/3]");
  });
});
