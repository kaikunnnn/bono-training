
import { useState, useEffect } from 'react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { ContentItem, ContentFilter } from '@/types/content';
import { filterContents, getContentById } from '@/data/mockContent';
import { PlanType } from '@/utils/subscriptionPlans';

/**
 * ユーザーのプランタイプからアクセスレベルを取得する
 */
const getPlanAccessLevel = (planType: PlanType | null, isActive: boolean): string => {
  if (!isActive || !planType) return 'free';
  
  const planAccessMap: Record<PlanType, string> = {
    'standard': 'standard',
    'growth': 'growth',
    'community': 'community',
  };
  
  return planAccessMap[planType] || 'free';
};

/**
 * コンテンツの取得とフィルタリングを行うカスタムフック
 */
export const useContent = (filter?: ContentFilter) => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isSubscribed, loading: subscriptionLoading } = useSubscriptionContext();
  
  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        // サブスクリプション状態に基づいたフィルター条件
        const accessLevel = isSubscribed ? 'standard' : 'free';
        
        // フィルター条件でコンテンツを取得
        const filteredContents = filterContents({
          ...filter,
          accessLevel
        });
        
        setContents(filteredContents);
        setLoading(false);
      } catch (err) {
        console.error('コンテンツの取得中にエラーが発生しました:', err);
        setError(err instanceof Error ? err : new Error('コンテンツの取得に失敗しました'));
        setLoading(false);
      }
    };

    // サブスクリプション状態の読み込みが完了したらコンテンツを取得
    if (!subscriptionLoading) {
      fetchContents();
    }
  }, [filter, isSubscribed, subscriptionLoading]);
  
  /**
   * 個別のコンテンツを取得する関数
   */
  const getContent = (id: string): ContentItem | undefined => {
    return getContentById(id);
  };
  
  /**
   * コンテンツにアクセスできるかどうかを判定する
   */
  const canAccessContent = (contentId: string): boolean => {
    const content = getContentById(contentId);
    if (!content) return false;
    
    // サブスクリプションがない場合、無料コンテンツのみアクセス可能
    if (!isSubscribed) {
      return content.accessLevel === 'free';
    }
    
    // サブスクリプションがある場合は標準以下のアクセスレベルコンテンツにアクセス可能
    return ['free', 'standard'].includes(content.accessLevel);
  };
  
  return {
    contents,
    loading,
    error,
    getContent,
    canAccessContent
  };
};

/**
 * 個別のコンテンツを取得するカスタムフック
 */
export const useContentItem = (contentId: string) => {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isSubscribed } = useSubscriptionContext();
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // コンテンツを取得
        const foundContent = getContentById(contentId);
        
        if (!foundContent) {
          throw new Error('コンテンツが見つかりませんでした');
        }
        
        // アクセス権限をチェック
        const hasAccess = isSubscribed || foundContent.accessLevel === 'free';
        
        if (!hasAccess) {
          throw new Error('このコンテンツにアクセスする権限がありません');
        }
        
        setContent(foundContent);
        setLoading(false);
      } catch (err) {
        console.error('コンテンツの取得中にエラーが発生しました:', err);
        setError(err instanceof Error ? err : new Error('コンテンツの取得に失敗しました'));
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [contentId, isSubscribed]);
  
  return { content, loading, error };
};
