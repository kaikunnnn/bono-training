export type TagType = "explain" | "intro" | "practice" | "challenge";

const tagLabels: Record<TagType, string> = {
  explain: "解説",
  intro: "イントロ",
  practice: "実践",
  challenge: "チャレンジ",
};

// 将来的に色を追加する想定
const tagStyles: Record<TagType, { bg: string; text: string }> = {
  explain: { bg: "bg-zinc-100", text: "text-slate-500" },
  intro: { bg: "bg-zinc-100", text: "text-slate-500" },
  practice: { bg: "bg-zinc-100", text: "text-slate-500" },
  challenge: { bg: "bg-zinc-100", text: "text-slate-500" },
};

interface ArticleTagProps {
  type: TagType;
}

/**
 * ArticleTag コンポーネント
 * 記事タイプを示すタグ（解説、イントロ、実践、チャレンジ）
 *
 * Figma仕様（SIDEBAR-SPEC.md準拠）:
 * - padding: 4px / 2px
 * - 背景: #F4F4F5
 * - 角丸: 6px
 * - テキスト: 10px, Medium, Noto Sans JP
 * - テキスト色: #64748B
 */
export function ArticleTag({ type }: ArticleTagProps) {
  const style = tagStyles[type];

  return (
    <div
      className={`px-1 py-0.5 rounded-md flex justify-center items-center flex-shrink-0 ${style.bg}`}
    >
      <span
        className={`text-[10px] font-medium font-noto-sans-jp leading-[10px] ${style.text}`}
      >
        {tagLabels[type]}
      </span>
    </div>
  );
}

export default ArticleTag;
