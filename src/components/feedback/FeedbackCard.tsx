import Link from "next/link";
import type { Feedback } from "@/types/sanity";
import { cn } from "@/lib/utils";

interface FeedbackCardProps {
  feedback: Feedback;
}

// カテゴリ別 Fluent Emoji 3D
const categoryEmojiUrl: Record<string, string> = {
  portfolio:
    "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Briefcase/3D/briefcase_3d.png",
  "user-value-design":
    "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bullseye/3D/bullseye_3d.png",
  "ui-style":
    "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Artist%20palette/3D/artist_palette_3d.png",
  career:
    "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png",
  default:
    "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Memo/3D/memo_3d.png",
};

// 控えめな単色寄り背景（淡いトーン）
const categoryBg: Record<string, string> = {
  portfolio: "bg-[#F4F6FB]",
  "user-value-design": "bg-[#FBF5EE]",
  "ui-style": "bg-[#FBF1F3]",
  career: "bg-[#F1F7F3]",
  default: "bg-[#F5F5F4]",
};

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const publishedDate = feedback.publishedAt
    ? new Date(feedback.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    : null;

  const categorySlug = feedback.category?.slug?.current || "default";
  const emojiUrl = categoryEmojiUrl[categorySlug] || categoryEmojiUrl.default;
  const bgClass = categoryBg[categorySlug] || categoryBg.default;

  return (
    <Link
      href={`/community/feedback/${feedback.slug.current}`}
      className="group flex flex-col bg-white rounded-[22px] overflow-hidden shadow-[0px_1px_7px_rgba(0,0,0,0.04)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200"
    >
      {/* サムネ: 控えめ単色背景 + 絵文字3D */}
      <div
        className={cn(
          "w-full h-[140px] flex items-center justify-center",
          bgClass
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={emojiUrl}
          alt=""
          className="w-14 h-14 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col gap-3 py-6 px-5">
        {feedback.targetOutput && (
          <p className="text-xs font-bold text-gray-500">
            {feedback.targetOutput}
          </p>
        )}

        <h3 className="font-rounded-mplus text-lg font-bold text-[#1a1a1a] leading-snug line-clamp-2 text-balance">
          {feedback.title}
        </h3>

        {feedback.excerpt && (
          <p className="text-sm text-gray-500 leading-[1.7] line-clamp-2">
            {feedback.excerpt}
          </p>
        )}

        {publishedDate && (
          <span className="mt-1 text-xs text-gray-400">{publishedDate}</span>
        )}
      </div>
    </Link>
  );
}

export default FeedbackCard;
