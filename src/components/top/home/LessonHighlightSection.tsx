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
  className?: string;
}

export default function LessonHighlightSection({
  badgeLabel = "GUIDE CONTENTS",
  heading,
  rows,
  compact = false,
  className,
}: LessonHighlightSectionProps) {
  return (
    <section
      className={cn("border-b border-black/[0.12] pt-[24px] pb-[25px]", className)}
    >
      <div className="flex flex-col gap-16 py-[64px]">
        <TopSectionHeading badgeLabel={badgeLabel} heading={heading} />

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
