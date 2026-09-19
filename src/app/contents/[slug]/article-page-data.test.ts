import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArticleWithContext } from "@/types/sanity";
import type { SubscriptionState } from "@/types/subscription";
import { getArticleWithContext } from "@/lib/sanity";
import { getSubscriptionStatus } from "@/lib/subscription";
import { isBookmarked } from "@/lib/services/bookmarks";
import { getArticleProgress } from "@/lib/services/progress";
import { getArticlePageData, startArticlePageData } from "./article-page-data";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/sanity", () => ({ getArticleWithContext: vi.fn() }));
vi.mock("@/lib/subscription", () => ({ getSubscriptionStatus: vi.fn() }));
vi.mock("@/lib/services/bookmarks", () => ({ isBookmarked: vi.fn() }));
vi.mock("@/lib/services/progress", () => ({ getArticleProgress: vi.fn() }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

const article = { _id: "article-1" } as ArticleWithContext;
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

describe("getArticlePageData", () => {
  beforeEach(() => vi.clearAllMocks());

  it("starts article state reads before the subscription query finishes", async () => {
    const articleResult = deferred<ArticleWithContext | null>();
    const subscriptionResult = deferred<SubscriptionState>();
    vi.mocked(getArticleWithContext).mockReturnValue(articleResult.promise);
    vi.mocked(getSubscriptionStatus).mockReturnValue(subscriptionResult.promise);
    vi.mocked(isBookmarked).mockResolvedValue(true);
    vi.mocked(getArticleProgress).mockResolvedValue("completed");

    const result = getArticlePageData("article-slug");
    expect(getSubscriptionStatus).toHaveBeenCalledTimes(1);

    articleResult.resolve(article);
    await vi.waitFor(() => {
      expect(isBookmarked).toHaveBeenCalledWith("article-1");
      expect(getArticleProgress).toHaveBeenCalledWith("article-1");
    });

    subscriptionResult.resolve(subscription);
    await expect(result).resolves.toEqual({
      article,
      subscription,
      bookmarked: true,
      progressStatus: "completed",
    });
  });

  it("exposes article content before personalized data finishes", async () => {
    const subscriptionResult = deferred<SubscriptionState>();
    vi.mocked(getArticleWithContext).mockResolvedValue(article);
    vi.mocked(getSubscriptionStatus).mockReturnValue(subscriptionResult.promise);
    vi.mocked(isBookmarked).mockResolvedValue(false);
    vi.mocked(getArticleProgress).mockResolvedValue("not_started");

    const request = startArticlePageData("article-slug");

    await expect(request.articlePromise).resolves.toBe(article);
    const personalizedState = vi.fn();
    void request.dataPromise.then(personalizedState);
    await Promise.resolve();
    expect(personalizedState).not.toHaveBeenCalled();

    subscriptionResult.resolve(subscription);
    await expect(request.dataPromise).resolves.toMatchObject({ article });
  });

  it("does not query article state for missing content", async () => {
    vi.mocked(getArticleWithContext).mockResolvedValue(null);
    vi.mocked(getSubscriptionStatus).mockResolvedValue(subscription);

    await expect(getArticlePageData("missing")).resolves.toMatchObject({ article: null });
    expect(isBookmarked).not.toHaveBeenCalled();
    expect(getArticleProgress).not.toHaveBeenCalled();
  });
});
