import { cn } from "@/lib/utils";
import type { AvatarTone, Learner } from "../_data";

/** 塗り色はDSトークンのみ（生の色は書かない） */
const TONE_CLASS: Record<AvatarTone, string> = {
  career: "bg-[var(--cat-uiux-career)]",
  ux: "bg-[var(--cat-ux-design)]",
  info: "bg-[var(--cat-info-arch)]",
  visual: "bg-[var(--cat-ui-visual)]",
  olive: "bg-label-olive",
  orange: "bg-accent-orange",
  link: "bg-text-link",
  night: "bg-[var(--dawn-predawn)]",
  brand: "bg-cta-primary-bg",
};

const SIZE_CLASS = {
  xs: "h-5 w-5 text-[length:var(--text-2xs)]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
} as const;

interface InitialAvatarProps {
  person: Learner;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

/** 画像の代わりにイニシャル入りの円で表すアバター（プロト用） */
export function InitialAvatar({ person, size = "md", className }: InitialAvatarProps) {
  const initial = person.id === "bono" ? "B" : person.name.slice(0, 1);
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-text-inverse",
        TONE_CLASS[person.tone],
        SIZE_CLASS[size],
        className,
      )}
    >
      {initial}
    </span>
  );
}
