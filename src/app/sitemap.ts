import type { MetadataRoute } from "next";
import {
  getAllLessonSlugs,
  getAllArticles,
  getAllFeedbackSlugs,
  getAllBlogSlugs,
  getAllRoadmapSlugs,
} from "@/lib/sanity";
import { getAllGuideSlugs } from "@/lib/guideLoader";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://app.bo-no.design";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/lessons`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/roadmap`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/guide`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/feedbacks`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/subscription`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Sanity CMS から動的ページのスラッグを並行取得
  const [lessonSlugs, articles, feedbackSlugs, blogSlugs, roadmapSlugs] =
    await Promise.all([
      getAllLessonSlugs().catch(() => [] as string[]),
      getAllArticles().catch(() => []),
      getAllFeedbackSlugs().catch(() => [] as string[]),
      getAllBlogSlugs().catch(() => [] as string[]),
      getAllRoadmapSlugs().catch(() => [] as string[]),
    ]);

  // ローカルファイルのガイドスラッグ
  const guideSlugs = getAllGuideSlugs();

  const lessonPages: MetadataRoute.Sitemap = lessonSlugs.map((slug) => ({
    url: `${BASE_URL}/lessons/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/articles/${article.slug.current}`,
    lastModified: article.publishedAt
      ? new Date(article.publishedAt)
      : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const feedbackPages: MetadataRoute.Sitemap = feedbackSlugs.map((slug) => ({
    url: `${BASE_URL}/feedbacks/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const roadmapPages: MetadataRoute.Sitemap = roadmapSlugs.map((slug) => ({
    url: `${BASE_URL}/roadmap/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const guidePages: MetadataRoute.Sitemap = guideSlugs.map((slug) => ({
    url: `${BASE_URL}/guide/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...lessonPages,
    ...articlePages,
    ...feedbackPages,
    ...blogPages,
    ...roadmapPages,
    ...guidePages,
  ];
}
