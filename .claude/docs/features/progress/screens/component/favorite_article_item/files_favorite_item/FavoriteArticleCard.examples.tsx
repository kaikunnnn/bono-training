import React, { useState } from 'react';
import { FavoriteArticleCard } from './FavoriteArticleCard';
import { ArticleData, CATEGORY_COLORS } from './FavoriteArticleCard.types';

/**
 * 使用例集 - FavoriteArticleCard
 */

// ============================================================================
// 例1: 基本的な使い方
// ============================================================================
export function Example1_Basic() {
  return (
    <FavoriteArticleCard
      category="ビジュアル"
      title="送る視線①：ビジュアル"
      description="by「3種盛」ではじめるUIデザイン入門"
    />
  );
}

// ============================================================================
// 例2: お気に入り済みの記事
// ============================================================================
export function Example2_Favorited() {
  return (
    <FavoriteArticleCard
      category="コーディング"
      categoryColor={CATEGORY_COLORS.coding}
      title="React Hooks完全ガイド"
      description="by フロントエンド実践講座"
      isFavorite={true}
    />
  );
}

// ============================================================================
// 例3: クリック可能な記事カード
// ============================================================================
export function Example3_Clickable() {
  const handleClick = () => {
    console.log('記事をクリックしました');
    // 記事詳細ページへ遷移など
  };

  const handleFavoriteToggle = (isFavorite: boolean) => {
    console.log('お気に入り状態:', isFavorite);
  };

  return (
    <FavoriteArticleCard
      category="デザイン"
      categoryColor={CATEGORY_COLORS.design}
      title="カラー理論の基礎"
      description="by デザイン基礎シリーズ"
      onClick={handleClick}
      onFavoriteToggle={handleFavoriteToggle}
    />
  );
}

// ============================================================================
// 例4: 記事リスト表示
// ============================================================================
export function Example4_ArticleList() {
  const [articles, setArticles] = useState<ArticleData[]>([
    {
      id: '1',
      icon: 'CC',
      category: 'ビジュアル',
      categoryColor: CATEGORY_COLORS.visual,
      title: '送る視線①：ビジュアル',
      description: 'by「3種盛」ではじめるUIデザイン入門',
      isFavorite: false,
    },
    {
      id: '2',
      icon: 'UI',
      category: 'コーディング',
      categoryColor: CATEGORY_COLORS.coding,
      title: 'React Hooks完全ガイド',
      description: 'by フロントエンド実践講座',
      isFavorite: true,
    },
    {
      id: '3',
      icon: '🎨',
      category: 'デザイン',
      categoryColor: CATEGORY_COLORS.design,
      title: 'カラー理論の基礎',
      description: 'by デザイン基礎シリーズ',
      isFavorite: false,
    },
    {
      id: '4',
      icon: '📐',
      category: 'タイポグラフィ',
      categoryColor: CATEGORY_COLORS.typography,
      title: 'フォント選びの極意',
      description: 'by タイポグラフィ実践講座',
      isFavorite: true,
    },
  ]);

  const handleFavoriteToggle = (articleId: string, isFavorite: boolean) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId ? { ...article, isFavorite } : article
      )
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {articles.map((article) => (
        <FavoriteArticleCard
          key={article.id}
          icon={article.icon}
          category={article.category}
          categoryColor={article.categoryColor}
          title={article.title}
          description={article.description}
          isFavorite={article.isFavorite}
          onFavoriteToggle={(isFavorite) =>
            handleFavoriteToggle(article.id, isFavorite)
          }
          onClick={() => console.log('記事を開く:', article.id)}
        />
      ))}
    </div>
  );
}

// ============================================================================
// 例5: お気に入りのみフィルタリング
// ============================================================================
export function Example5_FavoriteFilter() {
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [articles, setArticles] = useState<ArticleData[]>([
    {
      id: '1',
      category: 'ビジュアル',
      title: '送る視線①：ビジュアル',
      description: 'by「3種盛」ではじめるUIデザイン入門',
      isFavorite: false,
    },
    {
      id: '2',
      category: 'コーディング',
      categoryColor: CATEGORY_COLORS.coding,
      title: 'React完全ガイド',
      description: 'by フロントエンド講座',
      isFavorite: true,
    },
    {
      id: '3',
      category: 'デザイン',
      categoryColor: CATEGORY_COLORS.design,
      title: 'カラー理論',
      description: 'by デザイン基礎',
      isFavorite: true,
    },
  ]);

  const filteredArticles = showOnlyFavorites
    ? articles.filter((a) => a.isFavorite)
    : articles;

  return (
    <div>
      {/* フィルターボタン */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}>
          {showOnlyFavorites ? '全て表示' : 'お気に入りのみ表示'}
        </button>
        <span style={{ marginLeft: '10px', color: '#666' }}>
          {filteredArticles.length}件の記事
        </span>
      </div>

      {/* 記事リスト */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredArticles.map((article) => (
          <FavoriteArticleCard key={article.id} {...article} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 例6: Supabaseとの連携
// ============================================================================
export function Example6_SupabaseIntegration() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);

  // Supabaseからデータ取得
  React.useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Supabaseクライアントの例
        // const { data, error } = await supabase
        //   .from('articles')
        //   .select('*')
        //   .order('created_at', { ascending: false });
        
        // if (error) throw error;
        
        // setArticles(data);
        setLoading(false);
      } catch (error) {
        console.error('記事の取得に失敗:', error);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const updateFavorite = async (articleId: string, isFavorite: boolean) => {
    try {
      // Supabaseでお気に入り状態を更新
      // await supabase
      //   .from('user_favorites')
      //   .upsert({
      //     article_id: articleId,
      //     user_id: currentUser.id,
      //     is_favorite: isFavorite,
      //     updated_at: new Date(),
      //   });

      // ローカルステートを更新
      setArticles((prev) =>
        prev.map((article) =>
          article.id === articleId ? { ...article, isFavorite } : article
        )
      );
    } catch (error) {
      console.error('お気に入りの更新に失敗:', error);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {articles.map((article) => (
        <FavoriteArticleCard
          key={article.id}
          {...article}
          onFavoriteToggle={(isFavorite) =>
            updateFavorite(article.id, isFavorite)
          }
        />
      ))}
    </div>
  );
}

// ============================================================================
// 例7: カテゴリ別グループ表示
// ============================================================================
export function Example7_GroupedByCategory() {
  const articles: ArticleData[] = [
    {
      id: '1',
      category: 'ビジュアル',
      categoryColor: CATEGORY_COLORS.visual,
      title: '送る視線①：ビジュアル',
      description: 'by「3種盛」ではじめるUIデザイン入門',
      isFavorite: false,
    },
    {
      id: '2',
      category: 'ビジュアル',
      categoryColor: CATEGORY_COLORS.visual,
      title: 'レイアウトの基本',
      description: 'by UIデザイン実践',
      isFavorite: true,
    },
    {
      id: '3',
      category: 'コーディング',
      categoryColor: CATEGORY_COLORS.coding,
      title: 'React Hooks',
      description: 'by フロントエンド講座',
      isFavorite: false,
    },
  ];

  // カテゴリごとにグループ化
  const groupedArticles = articles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, ArticleData[]>);

  return (
    <div>
      {Object.entries(groupedArticles).map(([category, categoryArticles]) => (
        <div key={category} style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>
            {category}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoryArticles.map((article) => (
              <FavoriteArticleCard key={article.id} {...article} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default {
  Example1_Basic,
  Example2_Favorited,
  Example3_Clickable,
  Example4_ArticleList,
  Example5_FavoriteFilter,
  Example6_SupabaseIntegration,
  Example7_GroupedByCategory,
};
