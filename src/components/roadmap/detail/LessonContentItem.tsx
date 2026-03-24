/**
 * カリキュラム - レッスンコンテンツアイテム
 *
 * Figma: PRD🏠_Roadmap_2026 node-id 1-8447
 */

import { Link } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";
import type { SanityReferenceContent } from "@/types/sanity-roadmap";

interface LessonContentItemProps {
  /** コンテンツデータ */
  content: SanityReferenceContent;
}

export default function LessonContentItem({ content }: LessonContentItemProps) {
  const lessonUrl = `/lessons/${content.slug.current}`;
  // レッスンはiconImageUrlを優先的に使用
  const imageUrl = content.iconImageUrl || content.thumbnailUrl;

  return (
    <Link
      to={lessonUrl}
      className="group flex items-center gap-6 p-6 bg-white rounded-2xl shadow-[0_1px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_32px_rgba(0,0,0,0.12)] transition-all"
    >
      {/* アイコン画像 - 右側のみ角丸 */}
      <div className="flex-shrink-0 w-[106px] h-[160px] overflow-hidden rounded-r-lg shadow-[0_1px_24px_rgba(0,0,0,0.16)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>

      {/* コンテンツ情報 */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* ラベル + タイトル */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-text-gray">レッスン</p>
          <h5 className="text-base font-bold text-[#1a1a1a] leading-[1.4] group-hover:text-primary transition-colors">
            {content.title}
          </h5>
        </div>

        {/* 区切り線 */}
        <div className="border-t border-gray-200" />

        {/* 説明 */}
        {content.description && (
          <p className="text-base text-[#666] leading-[1.4] line-clamp-2">
            {content.description}
          </p>
        )}
      </div>

      {/* 矢印アイコン */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 group-hover:border-gray-300 group-hover:bg-gray-50 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>
    </Link>
  );
}
