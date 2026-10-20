import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { BONO_ID, type AvatarTone, type Learner } from "../_data";

/** 塗り色はDSトークンのみ（生の色は書かない）。画像が読めないときと運営アカウントで使う */
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

/** イラストのユーザーアイコン（DiceBear notionists。next.config の remotePatterns に許可済みのホスト） */
function illustrationUrl(id: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(id)}`;
}

interface InitialAvatarProps {
  person: Learner;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

/** ユーザーアイコン（プロト用）。運営はロゴ代わりの「B」、ほかはイラスト。画像が読めないときは頭文字の円 */
export function InitialAvatar({ person, size = "md", className }: InitialAvatarProps) {
  const isStaff = person.id === BONO_ID;
  const initial = isStaff ? "B" : person.name.slice(0, 1);
  return (
    <Avatar aria-hidden className={cn("bg-muted", SIZE_CLASS[size], className)}>
      {!isStaff && <AvatarImage src={illustrationUrl(person.id)} alt="" />}
      <AvatarFallback
        className={cn("font-bold text-text-inverse", TONE_CLASS[person.tone])}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
