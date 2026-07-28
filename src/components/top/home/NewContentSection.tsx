import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * トップ 新着コンテンツ一覧（新トップ 2026）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 564-22162
 *
 * - レッスン / ガイド / 記事 / イベント など種類を問わず、
 *   サムネイル + 種類 + タイトル の統一カードで並べる
 * - デスクトップ: 4カラム / モバイル: 横スクロール
 */

export interface NewContentItem {
  /** オブジェクトの種類ラベル（例: レッスン / ガイド / 記事 / イベント） */
  type: string;
  /** タイトル */
  title: string;
  /** サムネイル画像 */
  thumbnail: string;
  /** 遷移先 */
  href: string;
}

export interface NewContentSectionProps {
  /** セクション見出し */
  heading?: string;
  /** 表示アイテム */
  items: NewContentItem[];
  className?: string;
}

/** 新着カード（サムネ + 種類 + タイトル） */
function NewContentCard({ type, title, thumbnail, href }: NewContentItem) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-black/[0.06] bg-surface transition-shadow sm:rounded-[36px] hover:shadow-[0px_4px_18px_0px_rgba(0,0,0,0.10)]"
    >
      {/* サムネイル */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted-custom">
        <Image
          src={thumbnail}
          alt=""
          fill
          sizes="(max-width: 768px) 80vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      {/* テキスト */}
      <div className="flex flex-col gap-2 px-6 py-5 sm:px-8 sm:py-6">
        <p className="text-[13px] font-bold uppercase leading-none text-text-primary/60">{type}</p>
        <p className="line-clamp-1 text-base font-bold leading-[1.6] text-text-primary">{title}</p>
      </div>
    </Link>
  );
}

export default function NewContentSection({
  heading = "新着",
  items,
  className,
}: NewContentSectionProps) {
  if (!items?.length) return null;

  return (
    <section className={cn("flex flex-col gap-6", className)}>
      <h2 className="text-xl leading-[1.88] text-text-primary">{heading}</h2>

      {/*
        デスクトップ: 4カラムグリッド
        モバイル: 横スクロール（スナップ）
      */}
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 scrollbar-hide snap-x snap-mandatory">
        {items.map((item, i) => (
          <div
            key={i}
            className="w-[80%] max-w-[280px] shrink-0 snap-start sm:w-auto sm:max-w-none"
          >
            <NewContentCard {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}
