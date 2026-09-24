import type { MetadataRoute } from "next";
import {
  getAllLessonSlugs,
  getAllArticles,
  getAllFeedbackSlugs,
  getAllBlogSlugs,
  getAllRoadmapSlugs,
  getAllGuidesFromSanity,
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
      url: `${BASE_URL}/feedbacks`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/subscription`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Sanity CMS から動的ページのスラッグを並行取得
  const [lessonSlugs, articles, feedbackSlugs, blogSlugs, roadmapSlugs, guides] =
    await Promise.all([
      getAllLessonSlugs().catch(() => [] as string[]),
      getAllArticles().catch(() => []),
      getAllFeedbackSlugs().catch(() => [] as string[]),
      getAllBlogSlugs().catch(() => [] as string[]),
      getAllRoadmapSlugs().catch(() => [] as string[]),
      getAllGuidesFromSanity().catch(() => []),
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

  return [
    ...staticPages,
    ...lessonPages,
    ...articlePages,
    ...legacyArticlePages,
    ...feedbackPages,
    ...blogPages,
    ...roadmapPages,
    ...guidePages,
  ];
}
