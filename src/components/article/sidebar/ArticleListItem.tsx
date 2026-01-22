import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IconCheck } from "@/components/ui/icon-check";
import ArticleTag, { type TagType } from "./ArticleTag";

export type QuestArticleItemLayoutVariant = "A" | "B" | "C";

interface ArticleListItemProps {
  title: string;
  tag?: TagType;
  isCompleted: boolean;
  isActive?: boolean;
  href: string;
  /** クエストアイテムのレイアウト比較（/dev/quest-layouts と合わせる） */
  layoutVariant?: QuestArticleItemLayoutVariant;
}

/**
 * ArticleListItem コンポーネント
 * クエスト内の記事アイテム。完了状態、記事タイプ、タイトルを表示。
 * 3つの状態（Default / Hover / Active）を持つ。
 *
 * Figma仕様（SIDEBAR-SPEC.md準拠）:
 * - 幅: 親要素に追従（レスポンシブ）
 * - padding: 16px / 2px
 * - Default: 背景なし、テキスト gray-600、font-normal
 * - Hover: bg-slate-400/20、テキスト gray-600、font-bold
 * - Active: bg-[rgba(193,207,225,0.32)]、border-l-2 indigo-500、テキスト neutral-900、font-bold
 */
export function ArticleListItem({
  title,
  tag,
  isCompleted,
  isActive = false,
  href,
  layoutVariant = "C",
}: ArticleListItemProps) {
  const titleClassName = cn(
    "text-xs font-noto-sans-jp leading-5",
    isActive ? "text-neutral-900 font-medium" : "text-gray-600 font-normal",
  );

  return (
    <Link
      to={href}
      className={cn(
        // 共通ベース
        "group w-full pl-3 pr-3 py-0.5 inline-flex flex-col justify-start items-start gap-2.5",
        // Active状態
        isActive && "bg-[rgba(193,207,225,0.32)] border-l-2 border-indigo-500",
        // Default → Hover
        !isActive && "hover:bg-slate-400/20"
      )}
    >
      <div className="self-stretch py-2 rounded-md inline-flex justify-between items-center">
        {/* 完了状態アイコン */}
        <IconCheck isCompleted={isCompleted} />

        {/* コンテンツエリア */}
        {layoutVariant === "A" && (
          <div className="flex-1 pl-2 flex flex-col justify-center gap-0.5 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1">
              <ArticleTag type={tag} />
            </div>
            <span className={cn("whitespace-nowrap overflow-hidden text-ellipsis", titleClassName)}>
              {title}
            </span>
          </div>
        )}

        {layoutVariant === "B" && (
          <div className="flex-1 pl-2 flex flex-col justify-center gap-0.5 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1">
              <ArticleTag type={tag} />
            </div>
            <span className={cn("line-clamp-2", titleClassName)}>
              {title}
            </span>
          </div>
        )}

        {layoutVariant === "C" && (
          <div className="flex-1 pl-2 flex justify-start items-center gap-0.5 min-w-0 overflow-hidden">
            <ArticleTag type={tag} />
            <span className={cn("flex-1 whitespace-nowrap overflow-hidden text-ellipsis", titleClassName)}>
              {title}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default ArticleListItem;
