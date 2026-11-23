"use client";

/**
 * 【試作コピー #282 パターンG】src/components/roadmap/detail/SectionNav.tsx のコピー。
 * 変更点:
 * - 折りたたみ風の縦3つ（下向き矢印つきの枠）をやめ、「このページの内容」という札付きのチップ横並びにした
 *   （NN/g「In-Page Links」: 札が無いとページ内リンクだと分からない／スマホでは短く）
 * - 項目は短い名前（流れ・変化・視点・カリキュラム＋そのパターンにあれば 転職した人・よくある質問）
 * - スマホは折り返し。押せる見た目なので共通 Button（outline）を asChild で使う
 * 本番の部品は変えていない。
 */

import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SectionNavDevItem {
  /** セクションID（アンカーリンク用） */
  id: string;
  /** 表示ラベル（短く） */
  label: string;
}

export default function SectionNavDev({ items }: { items: SectionNavDevItem[] }) {
  if (!items || items.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <nav aria-labelledby="page-contents-label" className="pt-8 pb-10 px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto">
        <p id="page-contents-label" className="mb-3 text-[12px] font-bold text-text-muted">
          このページの内容
        </p>
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <Button asChild variant="outline" size="default" className="rounded-full px-4">
                <a href={`#${item.id}`} onClick={(e) => handleClick(e, item.id)}>
                  {item.label}
                  <ArrowDown aria-hidden="true" className="text-text-muted" />
                </a>
              </Button>
            </li>
          ))}
        </ul>
        {/* 区切り線（元の SectionNav と同じ） */}
        <div className="mt-10 border-t border-black/[0.08]" />
      </div>
    </nav>
  );
}
