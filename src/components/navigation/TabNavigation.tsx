import React from 'react';
import styles from './TabNavigation.module.css';

export type TabId = 'all' | 'progress' | 'favorite' | 'history';

export interface Tab {
  id: TabId;
  label: string;
}

export interface TabNavigationProps {
  /** アクティブなタブのID */
  activeTab: TabId;
  /** タブ変更時のコールバック */
  onTabChange: (tabId: TabId) => void;
  /** カスタムクラス名 */
  className?: string;
}

const tabs: Tab[] = [
  { id: 'all', label: 'すべて' },
  { id: 'progress', label: '進捗' },
  { id: 'favorite', label: 'お気に入り' },
  { id: 'history', label: '閲覧履歴' },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
