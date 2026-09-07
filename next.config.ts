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
      // フィードバックのやり方ガイドを使い方系(/how-to)配下へ移動。旧URLを308で恒久保護。
      {
        source: "/feedback-apply/guide",
        destination: "/how-to/feedback",
        permanent: true,
      },
      // フィードバック一覧・詳細を /community/feedback 配下へ移設。旧URLを308で恒久保護。
      {
        source: "/feedbacks",
        destination: "/community/feedback",
        permanent: true,
      },
      {
        source: "/feedbacks/:slug",
        destination: "/community/feedback/:slug",
        permanent: true,
      },
    ];
  },
  // セキュリティヘッダ（段階導入 第1歩）: CSP以外の安全な4ヘッダを全パスに enforce で付与。
  // CSP（Content-Security-Policy）はここでは付けない。Sanity画像/Stripe/Supabase/
  // YouTube等の外部リソース依存が多く誤爆リスクが高いため、別ステップで
  // Content-Security-Policy-Report-Only から段階導入する予定。
  // HSTS（Strict-Transport-Security）もここでは付けない（Vercelが付与済み・preload事故回避）。
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // MIMEスニッフィングを禁止（Content-Type を尊重させる）
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // リファラは同一オリジンには full URL、クロスオリジンにはオリジンのみ送る
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // クリックジャッキング対策。DENYではなくSAMEORIGIN＝将来の自サイト内
          // iframe埋め込みの余地を残す安全側の選択。
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // 未使用の強権限を明示的に無効化（最小限に留める。付けすぎると壊れる）
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
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
