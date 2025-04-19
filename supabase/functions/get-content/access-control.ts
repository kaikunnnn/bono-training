
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// プラン制御のマッピング
const CONTENT_PERMISSIONS = {
  learning: ['standard', 'growth', 'community'],
  member: ['growth', 'community'],
  free: ['free', 'standard', 'growth', 'community'], // 無料コンテンツは全てのプランで閲覧可能
};

// アクセスレベルとコンテンツタイプのマッピング
const ACCESS_LEVEL_MAPPING = {
  'free': 'free',
  'standard': 'learning',
  'growth': 'learning',
  'community': 'member',
};

/**
 * ユーザープラン情報の取得（本番環境では DB から取得）
 */
export async function getUserPlanInfo(supabase: SupabaseClient, userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('plan_type, is_active')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('サブスクリプション情報取得エラー:', error);
      return { planType: null, isActive: false };
    }

    if (!data) {
      console.log('該当ユーザーのサブスクリプションデータなし:', { userId });
      return { planType: null, isActive: false };
    }

    console.log('取得したサブスクリプション情報:', data);
    return {
      planType: data.plan_type,
      isActive: data.is_active,
    };
  } catch (err) {
    console.error('ユーザープラン情報取得エラー:', err);
    return { planType: null, isActive: false };
  }
}

/**
 * コンテンツへのアクセス権限があるかチェック
 */
export function hasAccessToContent(userPlan: { planType: string | null, isActive: boolean }, contentAccessLevel: string) {
  console.log('アクセス権限チェック:', { userPlan, contentAccessLevel });
  
  // サブスクリプションがアクティブでない場合、無料コンテンツのみアクセス可能
  if (!userPlan.isActive || !userPlan.planType) {
    const hasAccess = contentAccessLevel === 'free';
    console.log(`非アクティブサブスクリプション: ${hasAccess ? 'アクセス可' : 'アクセス不可'}`);
    return hasAccess;
  }

  // アクセスレベルをコンテンツタイプに変換
  const contentType = ACCESS_LEVEL_MAPPING[contentAccessLevel] || 'free';
  console.log('コンテンツタイプマッピング:', { contentAccessLevel, contentType });
  
  // コンテンツタイプに対応するプラン一覧を取得
  const allowedPlans = CONTENT_PERMISSIONS[contentType] || [];
  console.log('許可プラン一覧:', { contentType, allowedPlans });
  
  // ユーザーのプランがアクセス可能かチェック
  const hasAccess = allowedPlans.includes(userPlan.planType);
  console.log(`アクセス判定結果: ${hasAccess ? 'アクセス可' : 'アクセス不可'}`);
  return hasAccess;
}
