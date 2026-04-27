import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { GoogleAnalytics } from "@/components/common/GoogleAnalytics";
import "./globals.css";
import "@/styles/blog.css";
import "@/styles/blog/link-card.css";

const GA_MEASUREMENT_ID = "G-MH9NGKFBCM";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
