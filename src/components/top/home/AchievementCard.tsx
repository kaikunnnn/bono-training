import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * みんなの実績カード（新トップ 2026 / ブロックF）
 *
 * 転職インタビュー(story) と アウトプット(output) を「統一デザイン」で並べるための
 * 共通カード。Figma（node 662-39795）は体験談側/アウトプット側で別デザインだが、
 * ユーザー指示により「両方とも統一カード・1 行に混在」で実装する。
 *
 * - サムネイル: 16:9 固定（このプロトタイプの他ブロックと統一）
 * - タイトル: `font-rounded-mplus` 太字 + `line-clamp-2`
 * - type に応じた小さいラベル（転職インタビュー / アウトプット）
 * - story は内部リンク、output は外部リンク（別タブ）
 */

const FALLBACK_THUMB = "/placeholder-thumbnail.svg";

export interface AchievementCardProps {
  type: "story" | "output";
  title: string;
  thumbnailUrl: string;
  authorName?: string;
  /** 著者アバター画像（story のみ。無ければアイコン非表示） */
  authorAvatarUrl?: string;
  /** 著者の役職・現在の職種（story の person.currentRole） */
  authorRole?: string;
  href: string;
  /**
   * タイトルフォントサイズをトップページの他ブロック（おすすめコンテンツ等）と
   * 揃える試験用バリアント（20px→18px）。トップページ再構築コンポーネント
   * （top2/top3）固有の指定で、共有デザインシステムには影響しない。
   */
  compact?: boolean;
  className?: string;
}

const TYPE_LABEL: Record<AchievementCardProps["type"], string> = {
  story: "転職インタビュー",
  output: "アウトプット",
};

export default function AchievementCard({
  type,
  title,
  thumbnailUrl,
  authorName,
  authorAvatarUrl,
  authorRole,
  href,
  compact = false,
  className,
}: AchievementCardProps) {
  const thumb = thumbnailUrl || FALLBACK_THUMB;
  const isExternal = type === "output";

  const body = (
    <article className="flex flex-col gap-3">
      {/* サムネイル（16:9 固定、ブロックサイズは変えずホバー時は中の画像だけふわっと拡大） */}
      <div className="relative w-full aspect-video overflow-hidden rounded-[16px] bg-muted-custom">
        <Image
          src={thumb}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          unoptimized
        />
      </div>

      {/* テキスト */}
      <div className="flex flex-col gap-2">
        {/* タイプラベル */}
        <span className="text-xs font-bold text-text-primary/60 font-noto-sans-jp">
          {TYPE_LABEL[type]}
        </span>

        {/* タイトル（他ブロックの compact 規則と統一: 通常20px/compact時18px） */}
        <h3
          className={cn(
            "font-rounded-mplus font-medium leading-[1.5] text-text-primary line-clamp-2 underline-offset-4 group-hover:underline",
            compact ? "text-[18px]" : "text-xl"
          )}
        >
          {title}
        </h3>

        {/* 著者（アバター + 名前 + 役職。StoryCard の人物プロフィール表示に合わせる） */}
        {authorName && (
          <div className="flex items-center gap-2">
            {authorAvatarUrl && (
              <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-muted-custom">
                <Image
                  src={authorAvatarUrl}
                  alt={authorName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-text-primary font-noto-sans-jp">
                {authorName}
              </p>
              {authorRole && (
                <p className="truncate text-[11px] text-text-primary/60 font-noto-sans-jp">
                  {authorRole}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("group block", className)}
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={cn("group block", className)}>
      {body}
    </Link>
  );
}
