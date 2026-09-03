import type { MetadataRoute } from "next";

/**
 * PWA manifest（Next.js metadata route）。
 *
 * Web Push の前提として必須。特に iOS/iPadOS Safari は「ホーム画面に追加」して
 * standalone PWA として起動したときのみ push 購読が可能なため、display:"standalone"
 * とアイコンを備えた manifest が要る（出典: Apple Developer "Sending web push
 * notifications in web apps and browsers"）。
 *
 * apple-touch-icon は src/app/apple-icon.png を Next.js が自動でリンクする。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BONO - UIUXデザインを学ぶ",
    short_name: "BONO",
    description:
      "UIUXデザインを体系的に学べるオンライン学習プラットフォーム。",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
