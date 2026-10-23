import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AvatarTone } from "../_data";

/** 画像が読めないときの頭文字の円（DSトークンのみ） */
const TONE_CLASS: Record<AvatarTone, string> = {
  career: "bg-[var(--cat-uiux-career)]",
  ux: "bg-[var(--cat-ux-design)]",
  info: "bg-[var(--cat-info-arch)]",
  visual: "bg-[var(--cat-ui-visual)]",
  olive: "bg-label-olive",
  orange: "bg-accent-orange",
  link: "bg-text-link",
  brand: "bg-cta-primary-bg",
};

const SIZE_CLASS = {
  xs: "h-6 w-6 text-[length:var(--text-2xs)]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
} as const;

/** イラストのアイコン（DiceBear notionists。next.config の remotePatterns に許可済み） */
function illustrationUrl(id: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(id)}`;
}

interface PeerAvatarProps {
  person: { id: string; name: string; tone: AvatarTone };
  size?: keyof typeof SIZE_CLASS;
  /** B: いま作業中（色つき＋周りのリングがゆっくり光る） */
  live?: boolean;
  /** B: 作業していない（グレー＋薄く） */
  dim?: boolean;
  className?: string;
}

/** 同期のアイコン（/dev/peers 専用。progress-feed とは独立） */
export function PeerAvatar({
  person,
  size = "md",
  live,
  dim,
  className,
}: PeerAvatarProps) {
  return (
    <span
      className={cn("relative inline-flex shrink-0 rounded-full", className)}
      aria-hidden
    >
      {live && (
        <span className="absolute -inset-1.5 rounded-full bg-success/25 motion-safe:animate-pulse" />
      )}
      <Avatar
        className={cn(
          "bg-muted",
          SIZE_CLASS[size],
          live && "ring-2 ring-success ring-offset-2 ring-offset-surface",
          dim && "opacity-50 grayscale",
        )}
      >
        <AvatarImage src={illustrationUrl(person.id)} alt="" />
        <AvatarFallback
          className={cn("font-bold text-text-inverse", TONE_CLASS[person.tone])}
        >
          {person.name.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
    </span>
  );
}
