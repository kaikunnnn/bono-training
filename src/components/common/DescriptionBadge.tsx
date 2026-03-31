import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DescriptionBadgeProps {
  /** バッジ内のテキスト */
  children: ReactNode;
  /** 絵文字（テキストまたは画像URL） */
  emoji?: string;
  /** アイコンコンポーネント（emojiより優先） */
  icon?: ReactNode;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 説明バッジコンポーネント
 *
 * bg-muted-strong (#E9EAE6) 背景のバッジで、説明テキストと絵文字を表示
 * ロードマップセクションなどで使用
 */
export default function DescriptionBadge({
  children,
  emoji,
  icon,
  className,
}: DescriptionBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1",
        className
      )}
      style={{ backgroundColor: '#F2F3F0' }}
    >
      <span className="text-sm text-text-secondary font-normal leading-relaxed">
        {children}
      </span>
      {/* iconが優先、なければemoji */}
      {icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : emoji ? (
        <span className="text-base flex-shrink-0" role="img">
          {emoji}
        </span>
      ) : null}
    </div>
  );
}
