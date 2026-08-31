import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  Geist_Mono,
  Noto_Sans_JP,
  M_PLUS_1,
} from "next/font/google";
import Script from "next/script";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { GoogleAnalytics } from "@/components/common/GoogleAnalytics";
import "./globals.css";
import "@/styles/blog.css";
import "@/styles/blog/link-card.css";

const GA_MEASUREMENT_ID = "G-MH9NGKFBCM";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp-var",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// 見出し専用。主力は 700 / 500。加えて 600(SemiBold) を料金ページの見出し用に読み込む。
// 800等はごく少数のため近傍(700)にフォールバックさせ、和文フォントの重量を削減。
const mplus1 = M_PLUS_1({
  variable: "--font-mplus-1-var",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const lineSeedJP = localFont({
  src: [
    { path: "../../.claude/design-system/fonts/LINESeedJP_OTF_Th.otf", weight: "300", style: "normal" },
    { path: "../../.claude/design-system/fonts/LINESeedJP_OTF_Rg.otf", weight: "400", style: "normal" },
    { path: "../../.claude/design-system/fonts/LINESeedJP_OTF_Bd.otf", weight: "700", style: "normal" },
    { path: "../../.claude/design-system/fonts/LINESeedJP_OTF_Eb.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-line-seed-jp",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body
        className={`${geistMono.variable} ${notoSansJp.variable} ${mplus1.variable} ${lineSeedJP.variable} antialiased`}
      >
        <GoogleAnalytics />
        <QueryProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
