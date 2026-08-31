import Link from "next/link";
import type { LessonWithArticleIds } from "@/lib/sanity";
import { LessonCardRenderer } from "@/app/lessons/LessonCardRenderer";
import { cn } from "@/lib/utils";
import TopSectionHeading from "@/components/top2/TopSectionHeading";

/**
 * レッスン特集セクション（新トップ 2026 / ブロックE）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 679-7773（"lessonblock"）
 *
 * 方針: カード自体は Figma のデザインを追わず、`/lessons` と同じ
 * `LessonCardRenderer`（内部で `LessonCard` を使用）をそのまま流用する。
 * このコンポーネントが担うのは「メイン見出し + 複数行（サブ見出し + カード3枚）」の
 * セクション全体のスペーシング／リズムのみ。
 *
 * Figma 実データとの数値突合（node 679-7773）:
 * - 外側: y=4696, container child が y=24 → 上 24px、frame 高 1373.6 − container(24+1324.6)
 *   ≒ 25px → 下 25px（`pt-[24px] pb-[25px]`）
 * - メイン見出し: container 内 y=64（`py-[64px]` の上パディング相当を親 gap で表現）
 * - 見出し → 行1: 173 − (64+45) = 64px（親 `gap-16`）
 * - 行1 → 行2: 748.8 − (173+511.8) = 64px（親 `gap-16`）
 * - 各行内: サブ見出し → カード群 86 − 38 = 48px（`gap-12`）
 * - カード間: 463 − 436 = 27px（`gap-[27px]`）
 *
 * `paddingY`（number）を渡すと外側sectionの上下パディング（pt-[24px] pb-[25px]）を
 * inline styleで上書きする。見出し→コンテンツの内側 py-[64px] は不変。
 * （ページ単位の余白統一実験用 / 例: /dev/top4）。未指定時は既存挙動のまま。
 */

export interface LessonHighlightRow {
  /** 行のサブ見出し（20px） */
  subheading: string;
  /** この行に並べるレッスン（`LessonCardRenderer` が期待する型） */
  lessons: LessonWithArticleIds[];
}

export interface LessonHighlightSectionProps {
  /** バッジ文言（TODO: 実コピー未確定。仮で "GUIDE CONTENTS" を使用） */
  badgeLabel?: string;
  /** メイン見出し */
  heading: string;
  /** サブ見出し + カード3枚 の行の配列 */
  rows: LessonHighlightRow[];
  /** フォントサイズを2px落とした試験用バリアント（/dev/top3 での比較用） */
  compact?: boolean;
  /** 外側sectionの上下パディングをinline styleで上書き（px。内側 py-[64px] は不変） */
  paddingY?: number;
  /** 見出し下に表示するテキストリンク（未指定時は非表示。例: レッスン一覧へのリンク） */
  viewAllHref?: string;
  /** viewAllHref 指定時のリンク文言（デフォルト "レッスン一覧を見る"） */
  viewAllLabel?: string;
  className?: string;
}

export default function LessonHighlightSection({
  badgeLabel = "GUIDE CONTENTS",
  heading,
  rows,
  compact = false,
  paddingY,
  viewAllHref,
  viewAllLabel = "レッスン一覧を見る",
  className,
}: LessonHighlightSectionProps) {
  return (
    <section
      className={cn("border-b border-black/[0.12] pt-[24px] pb-[25px]", className)}
      style={
        paddingY !== undefined
          ? { paddingTop: paddingY, paddingBottom: paddingY }
          : undefined
      }
    >
      <div className="flex flex-col gap-16 py-[64px]">
        <div className="flex flex-col gap-2">
          <TopSectionHeading badgeLabel={badgeLabel} heading={heading} />
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="font-noto-sans-jp text-sm text-text-link underline-offset-4 hover:text-text-link-hover hover:underline"
            >
              {viewAllLabel} →
            </Link>
          )}
        </div>

        {rows.map((row) => (
          <div key={row.subheading} className="flex flex-col gap-12">
            {/* サブ見出し（20px） */}
            <h3 className="font-rounded-mplus text-[20px] font-medium leading-[1.4] tracking-[1.6px] text-text-primary">
              {row.subheading}
            </h3>

            {/* カード群: 既存 LessonCardRenderer をそのまま流用（PC 3枚横並び / gap 27px） */}
            <div className="flex overflow-x-auto scrollbar-hide gap-[27px] pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:pb-0 sm:overflow-visible">
              {row.lessons.map((lesson, i) => (
                <LessonCardRenderer
                  key={lesson._id}
                  lesson={{ ...lesson, index: i }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
