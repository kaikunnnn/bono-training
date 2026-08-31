/**
 * よくある質問（FAQ）ページ。
 * - 公開ページ（devゲート外・noindexは付けない＝SEO資産化）
 * - Notion由来の実コンテンツを faq-data.tsx に構造化して保持
 * - 表示は FaqAccordion（"use client"）に委譲し、当ページは Server Component
 * - FAQPage JSON-LD（構造化データ）を出力し、検索エンジンにQ&Aを伝える
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { FAQ_CATEGORIES } from "./faq-data";

// お問い合わせ（Googleフォーム）
const CONTACT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfUE-AYkZsepc8NfDGO5FtPnHJI77-iMIMnx6KxSfgWVaUgOA/viewform?usp=header";

export const metadata: Metadata = {
  // 親レイアウトの title.template（"%s | BONO"）が自動で " | BONO" を付けるため、
  // ここでは接尾辞なしのベース文字列にする（タブ表示は「よくある質問 | BONO」になる）。
  // og/twitter はテンプレートが効かないので明示的に付ける（feedbackページと同じパターン）。
  title: "よくある質問",
  description:
    "BONOのよくある質問（FAQ）。料金・支払い・プラン変更・加入後の使い方・退会など、加入前後の疑問をまとめました。",
  openGraph: {
    title: "よくある質問 | BONO",
    description:
      "BONOのよくある質問（FAQ）。料金・支払い・プラン変更・加入後の使い方・退会など、加入前後の疑問をまとめました。",
  },
  twitter: {
    title: "よくある質問 | BONO",
    description:
      "BONOのよくある質問（FAQ）。料金・支払い・プラン変更・加入後の使い方・退会など、加入前後の疑問をまとめました。",
  },
  alternates: { canonical: "/how-to/faq" },
};

// FAQPage 構造化データ（回答は各Qのプレーンテキスト版を使う）
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_CATEGORIES.flatMap((category) =>
    category.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.plain,
      },
    }))
  ),
};

export default function FaqPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        {/* 「BONOの使い方」インデックスへ戻る導線（タイトル上・行き先明示） */}
        <Link
          href="/how-to"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-text-link"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          BONOの使い方
        </Link>

        {/* ページ主見出し + 導入 */}
        <header className="mb-10">
          <h1 className="font-rounded-mplus text-3xl font-bold leading-tight text-foreground">
            よくある質問
          </h1>
          <p className="mt-3 text-muted-foreground">
            料金・支払い・プラン変更から加入後の使い方・退会まで、よくいただく質問をまとめました。気になる項目を開いてご確認ください。
          </p>
        </header>

        <FaqAccordion categories={FAQ_CATEGORIES} />

        {/* 末尾CTA: 解決しない疑問はお問い合わせへ */}
        <section className="mt-16 border-t border-border pt-8">
          <h2 className="font-rounded-mplus text-lg font-bold text-foreground">
            解決しない疑問はお問い合わせへ
          </h2>
          <p className="mt-2 text-muted-foreground">
            ここに載っていない疑問や、加入前のご相談はお気軽にお問い合わせください。
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link
              href={CONTACT_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              お問い合わせする
            </Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
