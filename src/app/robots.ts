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
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
