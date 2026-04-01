/**
 * ロードマップ詳細ページ - ロードマップで変わる「景色」セクション
 *
 * Figma: PRD🏠_Roadmap_2026 node-id 97-11643
 * 2026-04-01: 横型レイアウトに変更（タイトル | 説明 を横並び）
 */

import { MessageQuestion } from "iconsax-react";
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
          <div className="inline-flex items-center justify-center border border-[#52674e] rounded-full px-2.5 py-1.5 mb-4">
            <span className="text-[12px] font-bold text-[#52674e] uppercase">
              ゴール
            </span>
          </div>

          {/* タイトル */}
          <h2 className="text-[24px] font-extrabold text-[#293525] leading-[1.5] mb-4">
            ロードマップで変わる「景色」
          </h2>

          {/* 説明文 */}
          {data.description && (
            <p className="text-[20px] text-[#293525]/80 leading-[1.35]">
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
              className="bg-white border-l-4 border-[#E8ECE8] py-4 pl-0.5 pr-2 md:pr-5 min-h-[72px] flex items-center rounded-r-lg"
            >
              <div className="flex items-center">
                {/* アイコン */}
                <div className="flex items-center justify-center px-8">
                  <MessageQuestion
                    size={24}
                    color="#939993"
                    variant="Linear"
                  />
                </div>

                {/* テキストコンテンツ（横並び: タイトル | 説明） */}
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 flex-1">
                  {/* タイトル（悩み・課題） */}
                  <p className="text-[16px] font-extrabold text-[#1a1a1a] leading-[1.575] md:w-[425px] md:flex-shrink-0">
                    {item.title}
                  </p>

                  {/* 説明（解決後の姿） */}
                  {item.description && (
                    <p className="text-[16px] text-[#0f172a]/60 leading-[1.575] flex-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
