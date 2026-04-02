/**
 * ロードマップ詳細ページ - ロードマップで得られる「変化」セクション
 *
 * Figma: PRD🏠_Roadmap_2026 node-id 266-33198
 * 2026-04-02: 横型レイアウト（課題 → 矢印 → 解決）
 */

import { MessageQuestion, ArrowRight2 } from "iconsax-react";
import type { SanityChangingLandscape } from "@/types/sanity-roadmap";

interface ChangingLandscapeProps {
  data?: SanityChangingLandscape;
}

export default function ChangingLandscape({ data }: ChangingLandscapeProps) {
  // データがない場合は表示しない
  if (!data || !data.items || data.items.length === 0) {
    return null;
  }

  return (
    <section id="changing-landscape" className="py-16 px-4 md:px-8 scroll-mt-24">
      <div className="max-w-[1100px] mx-auto">
        {/* ヘッダー */}
        <div className="mb-9">
          {/* バッジ */}
          <div className="inline-flex items-center justify-center border border-[#52674e] rounded-full px-[8px] py-[2px] mb-4">
            <span className="text-[12px] font-bold text-[#52674e] uppercase">
              ゴール
            </span>
          </div>

          {/* タイトル */}
          <h2 className="text-[24px] font-extrabold text-[#293525] leading-[36px] mb-4">
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
        <p className="text-[14px] font-extrabold text-[#0f172a] mb-6">
          悩みが楽しみになる「変化」を獲得しよう
        </p>

        {/* カードリスト */}
        <div className="flex flex-col gap-3">
          {data.items.map((item, index) => (
            <div
              key={index}
              className="bg-white border-l-4 border-[#d3d3d3] flex items-center justify-between pl-9 pr-8 py-4 rounded-br-lg rounded-tr-lg"
            >
              {/* 左側: アイコン + 課題テキスト */}
              <div className="flex items-center gap-3 shrink-0">
                {/* アイコン */}
                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                  <MessageQuestion
                    size={24}
                    color="#939993"
                    variant="Linear"
                  />
                </div>

                {/* タイトル（悩み・課題） */}
                <p className="text-[16px] font-bold text-[#1a1a1a] leading-[25.2px] w-[425px]">
                  {item.title}
                </p>
              </div>

              {/* 中央: 矢印アイコン */}
              <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                <ArrowRight2 size={32} color="#939993" variant="Linear" />
              </div>

              {/* 右側: 解決テキスト */}
              {item.description && (
                <p className="text-[16px] text-[#0f172a] leading-[25.2px] w-[427px]">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
