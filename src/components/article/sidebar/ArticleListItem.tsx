import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import CheckIcon from "./CheckIcon";
import ArticleTag, { type TagType } from "./ArticleTag";

interface ArticleListItemProps {
  title: string;
  tag: TagType;
  isCompleted: boolean;
  isActive?: boolean;
  href: string;
}

/**
 * ArticleListItem コンポーネント
 * クエスト内の記事アイテム。完了状態、記事タイプ、タイトルを表示。
 * 3つの状態（Default / Hover / Active）を持つ。
 *
 * Figma仕様（SIDEBAR-SPEC.md準拠）:
 * - 幅: 288px (w-72)
 * - padding: 16px / 2px
 * - Default: 背景なし、テキスト gray-600、font-normal
 * - Hover: bg-slate-400/20、テキスト gray-600、font-bold
 * - Active: bg-slate-400/5、border-l-2 indigo-500、テキスト neutral-900、font-bold
 */
export function ArticleListItem({
  title,
  tag,
  isCompleted,
  isActive = false,
  href,
}: ArticleListItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        // 共通ベース
        "group w-72 pl-3 pr-3 py-0.5 inline-flex flex-col justify-start items-start gap-2.5",
        // Active状態
        isActive && "bg-slate-400/5 border-l-2 border-indigo-500",
        // Default → Hover
        !isActive && "hover:bg-slate-400/20"
      )}
    >
      <div className="self-stretch py-2 rounded-md inline-flex justify-between items-center">
        {/* 完了状態アイコン */}
        <CheckIcon isCompleted={isCompleted} />

        {/* コンテンツエリア */}
        <div className="flex-1 pl-2 flex justify-start items-center gap-0.5 min-w-0 overflow-hidden">
          {/* 記事タイプタグ */}
          <ArticleTag type={tag} />

          {/* タイトル（1行省略） */}
          <span
            className={cn(
              // 共通ベース - 1行でブロック端で切る（...なし）
              "flex-1 text-xs font-noto-sans-jp leading-5 whitespace-nowrap overflow-hidden",
              // Active状態
              isActive && "text-neutral-900 font-medium",
              // Default → Hover
              !isActive && "text-gray-600 font-normal"
            )}
          >
            {title}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ArticleListItem;
