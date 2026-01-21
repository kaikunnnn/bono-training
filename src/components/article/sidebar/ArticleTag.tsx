export type TagType = "explain" | "intro" | "practice" | "challenge" | "demo";

const tagLabels: Record<TagType, string> = {
  explain: "知識",
  intro: "イントロ",
  practice: "実践",
  challenge: "チャレンジ",
  demo: "実演解説",
};

// 将来的に色を追加する想定
const tagStyles: Record<TagType, { container: string; text: string }> = {
  explain: { container: "border border-[#878A92] rounded-full", text: "text-[#878A92]" },
  intro: {
    container: "border border-[#878A92] rounded-full text-[#878A92]",
    text: "text-[#878A92] tracking-[-1px]",
  },
  practice: { container: "border border-[#878A92] rounded-full", text: "text-[#878A92]" },
  challenge: { container: "border border-[#878A92] rounded-full", text: "text-[#878A92]" },
  demo: { container: "border border-[#878A92] rounded-full", text: "text-[#878A92]" },
};

interface ArticleTagProps {
  type?: TagType;
}

/**
 * ArticleTag コンポーネント
 * 記事タイプを示すタグ（知識、イントロ、実践、チャレンジ、実演解説）
 *
 * Figma仕様（SIDEBAR-SPEC.md準拠）:
 * - padding: 4px / 2px
 * - 背景: #F4F4F5
 * - 角丸: 6px
 * - テキスト: 10px, Medium, Noto Sans JP
 * - テキスト色: #64748B
 */
export function ArticleTag({ type }: ArticleTagProps) {
  if (!type) return null;

  const style = tagStyles[type];

  return (
    <div
      className={`px-1 py-0.5 flex justify-center items-center flex-shrink-0 bg-transparent ${style.container}`}
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
