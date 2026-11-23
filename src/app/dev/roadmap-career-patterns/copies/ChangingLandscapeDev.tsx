"use client";

/**
 * 【試作コピー #282 パターンC】src/components/roadmap/detail/ChangingLandscape.tsx のコピー。
 * 変更点は「独学で転職できるか不安」のカードの説明の下に、転職した人の話（/stories）へのリンクを足しただけ。
 * 本番の部品は変えていない。
 *
 * ロードマップ詳細ページ - ロードマップで得られる「変化」セクション
 *
 * Figma: PRD🏠_Roadmap_2026 node-id 266-33198
 * 2026-04-02: 横型レイアウト（課題 → 矢印 → 解決）
 */

import Link from "next/link";
import { MessageCircleQuestion, ArrowRight } from "lucide-react";
import type { SanityChangingLandscape } from "@/types/sanity-roadmap";

interface ChangingLandscapeProps {
  data?: SanityChangingLandscape;
}

/** 実例リンクを足すカード（Sanity のタイトルと完全一致したときだけ出す。一致しなければ出さない） */
const STORY_LINK_CARD_TITLE = "独学で転職できるか不安";

export default function ChangingLandscapeDev({ data }: ChangingLandscapeProps) {
  // データがない場合は表示しない
  if (!data || !data.items || data.items.length === 0) {
    return null;
  }

  return (
    <section id="changing-landscape" className="py-8 px-4 md:px-8 scroll-mt-24">
      <div className="max-w-[1100px] mx-auto">
        {/* ヘッダー */}
        <div className="mb-9">
          {/* バッジ */}
          <div className="inline-flex items-center justify-center border border-text-secondary rounded-full px-[8px] py-[2px] mb-4">
            <span className="text-[12px] font-bold text-text-secondary uppercase">
              ゴール
            </span>
          </div>

          {/* タイトル */}
          <h2 className="text-[24px] font-extrabold text-text-secondary leading-[36px] mb-4">
            ロードマップで得られる「変化」
          </h2>

          {/* 説明文 */}
          {data.description && (
            <p className="text-[20px] text-[rgba(41,53,37,0.8)] leading-[27px]">
              {data.description}
            </p>
          )}
        </div>

        {/* サブヘッダー */}
        <p className="text-[14px] font-extrabold text-text-primary mb-6">
          悩みが楽しみになる「変化」を獲得しよう
        </p>

        {/* カードリスト */}
        <div className="flex flex-col gap-3">
          {data.items.map((item, index) => (
            <div
              key={index}
              className="bg-white border-l-4 border-border-light flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 pl-6 md:pl-9 pr-6 md:pr-8 py-6 md:py-4 rounded-br-lg rounded-tr-lg"
            >
              {/* 左側: アイコン + 課題テキスト */}
              <div className="flex items-center gap-3 shrink-0 w-full md:w-[425px]">
                {/* アイコン */}
                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                  <MessageCircleQuestion
                    size={24}
                    color="#939993"
                  />
                </div>

                {/* タイトル（悩み・課題） */}
                <p className="text-[16px] font-bold text-text-primary leading-[25.2px]">
                  {item.title}
                </p>
              </div>

              {/* 中央: 矢印アイコン（デスクトップのみ） */}
              <div className="hidden md:flex shrink-0 w-8 h-8 items-center justify-center">
                <ArrowRight size={32} color="#939993" />
              </div>

              {/* 右側: 解決テキスト（＋試作C: 実例リンク） */}
              {item.description && (
                <div className="w-full md:w-[427px]">
                  <p className="text-[16px] text-text-primary leading-[25.2px]">
                    {item.description}
                  </p>
                  {item.title === STORY_LINK_CARD_TITLE && (
                    <Link
                      href="/stories"
                      className="mt-1 inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-text-primary underline underline-offset-4 hover:opacity-70"
                    >
                      転職した人の話を読む
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
