import type { Metadata, Viewport } from "next";
import {
  Geist_Mono,
  M_PLUS_1,
} from "next/font/google";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { GoogleAnalytics } from "@/components/common/GoogleAnalytics";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import "./globals.css";
import "@/styles/blog.css";
import "@/styles/blog/link-card.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  // Code font: keep it available where used, but do not fetch it on every page.
  // The member top does not use it (23 KB of otherwise unnecessary preload).
  preload: false,
});

// 見出し専用。主力は 700 / 500。加えて 600(SemiBold) を料金ページの見出し用に読み込む。
// 800等はごく少数のため近傍(700)にフォールバックさせ、和文フォントの重量を削減。
const mplus1 = M_PLUS_1({
  variable: "--font-mplus-1-var",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://app.bo-no.design"
  ),
  title: {
    default: "BONO - UIUXデザインを学ぶ",
    template: "%s | BONO",
  },
  description:
    "UIUXデザインを体系的に学べるオンライン学習プラットフォーム。レッスン、記事、ロードマップで効率的にスキルアップ。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "BONO",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://app.bo-no.design",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// モバイルブラウザUIバーの色（ブランド primary #102720）。
// CSS変数を参照できない設定エクスポートのため raw hex を許容。
export const viewport: Viewport = {
  themeColor: "#102720",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistMono.variable} ${mplus1.variable} antialiased`}
      >
        <GoogleAnalytics />
        <ServiceWorkerRegistrar />
        <QueryProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
