import Link from "next/link";
import Image from "next/image";

/**
 * あたらしいコンテンツ（新トップ 2026 / top2・top3 再構築版 / ブロックB-3）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 671-7338
 *
 * スタイル抽出チェックリスト（Figma実測値）:
 *
 * | 要素 | font-family | weight | size | line-height | 色 |
 * |---|---|---|---|---|---|
 * | 見出し | Noto Sans JP | Medium(500) | 22px（compact時20px） | 37.6px(=1.71) | #021710→text-text-primary |
 * | タグ | Hind | Medium(500) | 12px（compact時10px） | 24px(=2) | rgba(5,46,22,0.56)→text-text-primary/[0.56] |
 * | タイトル | Hind | Medium(500) | 16px（compact時14px） | 24px(=1.5) | #052e16→text-text-primary |
 *
 * 構造: 見出し → 2カラム×2行グリッド（gap-x/y 8px）。各項目はサムネイル(101x56, 角丸なし)
 * + タグ/タイトルの横並び（gap-[16px]、py-[16px]）。全体 border-b border-black/[0.12]、
 * py-[32px]、見出し→グリッド gap-[24px]。
 *
 * サムネイルは実データ（`getLatestMixedContent`）の thumbnail URL を使う。
 * 取得できない場合のみグレー背景プレースホルダーにフォールバックする。
 */

export interface NewContentItem {
  tag: string;
  title: string;
  href: string;
  /** サムネイル画像URL（無ければグレープレースホルダー） */
  thumbnail?: string;
}

export interface NewContentListProps {
  items: NewContentItem[];
  heading?: string;
  /** フォントサイズを2px落とした試験用バリアント（/dev/top3 での比較用） */
  compact?: boolean;
  className?: string;
}

export default function NewContentList({
  items,
  heading = "あたらしいコンテンツ",
  compact = false,
  className,
}: NewContentListProps) {
  return (
    <div
      className={`flex flex-col gap-6 border-b border-black/[0.12] py-8 ${className ?? ""}`}
    >
      <p
        className={`font-noto-sans-jp font-medium leading-[1.71] text-text-primary ${
          compact ? "text-xl" : "text-[22px]"
        }`}
      >
        {heading}
      </p>

      <div className="grid grid-cols-1 gap-x-2 gap-y-2 sm:grid-cols-2">
        {items.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="group flex items-center gap-4 py-4"
          >
            {/* サムネイル(101x56固定、Figma実測)。実画像があれば表示、無ければグレープレースホルダー */}
            <div className="relative h-[56px] w-[101px] shrink-0 overflow-hidden bg-muted-custom">
              {item.thumbnail && (
                <Image
                  src={item.thumbnail}
                  alt=""
                  fill
                  sizes="101px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex flex-col">
              <span
                className={`font-hind font-medium text-text-primary/[0.56] ${
                  compact ? "text-[10px]" : "text-xs"
                }`}
              >
                {item.tag}
              </span>
              <span
                className={`font-rounded-mplus font-medium text-text-primary group-hover:underline ${
                  compact ? "text-sm" : "text-base"
                }`}
              >
                {item.title}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
