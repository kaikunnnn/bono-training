import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://app.bo-no.design";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/mypage",
          "/account",
          "/profile",
          "/settings",
          "/api/",
          "/auth/",
          // サイト内検索の結果は検索語×ページ番号で無限に作れるため巡回させない（rebono#249）
          "/search",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
