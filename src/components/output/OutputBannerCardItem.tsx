/**
 * OutputBannerCardItem — アウトプット一覧用カード（本番版）
 *
 * BON-345 確定パターン: 横長バナー型（aspect 2:1, 3列）
 * Sanity の UserOutputSummary をそのまま受ける。
 */

import Image from "next/image";
import type { UserOutputSummary } from "@/types/sanity";

interface OutputBannerCardItemProps {
  output: UserOutputSummary;
}

const FALLBACK_THUMB = "/placeholder-thumbnail.svg";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 表示名から「頭文字」と「背景色」を作る。
 * カッコ付き名前（例: ユウ（ビビッドピンクの人））はカッコ前から取る。
 */
function getInitial(name: string): string {
  const clean = name.split(/[（(]/)[0].trim();
  return clean.charAt(0).toUpperCase();
}

// 名前ごとに安定した色を割り当てる（パステル系）
const AVATAR_COLORS = [
  { bg: "#FED7AA", fg: "#9A3412" }, // orange
  { bg: "#FECACA", fg: "#991B1B" }, // red
  { bg: "#FDE68A", fg: "#854D0E" }, // yellow
  { bg: "#D1FAE5", fg: "#065F46" }, // green
  { bg: "#BFDBFE", fg: "#1E40AF" }, // blue
  { bg: "#DDD6FE", fg: "#5B21B6" }, // purple
  { bg: "#FBCFE8", fg: "#9D174D" }, // pink
  { bg: "#A7F3D0", fg: "#064E3B" }, // teal
];

function getAvatarColor(name: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function OutputBannerCardItem({ output }: OutputBannerCardItemProps) {
  const thumb = output.articleImage || FALLBACK_THUMB;
  const title = output.articleTitle || output.articleUrl;
  const authorName = output.author?.displayName || "受講者";
  const usedLabel = output.bonoContent || output.relatedLesson?.title;

  return (
    <a
      href={output.articleUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <article className="bg-surface rounded-[20px] border border-gray-200/60 overflow-hidden shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-gray-300">
        <div className="relative w-full aspect-[2/1] bg-muted-custom overflow-hidden">
          <Image
            src={thumb}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            unoptimized
          />
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="text-sm sm:text-base font-bold text-text-primary font-rounded-mplus leading-snug line-clamp-2 group-hover:underline">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-text-primary/60 font-noto-sans-jp">
            <span
              aria-hidden
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold flex-shrink-0"
              style={{
                backgroundColor: getAvatarColor(authorName).bg,
                color: getAvatarColor(authorName).fg,
              }}
            >
              {getInitial(authorName)}
            </span>
            <span className="font-medium truncate">{authorName}</span>
            <span aria-hidden className="text-text-primary/30 flex-shrink-0">•</span>
            <span className="flex-shrink-0">{formatDate(output.submittedAt)}</span>
          </div>
          {usedLabel && (
            <div className="mt-2.5">
              <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-muted-custom text-text-primary/70 font-noto-sans-jp">
                📚 {usedLabel}
              </span>
            </div>
          )}
        </div>
      </article>
    </a>
  );
}
