/**
 * パターンJ：各ステップの「最初の1本」カード（#295 案2）
 * 割り当ては仮なので仮札を付ける。タイトルと本数は Sanity の実データ。
 * ステップの見出しが h3 なので、カードのタイトルは h4。
 */

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Book, DocumentText } from "iconsax-react";
import { ProvisionalTag } from "../parts";
import type { FirstOneView } from "../guide-utils";

export default function FirstOneCard({
  item,
  showFreeCount,
}: {
  item: FirstOneView;
  /** 未ログインの見え方でだけ無料の本数を出す */
  showFreeCount: boolean;
}) {
  return (
    <Link
      href={item.href}
      className="group flex items-center gap-3 rounded-[14px] border border-border-light bg-muted-custom p-3 transition-colors hover:border-border-strong"
    >
      <span className="relative flex h-[60px] w-10 shrink-0 items-center justify-center overflow-hidden rounded-r-[6px] bg-white shadow-sm">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt="" fill sizes="40px" unoptimized className="object-cover" />
        ) : item.kind === "guide" ? (
          <DocumentText aria-hidden="true" size={20} color="currentColor" className="text-text-muted" />
        ) : (
          <Book aria-hidden="true" size={20} color="currentColor" className="text-text-muted" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold leading-[16px] text-text-muted">
          最初の1本
          <ProvisionalTag />
          <span className="font-normal">{item.kind === "guide" ? "解説記事" : "レッスン"}</span>
        </span>
        <h4 className="mt-0.5 line-clamp-2 text-[14px] font-bold leading-[20px] text-text-primary">{item.title}</h4>
        {showFreeCount && item.articleCount !== undefined && item.freeArticleCount !== undefined && (
          <p className="mt-0.5 text-[12px] leading-[18px] text-text-muted">
            全{item.articleCount}本・うち{item.freeArticleCount}本は無料
          </p>
        )}
      </span>

      <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
