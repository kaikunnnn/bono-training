
import { useState, useEffect } from 'react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { ContentItem, ContentFilter } from '@/types/content';
import { filterContents, getContentById as getMockContentById } from '@/data/mockContent';
import { getContentById as getContentByIdFromApi } from '@/services/content';
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
  const { isSubscribed, loading: subscriptionLoading, planType } = useSubscriptionContext();
  
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
  }, [filter, isSubscribed, subscriptionLoading, planType]);
  
  /**
   * 個別のコンテンツを取得する関数
   */
  const getContent = (id: string): ContentItem | undefined => {
    return getMockContentById(id);
  };
  
  /**
   * コンテンツにアクセスできるかどうかを判定する
   */
  const canAccessContent = (contentId: string): boolean => {
    const content = getMockContentById(contentId);
    if (!content) return false;
    
    // サブスクリプションがない場合、無料コンテンツのみアクセス可能
    if (!isSubscribed) {
      return content.accessLevel === 'free';
    }
    
    // プランタイプに基づいてアクセス権限を判定
    if (planType === 'community') {
      // コミュニティプランは全てのコンテンツにアクセス可能
      return true;
    } else if (planType === 'growth') {
      // グロースプランはコミュニティ限定以外のコンテンツにアクセス可能
      return content.accessLevel !== 'community';
    } else if (planType === 'standard') {
      // スタンダードプランは標準以下のアクセスレベルコンテンツにアクセス可能
      return ['free', 'standard'].includes(content.accessLevel);
    }
    
    // デフォルトでは無料コンテンツのみアクセス可能
    return content.accessLevel === 'free';
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
    // さらにプランタイプに基づいて判定
    let canViewPremium = false;
    
    if (isSubscribed && planType) {
      if (planType === 'community') {
        // コミュニティプランは全てのコンテンツにアクセス可能
        canViewPremium = true;
      } else if (planType === 'growth') {
        // グロースプランはコミュニティ限定以外のコンテンツにアクセス可能
        canViewPremium = content.accessLevel !== 'community';
      } else if (planType === 'standard') {
        // スタンダードプランは標準以下のアクセスレベルコンテンツにアクセス可能
        canViewPremium = ['free', 'standard'].includes(content.accessLevel);
      }
    }
    
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
 * 個別のコンテントを取得するカスタムフック（API版）
 */
export const useContentItem = (contentId: string) => {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const { isSubscribed, planType } = useSubscriptionContext();
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // API経由でコンテンツを取得
        const { content: fetchedContent, error: fetchError, isFreePreview: fetchedIsFreePreview } = await getContentByIdFromApi(contentId);
        
        if (fetchError) {
          throw fetchError;
        }
        
        if (!fetchedContent) {
          throw new Error('コンテンツが見つかりませんでした');
        }
        
        setContent(fetchedContent);
        setIsFreePreview(fetchedIsFreePreview || false);
        setLoading(false);
      } catch (err) {
        console.error('コンテンツの取得中にエラーが発生しました:', err);
        setError(err instanceof Error ? err : new Error('コンテンツの取得に失敗しました'));
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [contentId, isSubscribed, planType]);
  
  /**
   * コンテンツの可視状態を判定する
   * @returns オブジェクト {canViewFree: 無料部分は表示可能か, canViewPremium: 有料部分は表示可能か}
   */
  const getContentVisibility = () => {
    if (!content) {
      return { canViewFree: false, canViewPremium: false };
    }
    
    // API経由で取得したコンテンツの場合、isFreePreviewフラグで判定
    if (isFreePreview) {
      return { canViewFree: true, canViewPremium: false };
    }
    
    // 無料コンテンツの場合は全ての人が全ての部分を閲覧可能
    if (content.accessLevel === 'free') {
      return { canViewFree: true, canViewPremium: true };
    }
    
    // 無料部分は誰でも閲覧可能
    const canViewFree = true;
    
    // 有料部分はサブスクリプションを持っている人のみ閲覧可能
    // さらにプランタイプに基づいて判定
    let canViewPremium = false;
    
    if (isSubscribed && planType) {
      if (planType === 'community') {
        // コミュニティプランは全てのコンテンツにアクセス可能
        canViewPremium = true;
      } else if (planType === 'growth') {
        // グロースプランはコミュニティ限定以外のコンテンツにアクセス可能
        canViewPremium = content.accessLevel !== 'community';
      } else if (planType === 'standard') {
        // スタンダードプランは標準以下のアクセスレベルコンテンツにアクセス可能
        canViewPremium = ['free', 'standard'].includes(content.accessLevel);
      }
    }
    
    return { canViewFree, canViewPremium };
  };
  
  return { 
    content, 
    loading, 
    error,
    isFreePreview,
    getContentVisibility 
  };
};
