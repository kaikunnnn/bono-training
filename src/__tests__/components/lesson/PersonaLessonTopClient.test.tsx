import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import PersonaLessonTopClient, {
  type PersonaLessonTopLesson,
} from "@/app/lessons/[slug]/PersonaLessonTopClient";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string | { src: string } }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={typeof src === "string" ? src : src.src} />
  ),
}));

const lesson: PersonaLessonTopLesson = {
  _id: "persona-lesson",
  title: "ペルソナ中心のUIデザイン",
  slug: { current: "scenario-based-design" },
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
      <PersonaLessonTopClient lesson={lesson} hasFullAccess={false} />
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
    render(<PersonaLessonTopClient lesson={lesson} hasFullAccess={false} />);

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
    render(<PersonaLessonTopClient lesson={lesson} hasFullAccess={false} />);

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
    render(<PersonaLessonTopClient lesson={memberLesson} hasFullAccess />);

    expect(screen.queryByText("無料")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /利用シーンを考える/ }));
    expect(screen.getByRole("img", { name: "閲覧可能" })).toBeInTheDocument();
  });

  it("has one h1 and a continuous h1-h3 heading hierarchy", () => {
    const { container } = render(
      <PersonaLessonTopClient lesson={lesson} hasFullAccess={false} />
    );
    const levels = [...container.querySelectorAll("h1, h2, h3")].map(
      (heading) => Number(heading.tagName.slice(1))
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(levels[0]).toBe(1);
    expect(levels.every((level, index) => index === 0 || level <= levels[index - 1] + 1)).toBe(true);
  });
});
