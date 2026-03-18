/**
 * Memberstack Admin API ヘルパー
 *
 * Supabase → Memberstack 同期用
 * 注意: 有料プランはAPIで追加できないため、無料のプロキシプランを使用
 */

const MEMBERSTACK_API_URL = 'https://admin.memberstack.com';

// 環境変数から取得
const getApiKey = () => Deno.env.get('MEMBERSTACK_SECRET_KEY') || '';
const getPlanIdStandard = () => Deno.env.get('MEMBERSTACK_PLAN_ID_STANDARD') || '';
const getPlanIdFeedback = () => Deno.env.get('MEMBERSTACK_PLAN_ID_FEEDBACK') || '';

/**
 * Memberstack APIリクエストのヘッダー
 */
function getHeaders() {
  return {
    'X-API-KEY': getApiKey(),
    'Content-Type': 'application/json',
  };
}

/**
 * プランタイプからMemberstack Plan IDを取得
 */
export function getMemberstackPlanId(planType: string): string | null {
  switch (planType) {
    case 'standard':
      return getPlanIdStandard();
    case 'feedback':
      return getPlanIdFeedback();
    default:
      console.warn(`[Memberstack] 未知のプランタイプ: ${planType}`);
      return null;
  }
}

/**
 * メールアドレスからMemberstackメンバーを検索
 */
export async function findMemberByEmail(email: string): Promise<{ id: string; email: string } | null> {
  try {
    const response = await fetch(`${MEMBERSTACK_API_URL}/members?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`[Memberstack] メンバー検索エラー: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // members配列から最初のマッチを返す
    if (data.data && data.data.length > 0) {
      const member = data.data[0];
      return { id: member.id, email: member.auth.email };
    }

    return null;
  } catch (error) {
    console.error('[Memberstack] メンバー検索例外:', error);
    return null;
  }
}

/**
 * Memberstackにメンバーを作成
 */
export async function createMember(
  email: string,
  metadata?: { supabaseUserId?: string; stripeCustomerId?: string }
): Promise<{ id: string; email: string } | null> {
  try {
    // ランダムパスワードを生成（Memberstack APIはパスワード必須）
    const randomPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 20);

    const response = await fetch(`${MEMBERSTACK_API_URL}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        email,
        password: randomPassword, // Memberstack要件
        metaData: metadata || {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Memberstack] メンバー作成エラー: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    return { id: data.data.id, email: data.data.auth.email };
  } catch (error) {
    console.error('[Memberstack] メンバー作成例外:', error);
    return null;
  }
}

/**
 * メンバーにプランを追加（無料プランのみ可能）
 */
export async function addPlanToMember(memberId: string, planId: string): Promise<boolean> {
  try {
    const response = await fetch(`${MEMBERSTACK_API_URL}/members/${memberId}/add-plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ planId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Memberstack] プラン追加エラー: ${response.status} - ${errorText}`);
      return false;
    }

    console.log(`[Memberstack] プラン追加成功: member=${memberId}, plan=${planId}`);
    return true;
  } catch (error) {
    console.error('[Memberstack] プラン追加例外:', error);
    return false;
  }
}

/**
 * メンバーからプランを削除
 */
export async function removePlanFromMember(memberId: string, planId: string): Promise<boolean> {
  try {
    const response = await fetch(`${MEMBERSTACK_API_URL}/members/${memberId}/remove-plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ planId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Memberstack] プラン削除エラー: ${response.status} - ${errorText}`);
      return false;
    }

    console.log(`[Memberstack] プラン削除成功: member=${memberId}, plan=${planId}`);
    return true;
  } catch (error) {
    console.error('[Memberstack] プラン削除例外:', error);
    return false;
  }
}

/**
 * メンバーのメタデータを更新
 */
export async function updateMemberMetadata(
  memberId: string,
  metadata: Record<string, string>
): Promise<boolean> {
  try {
    const response = await fetch(`${MEMBERSTACK_API_URL}/members/${memberId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ metaData: metadata }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Memberstack] メタデータ更新エラー: ${response.status} - ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Memberstack] メタデータ更新例外:', error);
    return false;
  }
}

/**
 * Supabase → Memberstack 同期処理（メイン関数）
 *
 * 新規登録・プラン変更時に呼び出す
 */
export async function syncToMemberstack(
  email: string,
  planType: string,
  supabaseUserId: string,
  stripeCustomerId: string
): Promise<{ success: boolean; memberId?: string; error?: string }> {
  console.log(`[Memberstack] 同期開始: ${email} → ${planType}`);

  // APIキーのチェック
  if (!getApiKey()) {
    console.warn('[Memberstack] MEMBERSTACK_SECRET_KEY が設定されていません。同期をスキップします。');
    return { success: false, error: 'API key not configured' };
  }

  // プランIDを取得
  const planId = getMemberstackPlanId(planType);
  if (!planId) {
    console.warn(`[Memberstack] プランID未設定: ${planType}。同期をスキップします。`);
    return { success: false, error: `Plan ID not configured for ${planType}` };
  }

  try {
    // 1. 既存メンバーを検索
    let member = await findMemberByEmail(email);

    // 2. 存在しなければ作成
    if (!member) {
      console.log(`[Memberstack] メンバー作成: ${email}`);
      member = await createMember(email, {
        supabaseUserId,
        stripeCustomerId,
      });

      if (!member) {
        return { success: false, error: 'Failed to create member' };
      }
    }

    // 3. プランを追加
    const added = await addPlanToMember(member.id, planId);
    if (!added) {
      return { success: false, memberId: member.id, error: 'Failed to add plan' };
    }

    console.log(`[Memberstack] 同期完了: ${email} → ${planType} (member: ${member.id})`);
    return { success: true, memberId: member.id };

  } catch (error) {
    console.error('[Memberstack] 同期例外:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Memberstack からプランを削除（キャンセル時）
 */
export async function removePlanFromMemberstack(
  email: string,
  planType: string
): Promise<{ success: boolean; error?: string }> {
  console.log(`[Memberstack] プラン削除開始: ${email} → ${planType}`);

  // APIキーのチェック
  if (!getApiKey()) {
    console.warn('[Memberstack] MEMBERSTACK_SECRET_KEY が設定されていません。同期をスキップします。');
    return { success: false, error: 'API key not configured' };
  }

  // プランIDを取得
  const planId = getMemberstackPlanId(planType);
  if (!planId) {
    console.warn(`[Memberstack] プランID未設定: ${planType}。同期をスキップします。`);
    return { success: false, error: `Plan ID not configured for ${planType}` };
  }

  try {
    // メンバーを検索
    const member = await findMemberByEmail(email);
    if (!member) {
      console.warn(`[Memberstack] メンバーが見つかりません: ${email}`);
      return { success: false, error: 'Member not found' };
    }

    // プランを削除
    const removed = await removePlanFromMember(member.id, planId);
    if (!removed) {
      return { success: false, error: 'Failed to remove plan' };
    }

    console.log(`[Memberstack] プラン削除完了: ${email} (member: ${member.id})`);
    return { success: true };

  } catch (error) {
    console.error('[Memberstack] プラン削除例外:', error);
    return { success: false, error: error.message };
  }
}

/**
 * プラン変更時の同期（旧プラン削除 → 新プラン追加）
 */
export async function changePlanInMemberstack(
  email: string,
  oldPlanType: string,
  newPlanType: string
): Promise<{ success: boolean; error?: string }> {
  console.log(`[Memberstack] プラン変更: ${email} ${oldPlanType} → ${newPlanType}`);

  // APIキーのチェック
  if (!getApiKey()) {
    console.warn('[Memberstack] MEMBERSTACK_SECRET_KEY が設定されていません。同期をスキップします。');
    return { success: false, error: 'API key not configured' };
  }

  // 同じプランタイプなら何もしない
  if (oldPlanType === newPlanType) {
    console.log('[Memberstack] 同一プランタイプのため変更なし');
    return { success: true };
  }

  try {
    // メンバーを検索
    const member = await findMemberByEmail(email);
    if (!member) {
      console.warn(`[Memberstack] メンバーが見つかりません: ${email}`);
      return { success: false, error: 'Member not found' };
    }

    // 旧プランを削除
    const oldPlanId = getMemberstackPlanId(oldPlanType);
    if (oldPlanId) {
      await removePlanFromMember(member.id, oldPlanId);
    }

    // 新プランを追加
    const newPlanId = getMemberstackPlanId(newPlanType);
    if (newPlanId) {
      await addPlanToMember(member.id, newPlanId);
    }

    console.log(`[Memberstack] プラン変更完了: ${email} ${oldPlanType} → ${newPlanType}`);
    return { success: true };

  } catch (error) {
    console.error('[Memberstack] プラン変更例外:', error);
    return { success: false, error: error.message };
  }
}
