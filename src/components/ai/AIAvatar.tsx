import React from "react";
import { cn } from "@/lib/utils";

interface AIAvatarProps {
  className?: string;
}

/**
 * AI アシスタントのアバター（48×48、グラデ + 👼 絵文字）
 * ChatInterface 空状態のヘッダーと、ChatMessage の AI 応答アバターで共通使用
 */
export function AIAvatar({ className }: AIAvatarProps) {
  return (
    <div
      className={cn(
        "size-12 bg-linear-48 from-red-100 via-rose-200 to-violet-200 rounded-2xl inline-flex justify-center items-center flex-shrink-0",
        className
      )}
    >
      <div className="text-center justify-start text-gray-700 text-lg font-bold font-['Noto_Sans_JP'] leading-7">
        👼
      </div>
    </div>
  );
}

export default AIAvatar;
