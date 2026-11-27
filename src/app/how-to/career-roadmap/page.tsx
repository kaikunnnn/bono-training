/**
 * UIUXデザイナーを目指すなら、何を目標に、何から始めればいい？（/how-to/career-roadmap）。
 * - UIUXデザイナー転職を目指す人に、ロードマップと記事を読む順番だけを示すリンク集。
 * - 相談（30分相談など）の前に読んでもらい、目指す姿と今からやることを自分で考えてもらうために使う。
 * - 公開ページ（Server Component）。ステップは配列駆動で、記事の差し替えはここを直すだけ。
 * - 見出し階層: h1（ページ名）→ h2（各ステップ）→ h3（各リンクのタイトル）。
 */

import type { Metadata } from "next";
import { OG_DEFAULTS } from "@/lib/seo-metadata";
import { IntentPrefetchLink } from "@/components/common/IntentPrefetchLink";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const TITLE = "UIUXデザイナーを目指すなら、何を目標に、何から始めればいい？";
const DESCRIPTION =
  "UIUXデザイナーを目指すとき、何を目標にして何から始めればいいか。BONOのロードマップと記事を読む順番でまとめました。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    ...OG_DEFAULTS,
    title: `${TITLE} | BONO`,
    description: DESCRIPTION,
  },
  twitter: {
    title: `${TITLE} | BONO`,
    description: DESCRIPTION,
  },
  alternates: { canonical: "/how-to/career-roadmap" },
};

type ReadingLink = {
  href: string;
  title: string;
  description: string;
};

// リンク先の種類はURLの先頭で決める（/roadmap・/guide・/contents）
function pageTypeLabel(href: string): string {
  if (href.startsWith("/roadmap/")) return "ロードマップ";
  if (href.startsWith("/guide/")) return "ガイド";
  return "記事";
}

type Step = {
  heading: string;
  links: ReadingLink[];
};

const STEPS: Step[] = [
  {
    heading: "全体の道のりをつかむ",
    links: [
      {
        href: "/roadmap/uiux-career-change",
        title: "UIUXデザイナー転職ロードマップ",
        description:
          "UIデザインの基礎から情報設計、UXデザインまで。未経験から約1年で転職に必要なスキルを学ぶ道筋です。",
      },
      {
        href: "/guide/rdm-howtostart-roadmap",
        title: "未経験からUI/UXデザイナーへ転職するロードマップ",
        description: "ロードマップの考え方と、スキルを身につける流れを文章で解説しています。",
      },
    ],
  },
  {
    heading: "目指す姿を知る",
    links: [
      {
        href: "/guide/rdm-howtobeadesigner",
        title: "未経験からUI/UXデザイナーになるには？",
        description: "必要なスキル3つと、書類で落ちないための条件をまとめています。",
      },
      {
        href: "/contents/rdm-goaloverview",
        title: "UIUXデザイン学習ゴール",
        description: "転職できる状態のスキルとポートフォリオを、具体的なイメージで紹介しています。",
      },
    ],
  },
  {
    heading: "最初の一歩を決める",
    links: [
      {
        href: "/roadmap/ui-design-beginner",
        title: "Figmaからデザインをはじめるロードマップ",
        description: "UIトレースを通してFigmaの基本操作を身につけ、UIデザインをはじめます。",
      },
      {
        href: "/roadmap/ui-visual",
        title: "UIデザイン見た目のきほん 習得ロードマップ",
        description: "使いやすいUIをつくるための、見た目の表現の基礎を身につけます。",
      },
    ],
  },
  {
    heading: "転職した人の話を読む",
    links: [
      {
        href: "/guide/beginner-to-uiux-designer-examples",
        title: "未経験からUI/UXデザイナーに転職した4つの事例",
        description: "前職も学び方もちがう4人が、どう進めて転職したかを紹介しています。",
      },
    ],
  },
];

export default function CareerRoadmapGuidePage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* 「BONOの使い方」インデックスへ戻る導線（/how-to/faq と同じ形） */}
        <Link
          href="/how-to"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-text-link"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          BONOの使い方
        </Link>

        <header className="mb-10">
          <h1 className="font-rounded-mplus text-3xl font-bold leading-tight text-foreground">
            {TITLE}
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            上から順に読んで、目指す姿と今からやることを自分で考えてみましょう。相談は、その答え合わせに使うのがおすすめです。
          </p>
        </header>

        <ol className="space-y-10">
          {STEPS.map((step, index) => (
            <li key={step.heading}>
              <h2 className="mb-4 flex items-center gap-3 font-rounded-mplus text-xl font-bold text-foreground">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-base">
                  {index + 1}
                </span>
                {step.heading}
              </h2>
              <div className="space-y-3">
                {step.links.map((link) => (
                  <IntentPrefetchLink
                    key={link.href}
                    href={link.href}
                    className="group flex items-start gap-4 rounded-2xl border border-border bg-white p-6 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_3px_0px_rgba(0,0,0,0.04)] transition-shadow hover:border-border-strong hover:shadow-md"
                  >
                    <div className="flex-1">
                      <span className="mb-2 inline-block rounded-full border border-border-strong bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground">
                        {pageTypeLabel(link.href)}
                      </span>
                      <h3 className="font-rounded-mplus text-lg font-bold text-foreground">
                        {link.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                    <ArrowRight
                      className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </IntentPrefetchLink>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
