export type TagType = "explain" | "intro" | "practice" | "challenge" | "demo";

const tagLabels: Record<TagType, string> = {
  explain: "知識",
  intro: "イントロ",
  practice: "実践",
  challenge: "チャレンジ",
  demo: "実演解説",
};

const tagStyles: Record<TagType, { container: string; text: string }> = {
  explain: { container: "border border-border-strong rounded-full", text: "text-text-muted" },
  intro: {
    container: "border border-border-strong rounded-full text-text-muted",
    text: "text-text-muted tracking-[-1px]",
  },
  practice: { container: "border border-border-strong rounded-full", text: "text-text-muted" },
  challenge: { container: "border border-border-strong rounded-full", text: "text-text-muted" },
  demo: { container: "border border-border-strong rounded-full", text: "text-text-muted" },
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
