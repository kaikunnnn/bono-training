import DarkGuideItem, {
  type DarkGuideItemProps,
} from "@/components/top2/DarkGuideItem";
import TopSectionHeading from "@/components/top2/TopSectionHeading";

/**
 * デザインとキャリアを考える セクション（top2・top3 再構築版 / ブロックD）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-39684
 *
 * bg-[#050423]（紺）、白系テキスト。バッジ「GUIDE CONTENTS」+見出し(32px, Regular,
 * white)。カード4枚を2x2グリッドで表示（PC）。モバイルは1カラムで3枚のみ表示
 * （4枚目は `hidden sm:block` で非表示）。
 *
 * レイアウト上の注意: 左は Sidebar があるため境界があるが、右はPCで画面端まで
 * 背景を伸ばしたい。そのため、この section 自体は `.container` の**外側**（page.tsx側で
 * `.container` の外に置くこと）に配置して背景を親要素（`main`）いっぱいに広げ、
 * 中身（バッジ・見出し・カード）だけ内部の `.container` で他ブロックと同じ最大幅・
 * 左右パディングに揃える。
 * `paddingY`（number）を渡すと外側section（フルブリード背景側）の上下パディングを
 * inline styleで上書きする（ページ単位の余白統一実験用 / 例: /dev/top4）。未指定時は既存挙動のまま。
 */

export interface DesignCareerSection2Props {
  badgeLabel?: string;
  heading?: string;
  /** カード4枚（PC: 2x2グリッド／モバイル: 先頭3枚のみ表示） */
  items: DarkGuideItemProps[];
  /** フォントサイズを2px落とした試験用バリアント（/dev/top3 での比較用） */
  compact?: boolean;
  /** 外側sectionの上下パディングをinline styleで上書き（px。ページ単位の余白統一実験用） */
  paddingY?: number;
  className?: string;
}

export default function DesignCareerSection2({
  badgeLabel = "GUIDE CONTENTS",
  heading = "デザインとキャリアを考える",
  items,
  compact = false,
  paddingY,
  className,
}: DesignCareerSection2Props) {
  return (
    <section
      className={`border-t border-white/10 bg-dark-section pt-16 pb-16 ${className ?? ""}`}
      style={
        paddingY !== undefined
          ? { paddingTop: paddingY, paddingBottom: paddingY }
          : undefined
      }
    >
      {/* 中身だけ他ブロックと同じ最大幅・左右パディングに揃える（section自体はcontainerの外） */}
      <div className="container">
        <TopSectionHeading badgeLabel={badgeLabel} heading={heading} inverse />

        <div className="grid grid-cols-1 gap-6 pt-16 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-12">
          {items.map((item, i) => (
            <div key={i} className={i === 3 ? "hidden sm:block" : undefined}>
              <DarkGuideItem size="default" compact={compact} {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
