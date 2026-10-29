/**
 * #267 サイト構造案の雑プロト — 入口
 *
 * 267-D レポートの結論を、今のサイトの部品で触れる形にした試作3つへのリンク。
 * 磨いたデザインではなく「考え方が伝わるか」を確かめるためのもの。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { REPORT_NAME } from "./_parts/shared";

export const metadata: Metadata = {
  title: "サイト構造案の試作（#267）",
  robots: { index: false, follow: false },
};

const PROTOS = [
  {
    href: "/dev/site-structure/article",
    label: "試作1 記事ページの改善案",
    what: "検索で着地する本物の会員限定記事に、現在地・ステップへの戻り道・コース1つ・中身のあるロックを足した Before / After。",
    idea: "レポート 2-4「記事に戻り道がない」／ 5-3 段階1「つなぎ直す」",
  },
  {
    href: "/dev/site-structure/trouble-hub",
    label: "試作2 悩みのハブ「UIの作り方で困った」",
    what: "困りごと12項目を、学ぶ人の言葉で並べたハブ。絞り込みから項目へ直接飛び、記事・コース・ロードマップへつなぐ。",
    idea: "レポート 3-2「ロードマップだけでは入口が足りない」／ 5-3 段階3",
  },
  {
    href: "/dev/site-structure/nav",
    label: "試作3 ナビの出し分け",
    what: "未ログインと有料会員を左右に並べ、サイドバー・ホームの上の方・ロードマップのステップの違いを見比べる。",
    idea: "レポート 4章「消さずに足す」／ 5-3 段階4",
  },
];

export default function SiteStructureIndexPage() {
  return (
    <div className="mx-auto w-full max-w-[880px] px-4 pb-24 pt-10 font-noto-sans-jp sm:px-6">
      <p className="text-xs font-bold text-text-muted">#267 確認用の試作</p>
      <h1 className="mt-2 font-heading text-[28px] font-bold leading-[1.4] text-text-primary md:text-[32px]">
        サイト構造案の試作
      </h1>
      <p className="mt-3 text-sm leading-[1.8] text-text-secondary">
        {REPORT_NAME}の結論を、今のサイトの部品を使って雑に形にしたものです。
        見た目は磨いていません。「記事から全体へ戻れるか」「困りごとから入れるか」「会員の続きが見えるか」を触って確かめるためのものです。
        推測で書いた文言には「仮」を付けています。
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {PROTOS.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="group block rounded-[20px] border border-border-light bg-surface p-5 transition-colors hover:bg-hover"
            >
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-text-primary">
                {p.label}
                <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </h2>
              <p className="mt-1 text-sm leading-[1.8] text-text-secondary">{p.what}</p>
              <p className="mt-2 text-xs text-text-muted">元のアイデア: {p.idea}</p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-xs leading-[1.8] text-text-muted">
        レポート本文は rebono/issues の「267-D_レポート_サイト構造とコース・ロードマップの改善.md」。
        ロードマップ（v6）とコースのリンク先は、このブランチの /dev 試作です。
      </p>
    </div>
  );
}
