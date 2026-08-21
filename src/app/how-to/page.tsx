/**
 * 「BONOの使い方」インデックス（/how-to）。
 * - how-to 配下のガイド（よくある質問 / フィードバックのやり方）への入口を、
 *   白背景のタップしやすいカードで一覧する。
 * - 公開ページ（Server Component）。カードは配列駆動で、ガイド追加時はここに足すだけ。
 * - 見出し階層: h1（BONOの使い方）→ h2（各ガイドのカードタイトル）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "BONOの使い方",
  description:
    "BONOをより活用するためのガイド集。よくある質問（料金・支払い・退会など）とフィードバック機能の使い方をまとめています。",
  openGraph: {
    title: "BONOの使い方 | BONO",
    description:
      "BONOをより活用するためのガイド集。よくある質問とフィードバック機能の使い方をまとめています。",
  },
  twitter: {
    title: "BONOの使い方 | BONO",
    description:
      "BONOをより活用するためのガイド集。よくある質問とフィードバック機能の使い方をまとめています。",
  },
  alternates: { canonical: "/how-to" },
};

type Guide = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const GUIDES: Guide[] = [
  {
    href: "/how-to/faq",
    title: "よくある質問",
    description:
      "料金・支払い・プラン変更・退会など、加入前後によくいただく疑問をまとめました。",
    icon: HelpCircle,
  },
  {
    href: "/how-to/feedback",
    title: "フィードバックのやり方",
    description:
      "フィードバック機能の使い方・前提・フォームの選び方を解説します。",
    icon: ClipboardCheck,
  },
];

export default function HowToIndexPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* ページ主見出し + 導入 */}
        <header className="mb-10">
          <h1 className="font-rounded-mplus text-3xl font-bold leading-tight text-foreground">
            BONOの使い方
          </h1>
          <p className="mt-3 text-muted-foreground">
            BONOをより活用するためのガイド集です。知りたいトピックを選んでください。
          </p>
        </header>

        {/* ガイド一覧（白背景のタップカード） */}
        <div className="space-y-3">
          {GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.href}
                href={guide.href}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-white p-6 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_3px_0px_rgba(0,0,0,0.04)] transition-shadow hover:border-border-strong hover:shadow-md"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <h2 className="font-rounded-mplus text-lg font-bold text-foreground">
                    {guide.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {guide.description}
                  </p>
                </div>
                <ArrowRight
                  className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
