import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["iconsax-react"],
  experimental: {
    optimizePackageImports: ["iconsax-react", "lucide-react"],
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        // /docs/xxx → public/docs/xxx.html（拡張子なしURLで静的ドキュメントを配信）
        // 配列形式の rewrites は Next.js 仕様上 afterFiles 相当の挙動なので、
        // オブジェクト形式へ移行しても動作を変えないためここに置く。
        {
          source: "/docs/:slug",
          destination: "/docs/:slug.html",
        },
      ],
      // サイト移行: Next.js 側のページ・静的ファイル・動的ルートの
      // いずれにもマッチしなかった場合のみ発動するフォールバック。
      // 本番ドメイン（bo-no.design / www.bo-no.design）でのアクセス時のみ、
      // まだ移植されていないパスを Webflow の裏サブドメイン legacy.bo-no.design へ転送する。
      //
      // has の host 条件は必須。これを外すと開発中の bono-training.vercel.app 等でも
      // 発動し、存在しない legacy.bo-no.design への接続エラーを招く。
      fallback: [
        {
          source: "/:path*",
          destination: "https://legacy.bo-no.design/:path*",
          has: [
            {
              type: "host",
              value: "(www\\.)?bo-no\\.design",
            },
          ],
        },
      ],
    };
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
    formats: ["image/avif", "image/webp"],
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
      {
        protocol: "https",
        hostname: "bo-no.design",
      },
      {
        protocol: "https",
        hostname: "*.bo-no.design",
      },
      {
        protocol: "https",
        hostname: "*.st-note.com",
      },
    ],
  },
};

export default nextConfig;
