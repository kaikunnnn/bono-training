import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import PersonaLessonTopClient, {
  type PersonaLessonTopLesson,
} from "@/app/lessons/[slug]/PersonaLessonTopClient";
import {
  PERSONA_LESSON_SLUG,
  aiResearchLessonTopContent,
  getLessonTopContent,
  personaLessonTopContent,
} from "@/lib/persona-lesson-top-config";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string | { src: string } }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={typeof src === "string" ? src : src.src} />
  ),
}));

const lesson: PersonaLessonTopLesson = {
  _id: "persona-lesson",
  title: "ペルソナ中心のUIデザイン",
  slug: { current: PERSONA_LESSON_SLUG },
  quests: [
    {
      _id: "quest-1",
      questNumber: 1,
      title: "準備する",
      articles: [
        {
          _id: "pending",
          articleNumber: 1,
          title: "制作中：近日公開",
          slug: { current: "pending" },
          isLocked: false,
        },
        {
          _id: "free",
          articleNumber: 2,
          title: "トレーニングの準備",
          slug: { current: "training-intro" },
          articleType: "intro",
          isPremium: false,
          isLocked: false,
        },
      ],
    },
    {
      _id: "quest-2",
      questNumber: 2,
      title: "利用シーンを考える",
      articles: [
        {
          _id: "premium-video",
          articleNumber: 1,
          title: "利用シーンから課題を見つける",
          slug: { current: "find-user-problem" },
          thumbnailUrl: "https://example.com/thumbnail.jpg",
          videoUrl: "https://example.com/video",
          videoDuration: "12:30",
          articleType: "practice",
          isPremium: true,
          isLocked: true,
        },
      ],
    },
  ],
};

afterEach(cleanup);

describe("PersonaLessonTopClient", () => {
  it("starts from the first published article and keeps every production link under /contents", () => {
    const { container } = render(
      <PersonaLessonTopClient lesson={lesson} hasFullAccess={false} content={personaLessonTopContent} />
    );

    expect(
      screen.getByRole("link", { name: /トレーニングをはじめる/ })
    ).toHaveAttribute("href", "/contents/training-intro");
    expect(container.querySelector('a[href="/contents/pending"]')).toBeNull();

    const contentLinks = [...container.querySelectorAll('a[href^="/contents/"]')];
    expect(contentLinks.length).toBeGreaterThan(0);
    expect(contentLinks.every((link) => link.getAttribute("href")?.startsWith("/contents/"))).toBe(true);
    expect(container.innerHTML).not.toContain("/dev/");
  });

  it("opens only the first quest initially and uses plus/minus controls", () => {
    render(<PersonaLessonTopClient lesson={lesson} hasFullAccess={false} content={personaLessonTopContent} />);

    const firstToggle = screen.getByRole("button", { name: /準備する/ });
    const secondToggle = screen.getByRole("button", { name: /利用シーンを考える/ });
    expect(firstToggle).toHaveAttribute("aria-expanded", "true");
    expect(secondToggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(secondToggle);
    expect(secondToggle).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("link", { name: /利用シーンから課題を見つける/ })
    ).toHaveAttribute("href", "/contents/find-user-problem");

    fireEvent.click(firstToggle);
    expect(firstToggle).toHaveAttribute("aria-expanded", "false");
  });

  it("shows media, duration, free, and locked states for a visitor", () => {
    render(<PersonaLessonTopClient lesson={lesson} hasFullAccess={false} content={personaLessonTopContent} />);

    expect(screen.getByText("無料")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /利用シーンを考える/ }));

    const premiumArticle = screen.getByRole("link", {
      name: /利用シーンから課題を見つける/,
    });
    expect(within(premiumArticle).getByRole("img", { name: "動画" })).toBeInTheDocument();
    expect(within(premiumArticle).getByRole("img", { name: "有料" })).toBeInTheDocument();
    expect(within(premiumArticle).getByText("12:30")).toBeInTheDocument();
    expect(
      within(premiumArticle).getByRole("img", {
        name: "利用シーンから課題を見つけるのサムネイル",
      })
    ).toBeInTheDocument();
  });

  it("shows unlocked premium content and removes the free badge for an active member", () => {
    const memberLesson: PersonaLessonTopLesson = {
      ...lesson,
      quests: lesson.quests.map((quest) => ({
        ...quest,
        articles: quest.articles.map((article) => ({ ...article, isLocked: false })),
      })),
    };
    render(<PersonaLessonTopClient lesson={memberLesson} hasFullAccess content={personaLessonTopContent} />);

    expect(screen.queryByText("無料")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /利用シーンを考える/ }));
    expect(screen.getByRole("img", { name: "閲覧可能" })).toBeInTheDocument();
  });

  it("shows the five overview slides with direct thumbnail controls", () => {
    render(<PersonaLessonTopClient lesson={lesson} hasFullAccess={false} content={personaLessonTopContent} />);

    const carousel = screen.getByRole("group", { name: "トレーニングの進め方" });
    expect(
      within(carousel).getByRole("img", { name: /トレーニングの完成イメージ/ })
    ).toBeInTheDocument();

    fireEvent.click(
      within(carousel).getByRole("button", { name: "2枚目のスライドを表示" })
    );
    expect(
      within(carousel).getByRole("img", { name: /3ステップ/ })
    ).toBeInTheDocument();

    fireEvent.click(
      within(carousel).getByRole("button", { name: "5枚目のスライドを表示" })
    );
    expect(
      within(carousel).getByRole("img", { name: /デザイン検討ドキュメント/ })
    ).toBeInTheDocument();

    expect(within(carousel).queryByRole("button", { name: "次のスライド" })).toBeNull();
  });

  it("has one h1 and a continuous h1-h3 heading hierarchy", () => {
    const { container } = render(
      <PersonaLessonTopClient lesson={lesson} hasFullAccess={false} content={personaLessonTopContent} />
    );
    const levels = [...container.querySelectorAll("h1, h2, h3")].map(
      (heading) => Number(heading.tagName.slice(1))
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(levels[0]).toBe(1);
    expect(levels.every((level, index) => index === 0 || level <= levels[index - 1] + 1)).toBe(true);
  });

  it("keeps the persona copy that moved into the slug config", () => {
    render(
      <PersonaLessonTopClient lesson={lesson} hasFullAccess={false} content={personaLessonTopContent} />
    );

    expect(screen.getByText("FROM USER INSIGHT TO UI EXPERIENCE")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /コースを知る/ })).toHaveAttribute("href", "#overview");
    expect(screen.getByRole("heading", { level: 2, name: "制作するもの" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "目指す状態" })).toBeInTheDocument();
    expect(screen.getByText("お題の詳細は「準備」で説明します。")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "ペルソナ中心のUIデザインのコースアイコン" })
    ).toHaveAttribute("src", "/images/lesson-persona-ui/persona-icon.webp");
  });

  it("resolves the dedicated top only for configured slugs", () => {
    expect(getLessonTopContent(PERSONA_LESSON_SLUG)?.introVersion).toBe("persona-v1");
    expect(getLessonTopContent("ai-research-ui-design")?.introVersion).toBe("ai-research-v1");
    expect(getLessonTopContent("other-lesson")).toBeUndefined();
    expect(getLessonTopContent("toString")).toBeUndefined();
  });

  it("renders the AI research lesson from its own config", () => {
    const { container } = render(
      <PersonaLessonTopClient
        lesson={{ ...lesson, title: "AIリサーチではじめるUIデザイン" }}
        hasFullAccess={false}
        content={aiResearchLessonTopContent}
      />
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "最後に残るもの" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /レッスンを知る/ })).toBeInTheDocument();
    expect(screen.queryByText("FROM USER INSIGHT TO UI EXPERIENCE")).toBeNull();
    expect(
      screen.getByRole("img", { name: "ハナソの新規登録。話す言語と学びたい言語を選ぶ画面" })
    ).toHaveAttribute("src", "/images/lesson-ai-research/hanaso-icon.webp");

    const carousel = screen.getByRole("group", { name: "トレーニングの進め方" });
    expect(within(carousel).getAllByRole("button")).toHaveLength(3);
    fireEvent.click(within(carousel).getByRole("button", { name: "3枚目のスライドを表示" }));
    expect(within(carousel).getByRole("img", { name: /残業32\/45時間/ })).toBeInTheDocument();

    const levels = [...container.querySelectorAll("h1, h2, h3")].map(
      (heading) => Number(heading.tagName.slice(1))
    );
    expect(levels.every((level, index) => index === 0 || level <= levels[index - 1] + 1)).toBe(true);
  });
});
