/**
 * カリキュラム - 外部リンクカード
 *
 * Sanityで設定した外部リンク（URL、タイトル、説明、サムネイル）を表示
 * 内部リンク・外部リンク両方に対応
 */

import { ChevronRight, ExternalLink, Link as LinkIcon } from "lucide-react";
import type { SanityExternalLink } from "@/types/sanity-roadmap";

interface ExternalLinkCardProps {
  /** リンクデータ */
  link: SanityExternalLink;
}

/**
 * URLが外部リンクかどうかを判定
 */
function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
}

export default function ExternalLinkCard({ link }: ExternalLinkCardProps) {
  const isExternal = isExternalUrl(link.url);

  const cardContent = (
    <>
      {/* サムネイル画像 - OGP比率 1.91:1 */}
      <div className="flex-shrink-0 w-[160px] aspect-[1.91/1] overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
        {link.thumbnailUrl ? (
          <img
            src={link.thumbnailUrl}
            alt={link.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isExternal ? (
              <ExternalLink className="w-8 h-8 text-gray-400" />
            ) : (
              <LinkIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
        )}
      </div>

      {/* コンテンツ情報 */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* ラベル + タイトル */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-text-muted">
            {isExternal ? "外部リンク" : "リンク"}
          </p>
          <h5 className="text-base font-bold text-[#1a1a1a] leading-[1.4] group-hover:text-primary transition-colors">
            {link.title}
          </h5>
        </div>

        {/* 説明 */}
        {link.description && (
          <p className="text-sm text-[#666] leading-[1.4] line-clamp-2">
            {link.description}
          </p>
        )}
      </div>

      {/* 矢印アイコン */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 group-hover:border-gray-300 group-hover:bg-gray-50 transition-colors">
          {isExternal ? (
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          )}
        </div>
      </div>
    </>
  );

  const className =
    "group flex items-center gap-5 p-5 bg-white rounded-2xl shadow-[0_1px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_32px_rgba(0,0,0,0.12)]";

  // 外部リンクの場合は<a>タグ、内部リンクの場合も<a>タグ（react-routerを経由しない）
  return (
    <a
      href={link.url}
      className={className}
      style={{ transition: 'box-shadow 0.2s ease' }}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {cardContent}
    </a>
  );
}
