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
      // ── サイト移行 B-9: 旧サイト(Webflow)からの 301/308 リダイレクトマップ ──
      // 出典: rebono/issues/bono-training_URL移行/11_individual_301_map_2026-08-28.tsv
      // 3列目が 410 の行(80本)は next.config で 410 を返せないため実装しない
      // （切替後は legacy フォールバックで生存→解約時に自然404）。
      // /mypage・/search（NATIVE）は新サイトに実ルートがあるため 301 不要（自己リダイレクト回避）。
      // /guide 救済5本は src/proxy.ts で 308 実装済みのため重複追加しない。
      //
      // 旧シリーズページ(/series/:slug)を新レッスンルート(/lessons/:slug)へ一括救済（42本相当）。
      {
        source: "/series/:slug",
        destination: "/lessons/:slug",
        permanent: true,
      },
      // 個別301（46本・TSV11 の3列目が実パスの行を機械生成）。
      { source: "/rdm/roadmap-uiuxdesigner", destination: "/roadmap/uiux-career-change", permanent: true },
      { source: "/plan", destination: "/subscription", permanent: true },
      { source: "/rdm/users/all", destination: "/roadmap", permanent: true },
      { source: "/communityplan", destination: "/subscription", permanent: true },
      { source: "/rdm/infomationarchitect-beginner", destination: "/roadmap/information-architecture", permanent: true },
      { source: "/membership", destination: "/subscription", permanent: true },
      { source: "/rdm/lists", destination: "/roadmap", permanent: true },
      { source: "/rdm/uidezainru-men", destination: "/roadmap/ui-design-beginner", permanent: true },
      { source: "/usecase/webdesigner-to-uiuxdesigner", destination: "/roadmap/uiux-career-change", permanent: true },
      { source: "/usecase/infoarchitect-beginner", destination: "/roadmap/information-architecture", permanent: true },
      { source: "/rdm/guide/all", destination: "/roadmap", permanent: true },
      { source: "/feedback/mentalingfeedback", destination: "/how-to/feedback", permanent: true },
      { source: "/designtag/basicuipattern", destination: "/guide", permanent: true },
      { source: "/log_in", destination: "/login", permanent: true },
      { source: "/content/career", destination: "/roadmap/uiux-career-change", permanent: true },
      { source: "/rdm/ux-beginner", destination: "/roadmap/ux-design-basic", permanent: true },
      { source: "/designtag/uicolor", destination: "/guide", permanent: true },
      { source: "/bononoshi-ifang", destination: "/how-to", permanent: true },
      { source: "/bono-guide", destination: "/how-to", permanent: true },
      { source: "/usecase/uidesign-junior-designer", destination: "/roadmap/uiux-career-change", permanent: true },
      { source: "/rdm/users/success-story", destination: "/roadmap", permanent: true },
      { source: "/designtag/designguideline", destination: "/guide", permanent: true },
      { source: "/designtag/architecture", destination: "/guide", permanent: true },
      { source: "/howtouse", destination: "/how-to", permanent: true },
      { source: "/corse/uistarter", destination: "/lessons", permanent: true },
      { source: "/corse/uivisualstarter", destination: "/lessons", permanent: true },
      { source: "/corse/infomationarchitecturebignner", destination: "/lessons", permanent: true },
      { source: "/rdm/uivisual-course", destination: "/roadmap/ui-visual", permanent: true },
      { source: "/question", destination: "/questions", permanent: true },
      { source: "/subscribe/sign-up-communityplan", destination: "/subscription", permanent: true },
      { source: "/subscribe/sign-up-standard", destination: "/subscription", permanent: true },
      { source: "/te-ding-shang-pin-qu-yin-fa-specified-commercial-transactions-act", destination: "/tokushoho", permanent: true },
      { source: "/puraibasiporisi", destination: "/privacy", permanent: true },
      { source: "/subscribe/signup-feedback-onetime", destination: "/subscription", permanent: true },
      { source: "/subscribe/sign-up-growth", destination: "/subscription", permanent: true },
      { source: "/subscribe/mentoring-begin", destination: "/subscription", permanent: true },
      { source: "/cancelmembersresumption/resumption-standard-permonth", destination: "/subscription", permanent: true },
      { source: "/termsofuse", destination: "/terms", permanent: true },
      { source: "/subscribe/sign-up-under100", destination: "/subscription", permanent: true },
      { source: "/subscribe/sign-up-standard-threemonth", destination: "/subscription", permanent: true },
      { source: "/subscribe/sign-up-growth-threemonths", destination: "/subscription", permanent: true },
      { source: "/subscribe/mentoring", destination: "/subscription", permanent: true },
      { source: "/cancelmembersresumption/resumption-standard-perthreemonth", destination: "/subscription", permanent: true },
      { source: "/cancelmembersresumption/resumption-growth-perthreemonth", destination: "/subscription", permanent: true },
      { source: "/cancelmembersresumption/resumption-growth-permonth", destination: "/subscription", permanent: true },
      { source: "/blog/sharebeginnerforuidesignfromzero", destination: "/blog", permanent: true },
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
