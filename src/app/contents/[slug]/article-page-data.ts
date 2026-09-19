import "server-only";
import { getArticleWithContext } from "@/lib/sanity";
import { getSubscriptionStatus } from "@/lib/subscription";
import { isBookmarked } from "@/lib/services/bookmarks";
import { getArticleProgress } from "@/lib/services/progress";
import { traceServerStep } from "@/lib/performance/server-trace";

/**
 * Start the access check immediately, but do not make article-specific state
 * wait for the subscription query. Once Sanity gives us the article ID, all
 * three personalized reads can share auth and proceed in parallel.
 */
export function startArticlePageData(slug: string) {
  const articlePromise = traceServerStep("article.page.cms", () =>
    getArticleWithContext(slug)
  );
  const subscriptionPromise = traceServerStep(
    "article.page.subscription",
    getSubscriptionStatus,
  );
  const dataPromise = (async () => {
    const article = await articlePromise;

    if (!article) {
      return {
        article,
        subscription: await subscriptionPromise,
        bookmarked: false,
        progressStatus: "not_started" as const,
      };
    }

    const [subscription, bookmarked, progressStatus] = await Promise.all([
      subscriptionPromise,
      traceServerStep("article.page.bookmark", () => isBookmarked(article._id)),
      traceServerStep("article.page.progress", () =>
        getArticleProgress(article._id)
      ),
    ]);

    return { article, subscription, bookmarked, progressStatus };
  })();

  return { articlePromise, dataPromise };
}

export async function getArticlePageData(slug: string) {
  return startArticlePageData(slug).dataPromise;
}
