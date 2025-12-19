import React, { useState } from 'react';
import { ProgressLesson } from '@/components/ProgressLesson';
import { ArticleCard } from '@/components/ArticleCard';
import { FavoriteArticleCard } from '@/components/FavoriteArticleCard';

type TabId = 'all' | 'progress' | 'favorite' | 'history';

interface Tab {
  id: TabId;
  label: string;
}

/**
 * マイページコンポーネント
 * 
 * @component
 */
export const MyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('all');

  const tabs: Tab[] = [
    { id: 'all', label: 'すべて' },
    { id: 'progress', label: '進捗' },
    { id: 'favorite', label: 'お気に入り' },
    { id: 'history', label: '閲覧履歴' },
  ];

  const handleViewAll = (tab: TabId) => {
    setActiveTab(tab);
  };

  return (
    <div style={{
      backgroundColor: '#F8F9FA',
      minHeight: '100vh',
      padding: '40px',
    }}>
      {/* コンテンツラッパー */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '32px',
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1A1A1A',
            margin: 0,
          }}>
            マイページ
          </h1>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1976D2',
              backgroundColor: 'transparent',
              border: '1px solid #1976D2',
              borderRadius: '6px',
              cursor: 'pointer',
            }}>
              ⚙️ アカウント情報
            </button>
            <button style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1976D2',
              backgroundColor: 'transparent',
              border: '1px solid #1976D2',
              borderRadius: '6px',
              cursor: 'pointer',
            }}>
              👤 プロフィール
            </button>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div style={{
          borderBottom: '1px solid #E5E5E5',
          marginBottom: '40px',
        }}>
          <div style={{
            display: 'flex',
            gap: '32px',
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: activeTab === tab.id ? '#1A1A1A' : '#999999',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #1A1A1A' : '2px solid transparent',
                  paddingBottom: '16px',
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* コンテンツエリア */}
        <div>
          {/* すべて表示 または 進行中タブ */}
          {(activeTab === 'all' || activeTab === 'progress') && (
            <ProgressSection onViewAll={() => handleViewAll('progress')} />
          )}

          {/* すべて表示 または お気に入りタブ */}
          {(activeTab === 'all' || activeTab === 'favorite') && (
            <FavoriteSection onViewAll={() => handleViewAll('favorite')} />
          )}

          {/* すべて表示 または 閲覧履歴タブ */}
          {(activeTab === 'all' || activeTab === 'history') && (
            <HistorySection onViewAll={() => handleViewAll('history')} />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 進行中セクション
 */
const ProgressSection: React.FC<{ onViewAll: () => void }> = ({ onViewAll }) => {
  // サンプルデータ
  const lessons = [
    {
      title: 'センスを盗む技術',
      progress: 25,
      currentStep: '送る視線①:ビジュアル',
      isStepCompleted: false,
    },
    {
      title: 'センスを盗む技術',
      progress: 25,
      currentStep: '送る視線①:ビジュアル',
      isStepCompleted: false,
    },
  ];

  return (
    <section style={{ marginBottom: '56px' }}>
      {/* 見出し行 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1A1A1A',
          margin: 0,
        }}>
          進行中
        </h2>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onViewAll();
          }}
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976D2',
            textDecoration: 'none',
          }}
        >
          すべてみる
        </a>
      </div>

      {/* サブ見出し */}
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#666666',
        marginBottom: '16px',
      }}>
        レッスン
      </h3>

      {/* 2列グリッド */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
      }}
      className="progress-grid"
      >
        {lessons.map((lesson, index) => (
          <ProgressLesson key={index} {...lesson} />
        ))}
      </div>
    </section>
  );
};

/**
 * お気に入りセクション
 */
const FavoriteSection: React.FC<{ onViewAll: () => void }> = ({ onViewAll }) => {
  const favorites = [
    {
      category: 'ビジュアル',
      title: '送る視線①：ビジュアル',
      description: 'by「3種盛」ではじめるUIデザイン入門',
      isFavorite: true,
    },
    {
      category: 'ビジュアル',
      title: '送る視線①：ビジュアル',
      description: 'by「3種盛」ではじめるUIデザイン入門',
      isFavorite: true,
    },
    {
      category: 'ビジュアル',
      title: '送る視線①：ビジュアル',
      description: 'by「3種盛」ではじめるUIデザイン入門',
      isFavorite: true,
    },
    {
      category: 'ビジュアル',
      title: '送る視線①：ビジュアル',
      description: 'by「3種盛」ではじめるUIデザイン入門',
      isFavorite: true,
    },
  ];

  return (
    <section style={{ marginBottom: '56px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1A1A1A',
          margin: 0,
        }}>
          お気に入り
        </h2>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onViewAll();
          }}
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976D2',
            textDecoration: 'none',
          }}
        >
          すべてみる
        </a>
      </div>

      {/* 縦並び */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {favorites.map((article, index) => (
          <FavoriteArticleCard key={index} {...article} />
        ))}
      </div>
    </section>
  );
};

/**
 * 閲覧履歴セクション
 */
const HistorySection: React.FC<{ onViewAll: () => void }> = ({ onViewAll }) => {
  const history = [
    {
      category: 'ビジュアル',
      title: '送る視線①：ビジュアル',
      description: 'by「3種盛」ではじめるUIデザイン入門',
    },
    {
      category: 'ビジュアル',
      title: '送る視線①：ビジュアル',
      description: 'by「3種盛」ではじめるUIデザイン入門',
    },
  ];

  return (
    <section style={{ marginBottom: '56px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1A1A1A',
          margin: 0,
        }}>
          閲覧履歴
        </h2>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onViewAll();
          }}
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976D2',
            textDecoration: 'none',
          }}
        >
          すべてみる
        </a>
      </div>

      {/* 縦並び */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {history.map((article, index) => (
          <ArticleCard key={index} {...article} />
        ))}
      </div>
    </section>
  );
};

export default MyPage;
