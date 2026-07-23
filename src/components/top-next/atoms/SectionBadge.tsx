/**
 * セクション見出し上の小ピルラベル（新トップページ Figma Make HANDOFF由来）
 *
 * 既存の TopSectionHeading（top2）内蔵バッジと役割が近いが、こちらは見出しと分離した
 * 単体Atomとして提供する（新トップページの再構築で見出しレイアウトが変わるため）。
 */
export interface SectionBadgeProps {
  children: string;
  /** ダーク背景用に白枠・白文字へ反転（デフォルト false） */
  dark?: boolean;
}

export function SectionBadge({ children, dark = false }: SectionBadgeProps) {
  return (
    <div className="relative inline-block self-start rounded-[40px]">
      <div
        className={`absolute inset-0 rounded-[40px] border ${
          dark ? "border-white/20" : "border-text-primary"
        }`}
      />
      <div className="flex items-center justify-center px-3 py-2">
        <p
          className={`whitespace-nowrap font-rounded-mplus text-xs font-normal leading-none tracking-[1.6px] ${
            dark ? "text-text-inverse" : "text-text-primary"
          }`}
        >
          {children}
        </p>
      </div>
    </div>
  );
}
