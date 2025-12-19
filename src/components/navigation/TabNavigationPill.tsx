import React, { useState } from 'react';
import styles from './TabNavigationPill.module.css';

export type TabPillId = 'all' | 'progress' | 'favorite' | 'history';

export interface TabPill {
  id: TabPillId;
  label: string;
}

export interface TabNavigationPillProps {
  /** アクティブなタブID */
  activeTab?: TabPillId;
  /** タブ変更時のコールバック */
  onTabChange?: (tabId: TabPillId) => void;
  /** カスタムクラス名 */
  className?: string;
}

const TABS: TabPill[] = [
  { id: 'all', label: 'すべて' },
  { id: 'progress', label: '進捗' },
  { id: 'favorite', label: 'お気に入り' },
  { id: 'history', label: '閲覧履歴' },
];

/**
 * タブナビゲーション（Pill/Chipスタイル）
 *
 * Figma MCP取得の正確な仕様に基づく実装
 * - コンテナ: #F2F2F2 背景、padding 3px、gap 8px、border-radius 8px
 * - アクティブタブ: 白背景、影あり
 * - 非アクティブタブ: 透明背景、テキスト半透明
 */
export const TabNavigationPill: React.FC<TabNavigationPillProps> = ({
  activeTab: controlledActiveTab,
  onTabChange,
  className = '',
}) => {
  // 内部状態（制御されていない場合に使用）
  const [internalActiveTab, setInternalActiveTab] = useState<TabPillId>('all');

  // 制御されたコンポーネントかどうか
  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

  // タブクリック処理
  const handleTabClick = (tabId: TabPillId) => {
    if (!isControlled) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  return (
    <div
      className={`${styles.container} ${className}`}
      role="tablist"
      aria-label="ナビゲーションタブ"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => {
              // 矢印キーでのナビゲーション
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                const currentIndex = TABS.findIndex(t => t.id === activeTab);
                const nextIndex = (currentIndex + 1) % TABS.length;
                handleTabClick(TABS[nextIndex].id);
              }
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const currentIndex = TABS.findIndex(t => t.id === activeTab);
                const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
                handleTabClick(TABS[prevIndex].id);
              }
            }}
          >
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigationPill;
