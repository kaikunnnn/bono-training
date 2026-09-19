import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLesson } from "@/lib/sanity";
import { getLessonProgress } from "@/lib/services/progress";
import { getSubscriptionStatus } from "@/lib/subscription";
import type { SubscriptionState } from "@/types/subscription";
import {
  startLessonPageData,
  startStandardLessonPresentation,
  type LessonPageLesson,
} from "./lesson-page-data";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/sanity", () => ({ getLesson: vi.fn() }));
vi.mock("@/lib/services/progress", () => ({ getLessonProgress: vi.fn() }));
vi.mock("@/lib/subscription", () => ({
  getSubscriptionStatus: vi.fn(),
  getEffectiveLearningPlanType: vi.fn(() => "standard"),
  isContentLocked: vi.fn(() => false),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

const lesson = {
  _id: "lesson-1",
  title: "Lesson",
  quests: [
    {
      _id: "quest-1",
      title: "Quest",
      articles: [
        { _id: "article-1", title: "One", slug: { current: "one" } },
      ],
    },
  ],
} as LessonPageLesson;

const subscription = {
  isLoggedIn: true,
  isSubscribed: true,
  planType: "standard",
  duration: 1,
  cancelAtPeriodEnd: false,
  cancelAt: null,
  renewalDate: null,
  hasMemberAccess: true,
  hasLearningAccess: true,
} satisfies SubscriptionState;

describe("lesson page data", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exposes CMS lesson data without waiting for the subscription", async () => {
    const subscriptionResult = deferred<SubscriptionState>();
    vi.mocked(getLesson).mockResolvedValue(lesson);
    vi.mocked(getSubscriptionStatus).mockReturnValue(subscriptionResult.promise);

    const request = startLessonPageData("lesson-slug");

    await expect(request.lessonPromise).resolves.toBe(lesson);
    subscriptionResult.resolve(subscription);
    await expect(request.subscriptionPromise).resolves.toBe(subscription);
  });

  it("starts progress before the subscription finishes", async () => {
    const subscriptionResult = deferred<SubscriptionState>();
    vi.mocked(getLessonProgress).mockResolvedValue({
      lessonId: "lesson-1",
      totalArticles: 1,
      completedArticles: 1,
      percentage: 100,
      completedArticleIds: ["article-1"],
      lastUpdatedAt: null,
    });

    const presentation = startStandardLessonPresentation(
      lesson,
      subscriptionResult.promise,
    );

    expect(getLessonProgress).toHaveBeenCalledWith("lesson-1", ["article-1"]);
    subscriptionResult.resolve(subscription);
    await expect(presentation).resolves.toMatchObject({
      progressPercent: 100,
      questProgressMap: {
        "quest-1": { completed: 1, total: 1 },
      },
    });
  });
});
