
import React from 'react';
import { Link } from 'react-router-dom';
import ContentCard from './ContentCard';
import { ContentItem } from '@/types/content';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

interface ContentListProps {
  contents: ContentItem[];
  loading?: boolean;
  error?: Error | null;
}

/**
 * コンテンツリストコンポーネント
 * 複数のコンテンツカードをグリッドで表示する
 */
const ContentList: React.FC<ContentListProps> = ({ 
  contents, 
  loading = false, 
  error = null 
}) => {
  const { isSubscribed } = useSubscriptionContext();
  
  // ローディング状態の表示
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-video rounded-t-lg bg-muted"></div>
            <div className="space-y-2 p-4">
              <div className="h-4 rounded bg-muted"></div>
              <div className="h-4 w-3/4 rounded bg-muted"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // エラー状態の表示
  if (error) {
    return (
      <div className="rounded-lg border border-destructive p-6 text-center">
        <p className="text-destructive">エラーが発生しました: {error.message}</p>
      </div>
    );
  }
  
  // コンテンツが空の場合の表示
  if (contents.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="text-muted-foreground">コンテンツが見つかりませんでした</p>
      </div>
    );
  }
  
  /**
   * 各コンテンツへのアクセス権限をチェック
   */
  const canAccessContent = (content: ContentItem): boolean => {
    if (content.accessLevel === 'free') return true;
    if (!isSubscribed) return false;
    
    // ここで将来的にはプランタイプによる詳細なアクセス制御を実装
    // 現在はサブスクリプションがあれば標準コンテンツまでアクセス可能とする
    return content.accessLevel === 'standard';
  };
  
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {contents.map((content) => {
        const isAccessible = canAccessContent(content);
        
        return (
          <Link 
            key={content.id}
            to={`/content/${content.id}`}
            className="transition-transform hover:scale-[1.02]"
          >
            <ContentCard content={content} isAccessible={isAccessible} />
          </Link>
        );
      })}
    </div>
  );
};

export default ContentList;
