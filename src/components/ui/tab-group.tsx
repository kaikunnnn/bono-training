import React from "react";

export interface TabItem {
  id: string;
  label: string;
}

export interface TabGroupProps {
  /** タブ一覧 */
  tabs: TabItem[];
  /** アクティブなタブID */
  activeTabId: string;
  /** タブ変更時のコールバック */
  onTabChange: (tabId: string) => void;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * タブグループコンポーネント
 * Figma仕様に基づく pill スタイルのタブ
 */
export function TabGroup({
  tabs,
  activeTabId,
  onTabChange,
  className = "",
}: TabGroupProps) {
  return (
    <div
      className={`p-[3px] bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-black/5 inline-flex items-center gap-2 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeTabId}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-2 py-1.5 rounded-md
            flex justify-center items-center
            text-xs font-bold leading-3
            transition-all
            ${
              tab.id === activeTabId
                ? "bg-white text-black shadow-[0px_2px_2px_0px_rgba(0,0,0,0.04)]"
                : "text-black/50 hover:text-black/70"
            }
          `}
          style={{ fontFamily: "'Rounded Mplus 1c', sans-serif" }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default TabGroup;
