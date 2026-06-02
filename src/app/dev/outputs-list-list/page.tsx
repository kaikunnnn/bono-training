/**
 * /dev/outputs-list-list — アウトプット一覧（リスト型バリアント）
 *
 * /dev/outputs-list と同じレイアウトベース、カードをリスト型（横長）に差し替え。
 * リサーチ推し: Zapier / Intercom / Substack list view の流し読み体験。
 */

import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import { dummyOutputs } from "@/app/achievements/dummy-data";
import OutputListItem from "@/components/output/OutputListItem";

export const metadata: Metadata = {
  title: "アウトプット一覧 リスト型 (/dev/outputs-list-list)",
  robots: { index: false, follow: false },
};

const contentFilters = [
  "すべて",
  "UIUX転職ロードマップ",
  "情報設計ロードマップ",
  "UXデザイン基礎",
  "Figma基礎レッスン",
  "ポートフォリオ強化トピック",
];

export default function DevOutputsListListPage() {
  return (
    <div className="min-h-screen">
      {/* dev portal 戻りリンク */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4">
        <Link
          href="/dev/bon-327"
          className="text-xs text-text-primary/50 hover:underline font-noto-sans-jp"
        >
          ← /dev/bon-327 (BON-327 受講者まわり) に戻る
        </Link>
      </div>

      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        <PageHeader
          label="OUTPUTS"
          title="アウトプット一覧"
          description="BONOのコンテンツを使った受講者が、実際に書いた記事を集めた場所。"
        />

        <div className="mb-6">
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1 text-sm text-text-primary/60 hover:underline font-noto-sans-jp"
          >
            ← みんなの成果 に戻る
          </Link>
        </div>

        {/* 使ったコンテンツフィルタ */}
        <div className="mb-8 flex flex-wrap gap-2">
          {contentFilters.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`text-sm px-4 py-2 rounded-full font-noto-sans-jp transition-colors ${
                i === 0
                  ? "bg-text-primary text-white font-bold"
                  : "bg-muted-custom text-text-primary/70 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* リスト型・1列縦並び */}
        <div className="flex flex-col gap-3 max-w-3xl">
          {dummyOutputs.map((o) => (
            <OutputListItem
              key={o.id}
              title={o.title}
              thumbnailUrl={o.thumbnailUrl}
              authorName={o.authorName}
              usedContent={o.usedContent}
              publishedAt={o.publishedAt}
              externalUrl={o.externalUrl}
            />
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-text-primary/50 font-noto-sans-jp">
          ※ 件数増えたらページネーション or 無限スクロールを実装
        </div>

        {/* 回遊CTA: /stories へ */}
        <div className="mt-16 pt-12 border-t border-gray-200/60">
          <Link
            href="/stories"
            className="group block bg-surface rounded-[24px] border border-gray-200/60 shadow-sm p-6 sm:p-8 hover:shadow-md hover:border-gray-300 transition-all max-w-2xl mx-auto"
          >
            <p className="text-xs font-bold text-text-primary/50 font-noto-sans-jp">
              受講者ストーリー
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-text-primary font-rounded-mplus mt-1">
              人生を動かした受講者のインタビューも読んでみる →
            </h3>
            <p className="text-sm text-text-primary/70 font-noto-sans-jp mt-2">
              転職・独立など、BONOで動き出した人たちのストーリー集。
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
