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
        
        // サブスクリプション状態に関係なくすべてのコンテンツを取得
        const filteredContents = filterContents({
          ...filter,
          // accessLevelのフィルタリングを削除
        });
        
        setContents(filteredContents);
        setLoading(false);
      } catch (err) {
        console.error('コンテンツの取得中にエラーが発生しました:', err);
        setError(err instanceof Error ? err : new Error('コンテンツの取得に失敗しました'));
        setLoading(false);
      }
    };

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
  
  /**
   * コンテンツの可視状態を判定する
   * @param content コンテンツアイテム
   * @returns オブジェクト {canViewFree: 無料部分は表示可能か, canViewPremium: 有料部分は表示可能か}
   */
  const getContentVisibility = (content: ContentItem) => {
    // 無料コンテンツの場合は全ての人が全ての部分を閲覧可能
    if (content.accessLevel === 'free') {
      return { canViewFree: true, canViewPremium: true };
    }
    
    // 無料部分は誰でも閲覧可能
    const canViewFree = true;
    
    // 有料部分はサブスクリプションを持っている人のみ閲覧可能
    const canViewPremium = isSubscribed;
    
    return { canViewFree, canViewPremium };
  };
  
  return {
    contents,
    loading,
    error,
    getContent,
    canAccessContent,
    getContentVisibility
  };
};

/**
 * 個別のコンテントを取得するカスタムフック
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
  
  /**
   * コンテンツの可視状態を判定する
   * @returns オブジェクト {canViewFree: 無料部分は表示可能か, canViewPremium: 有料部分は表示可能か}
   */
  const getContentVisibility = () => {
    if (!content) {
      return { canViewFree: false, canViewPremium: false };
    }
    
    // 無料コンテンツの場合は全ての人が全ての部分を閲覧可能
    if (content.accessLevel === 'free') {
      return { canViewFree: true, canViewPremium: true };
    }
    
    // 無料部分は誰でも閲覧可能
    const canViewFree = true;
    
    // 有料部分はサブスクリプションを持っている人のみ閲覧可能
    const canViewPremium = isSubscribed;
    
    return { canViewFree, canViewPremium };
  };
  
  return { 
    content, 
    loading, 
    error,
    getContentVisibility 
  };
};
