/**
 * ロードマップ詳細ページ - 獲得する、デザインを楽しむ「力」セクション
 *
 * Figma: PRD🏠_Roadmap_2026 node-id 1-5906
 */

import { Verify } from "iconsax-react";
import type { SanityInterestingPerspectives } from "@/types/sanity-roadmap";

interface InterestingPerspectivesProps {
  data?: SanityInterestingPerspectives;
}

export default function InterestingPerspectives({
  data,
}: InterestingPerspectivesProps) {
  // データがない場合は表示しない
  if (!data || !data.items || data.items.length === 0) {
    return null;
  }

  return (
    <section id="interesting-perspectives" className="py-8 px-4 md:px-8 scroll-mt-24">
      <div className="max-w-[1100px] mx-auto">
        {/* ヘッダー */}
        <div className="mb-[30px]">
          {/* バッジ */}
          <div className="inline-flex items-center justify-center border border-[#52674e] rounded-full px-[8px] py-[2px] mb-4">
            <span className="text-[12px] font-bold text-[#52674e] uppercase">
              身につくこと
            </span>
          </div>

          {/* タイトル */}
          <h2 className="text-[24px] font-extrabold text-[#293525] leading-[36px] mb-4">
            獲得する、デザインを楽しむ「力」
          </h2>

          {/* 説明文 */}
          {data.description && (
            <p className="text-[20px] text-[rgba(41,53,37,0.8)] leading-[27px]">
              {data.description}
            </p>
          )}
        </div>

        {/* コンテンツブロック */}
        <div className="bg-white rounded-2xl p-1">
          {/* サブヘッダー */}
          <div className="bg-[#e8ece8] px-6 py-4 rounded-t-[16px] rounded-b-[4px]">
            <p className="text-[14px] font-extrabold text-[#0f172a]">
              獲得を目指すもの
            </p>
          </div>

          {/* アイテムリスト */}
          <div className="px-6">
            {data.items.map((item, index) => (
              <div
                key={index}
                className={`py-[30px] ${
                  index < data.items.length - 1
                    ? "border-b border-[#c8c8c8]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-6">
                  {/* アイコン */}
                  <div className="flex-shrink-0">
                    <Verify size={24} color="#52674e" variant="Linear" />
                  </div>

                  {/* テキストコンテンツ */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 flex-1">
                    {/* タイトル */}
                    <p className="text-[16px] font-bold text-[#1a1a1a] leading-[1.575] md:w-[425px] md:flex-shrink-0">
                      {item.title}
                    </p>

                    {/* 説明 */}
                    {item.description && (
                      <p className="text-[16px] text-black leading-[1.575] flex-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
