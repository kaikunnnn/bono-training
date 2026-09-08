// src/components/feedback/FeedbackCard.tsx — mainからコピー＋最小変更
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Feedback } from "@/types/sanity";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

// カテゴリごとのFluentEmoji 3D URLマッピング
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

const categoryEmoji: Record<string, string> = {
  portfolio: "💼",
  "user-value-design": "🎯",
  "ui-style": "🎨",
  career: "🚀",
  default: "📝",
};

const categoryGradient: Record<string, string> = {
  portfolio: "from-blue-100/50 via-indigo-50/50 to-white",
  "user-value-design": "from-orange-100/50 via-amber-50/50 to-white",
  "ui-style": "from-pink-100/50 via-rose-50/50 to-white",
  career: "from-emerald-100/50 via-teal-50/50 to-white",
  default: "from-gray-100/50 via-slate-50/50 to-white",
};

interface FeedbackCardProps {
  feedback: Feedback;
  index?: number;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const publishedDate = feedback.publishedAt
    ? new Date(feedback.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const categorySlug = feedback.category?.slug?.current || "default";
  const emojiUrl =
    categoryEmojiUrl[categorySlug] || categoryEmojiUrl["default"];
  const emojiAlt = categoryEmoji[categorySlug] || categoryEmoji["default"];
  const gradientClass =
    categoryGradient[categorySlug] || categoryGradient["default"];

  return (
    <motion.div variants={fadeInUp} className="h-full">
      <Link
        href={`/feedbacks/${feedback.slug.current}`}
        className="group block h-full bg-white rounded-[24px] border border-border/50 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: isHovered ? 'translateY(-4px)' : 'none',
          boxShadow: isHovered
            ? '0px 4px 18px 0px rgba(0,0,0,0.16)'
            : '0px 1px 8px 0px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          willChange: 'transform',
        }}
      >
        {/* ビジュアルエリア */}
        <div
          className={cn(
            "h-[180px] w-full bg-gradient-to-br flex items-center justify-center relative overflow-hidden",
            gradientClass
          )}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/40 rounded-full blur-2xl" />

          <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
            <img
              src={emojiUrl}
              alt={emojiAlt}
              className="w-16 h-16 object-contain drop-shadow-sm"
              loading="lazy"
            />
          </div>

          {feedback.category && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center justify-center px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-white/50 shadow-sm">
                <span className="font-noto-sans-jp text-[11px] font-bold text-foreground/80">
                  {feedback.category.title}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* コンテンツエリア */}
        <div className="p-6 flex flex-col gap-3">
          <h3 className="font-rounded-mplus text-[17px] font-bold text-foreground leading-[1.6] line-clamp-2 group-hover:text-primary transition-colors">
            {feedback.title}
          </h3>

          {feedback.targetOutput && (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">📎</span>
              <span className="font-noto-sans-jp text-[12px] font-medium text-foreground/80 line-clamp-1">
                {feedback.targetOutput}
              </span>
            </div>
          )}

          {feedback.excerpt && (
            <p className="font-noto-sans-jp text-[13px] text-muted-foreground leading-[1.8] line-clamp-2">
              {feedback.excerpt}
            </p>
          )}

          <div className="mt-auto pt-4 flex items-center text-xs text-muted-foreground/70">
            {publishedDate && <span>{publishedDate}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default FeedbackCard;
