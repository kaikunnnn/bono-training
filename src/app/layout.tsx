import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  Geist,
  Geist_Mono,
  Noto_Sans_JP,
  M_PLUS_Rounded_1c,
  Inter,
  Hind,
  Luckiest_Guy,
} from "next/font/google";
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

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp-var",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const mplusRounded = M_PLUS_Rounded_1c({
  variable: "--font-mplus-rounded-var",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter-var",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const hind = Hind({
  variable: "--font-hind-var",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const luckiestGuy = Luckiest_Guy({
  variable: "--font-luckiest-var",
  subsets: ["latin"],
  weight: "400",
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
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJp.variable} ${mplusRounded.variable} ${inter.variable} ${hind.variable} ${luckiestGuy.variable} ${lineSeedJP.variable} antialiased`}
      >
        <GoogleAnalytics />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
