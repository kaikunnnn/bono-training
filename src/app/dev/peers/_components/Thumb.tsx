import { Gallery } from "iconsax-react";
import { cn } from "@/lib/utils";

/** アウトプット画像の代わりのグレーの四角（中に課題名を小さく） */
export function Thumb({
  caption,
  className,
}: {
  caption: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex aspect-[16/10] w-full flex-col items-center justify-center gap-1.5 rounded-[14px] bg-muted-strong px-4 text-center",
        className,
      )}
    >
      <Gallery
        size={22}
        color="currentColor"
        variant="Linear"
        className="text-text-muted"
        aria-hidden
      />
      <span className="text-[length:var(--text-2xs)] leading-snug text-text-muted">
        {caption}
      </span>
    </div>
  );
}
