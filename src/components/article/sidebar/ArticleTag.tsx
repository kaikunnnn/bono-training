export type TagType = "explain" | "intro" | "practice" | "challenge" | "demo";

const tagLabels: Record<TagType, string> = {
  explain: "知識",
  intro: "イントロ",
  practice: "実践",
  challenge: "チャレンジ",
  demo: "実演解説",
};

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
