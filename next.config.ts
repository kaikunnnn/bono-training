import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["iconsax-react"],
  async rewrites() {
    return [
      // /docs/xxx → public/docs/xxx.html（拡張子なしURLで静的ドキュメントを配信）
      {
        source: "/docs/:slug",
        destination: "/docs/:slug.html",
      },
    ];
  },
  async redirects() {
    return [
      // サイト移行 Week1: 個別記事ルートを /articles/:slug → /contents/:slug に統一。
      // ベータドメイン上で既にクロール・被リンクされている旧 URL を 308 で恒久保護する。
      {
        source: "/articles/:slug",
        destination: "/contents/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "*.sanity.io",
      },
      {
        protocol: "https",
        hostname: "uploads-ssl.webflow.com",
      },
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
};

export default nextConfig;
