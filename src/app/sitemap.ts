import type { MetadataRoute } from "next";
import {
  getAllLessonSlugs,
  getAllArticles,
  getAllFeedbackSlugs,
  getAllBlogSlugs,
  getAllRoadmapSlugs,
  getAllGuidesFromSanity,
  getQuestionsForSitemap,
  getAllEvents,
  getStoriesList,
  getTrainingListFromSanity,
} from "@/lib/sanity";
import { GUIDE_CONTENT_DUPLICATE_SLUGS } from "@/lib/seo/guideContentDuplicates";
import { LEGACY_PUBLIC_ARTICLE_SLUGS } from "@/lib/seo/legacyPublicArticles";
import { LEGACY_ONLY_CONTENT_SLUGS } from "@/lib/migration/legacy-only-content-slugs";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://app.bo-no.design";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/lessons`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/roadmap`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/guide`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/events`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/feedbacks`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/subscription`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // #236: 公開・index 対象なのに漏れていたページ（本番で 200・noindex なし・canonical 自分自身を確認）。
    // /search（検索結果）と /dev・/notes・/community/feedback（proxy で本番 404）、
    // noindex の /top・/studio・/component・/docs は入れない。
    ...(
      [
        ["/how-to", "monthly", 0.6],
        ["/how-to/faq", "monthly", 0.6],
        ["/how-to/community", "monthly", 0.5],
        ["/how-to/feedback", "monthly", 0.6],
        ["/stories", "weekly", 0.6],
        ["/questions", "daily", 0.6],
        ["/training", "weekly", 0.7],
        ["/articles", "weekly", 0.6],
        ["/updates", "weekly", 0.5],
        ["/achievements", "weekly", 0.5],
        ["/outputs", "weekly", 0.4],
        ["/feedback-apply", "monthly", 0.5],
        ["/terms", "yearly", 0.2],
        ["/privacy", "yearly", 0.2],
        ["/tokushoho", "yearly", 0.2],
      ] as const
    ).map(([path, changeFrequency, priority]) => ({
      url: `${BASE_URL}${path}`,
      changeFrequency,
      priority,
    })),
  ];

  // Sanity CMS から動的ページのスラッグを並行取得
  const [
    lessonSlugs,
    articles,
    feedbackSlugs,
    blogSlugs,
    roadmapSlugs,
    guides,
    questions,
    events,
    stories,
    trainings,
  ] =
    await Promise.all([
      getAllLessonSlugs().catch(() => [] as string[]),
      getAllArticles().catch(() => []),
      getAllFeedbackSlugs().catch(() => [] as string[]),
      getAllBlogSlugs().catch(() => [] as string[]),
      getAllRoadmapSlugs().catch(() => [] as string[]),
      getAllGuidesFromSanity().catch(() => []),
      getQuestionsForSitemap().catch(() => []),
      getAllEvents().catch(() => []),
      getStoriesList().catch(() => []),
      // getTrainings() は Supabase(cookies) のフォールバックを含むため使わず、Sanity を直接読む
      getTrainingListFromSanity().catch(() => []),
    ]);

  const lessonPages: MetadataRoute.Sitemap = lessonSlugs.map((slug) => ({
    url: `${BASE_URL}/lessons/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = articles
    .filter(
      (article) =>
        !article.isPremium &&
        !GUIDE_CONTENT_DUPLICATE_SLUGS.has(article.slug.current),
    )
    .map((article) => ({
      url: `${BASE_URL}/contents/${article.slug.current}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  // Webflow経由で同じ公開URLに配信される記事も、正規URLとして伝える。
  // Sanityに移植されたslugは重複させず、有料化されても再掲載しない。
  const sanityArticleSlugs = new Set(
    articles.map((article) => article.slug.current),
  );
  const legacyArticlePages: MetadataRoute.Sitemap = [
    ...LEGACY_PUBLIC_ARTICLE_SLUGS,
  ]
    .filter(
      (slug) =>
        LEGACY_ONLY_CONTENT_SLUGS.has(slug) &&
        !sanityArticleSlugs.has(slug),
    )
    .map((slug) => ({
      url: `${BASE_URL}/contents/${slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const feedbackPages: MetadataRoute.Sitemap = feedbackSlugs.map((slug) => ({
    url: `${BASE_URL}/feedbacks/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const roadmapPages: MetadataRoute.Sitemap = roadmapSlugs.map((slug) => ({
    url: `${BASE_URL}/roadmap/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const guidePages: MetadataRoute.Sitemap = guides
    .filter((guide) => !guide.isPremium)
    .map((guide) => ({
      url: `${BASE_URL}/guide/${guide.slug}`,
      lastModified:
        guide.sanityUpdatedAt ?? guide.updatedAt ?? guide.publishedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const questionPages: MetadataRoute.Sitemap = questions.map((question) => ({
    url: `${BASE_URL}/questions/${question.slug}`,
    ...(question.publishedAt
      ? { lastModified: new Date(question.publishedAt) }
      : {}),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  // イベント詳細は公開ページ（申込UI・参加者一覧は会員向けだが本文は誰でも読める）
  const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${BASE_URL}/events/${event.slug.current}`,
    ...(event._updatedAt ? { lastModified: event._updatedAt } : {}),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const storyPages: MetadataRoute.Sitemap = stories
    .filter((story) => story.slug?.current)
    .map((story) => ({
      url: `${BASE_URL}/stories/${story.slug.current}`,
      ...(story.publishedAt ? { lastModified: story.publishedAt } : {}),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const trainingPages: MetadataRoute.Sitemap = trainings
    .map((training) => (training.slug || "").trim())
    .filter((slug) => slug.length > 0)
    .map((slug) => ({
      url: `${BASE_URL}/training/${slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [
    ...staticPages,
    ...lessonPages,
    ...articlePages,
    ...legacyArticlePages,
    ...feedbackPages,
    ...blogPages,
    ...roadmapPages,
    ...guidePages,
    ...questionPages,
    ...eventPages,
    ...storyPages,
    ...trainingPages,
  ];
}
