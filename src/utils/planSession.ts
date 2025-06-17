
/**
 * プラン選択セッション管理ユーティリティ
 * プラン情報をsessionStorageとcookieにバックアップして24時間保持する
 */

import { PlanType } from '@/utils/subscriptionPlans';

export interface PlanSessionData {
  planType: PlanType;
  duration: 1 | 3;
  price: string;
  selectedAt: number; // timestamp
}

const SESSION_KEY = 'bono_training_plan_selection';
const COOKIE_KEY = 'bono_plan_session';
const EXPIRY_HOURS = 24;

/**
 * Base64エンコード（セキュリティではなく、データ保護のため）
 */
const encodeData = (data: PlanSessionData): string => {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('プランセッション情報のエンコードに失敗:', error);
    return '';
  }
};

/**
 * Base64デコード
 */
const decodeData = (encodedData: string): PlanSessionData | null => {
  try {
    const decoded = atob(encodedData);
    return JSON.parse(decoded) as PlanSessionData;
  } catch (error) {
    console.error('プランセッション情報のデコードに失敗:', error);
    return null;
  }
};

/**
 * 有効期限チェック
 */
const isExpired = (selectedAt: number): boolean => {
  const now = Date.now();
  const expiryTime = selectedAt + (EXPIRY_HOURS * 60 * 60 * 1000);
  return now > expiryTime;
};

/**
 * Cookieにデータを保存
 */
const saveToCookie = (encodedData: string): void => {
  try {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + EXPIRY_HOURS);
    document.cookie = `${COOKIE_KEY}=${encodedData}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error('Cookieへの保存に失敗:', error);
  }
};

/**
 * Cookieからデータを取得
 */
const getFromCookie = (): string | null => {
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === COOKIE_KEY) {
        return value || null;
      }
    }
    return null;
  } catch (error) {
    console.error('Cookieからの取得に失敗:', error);
    return null;
  }
};

/**
 * Cookieを削除
 */
const clearCookie = (): void => {
  try {
    document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } catch (error) {
    console.error('Cookieの削除に失敗:', error);
  }
};

/**
 * プラン選択情報を保存
 */
export const savePlanSession = (planData: Omit<PlanSessionData, 'selectedAt'>): boolean => {
  try {
    const sessionData: PlanSessionData = {
      ...planData,
      selectedAt: Date.now()
    };

    const encodedData = encodeData(sessionData);
    if (!encodedData) {
      return false;
    }

    // sessionStorageに保存
    sessionStorage.setItem(SESSION_KEY, encodedData);
    
    // cookieにバックアップ保存
    saveToCookie(encodedData);

    console.log('プランセッション情報を保存しました:', sessionData);
    return true;
  } catch (error) {
    console.error('プランセッション情報の保存に失敗:', error);
    return false;
  }
};

/**
 * プラン選択情報を取得
 */
export const getPlanSession = (): PlanSessionData | null => {
  try {
    // まずsessionStorageから取得を試行
    let encodedData = sessionStorage.getItem(SESSION_KEY);
    
    // sessionStorageになければcookieから取得
    if (!encodedData) {
      encodedData = getFromCookie();
      if (encodedData) {
        // cookieから復元できた場合はsessionStorageにも保存
        sessionStorage.setItem(SESSION_KEY, encodedData);
      }
    }

    if (!encodedData) {
      return null;
    }

    const sessionData = decodeData(encodedData);
    if (!sessionData) {
      clearPlanSession();
      return null;
    }

    // 有効期限チェック
    if (isExpired(sessionData.selectedAt)) {
      console.log('プランセッション情報が期限切れです');
      clearPlanSession();
      return null;
    }

    console.log('プランセッション情報を取得しました:', sessionData);
    return sessionData;
  } catch (error) {
    console.error('プランセッション情報の取得に失敗:', error);
    clearPlanSession();
    return null;
  }
};

/**
 * プラン選択情報をクリア
 */
export const clearPlanSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    clearCookie();
    console.log('プランセッション情報をクリアしました');
  } catch (error) {
    console.error('プランセッション情報のクリアに失敗:', error);
  }
};

/**
 * プラン選択情報が存在するかチェック
 */
export const hasPlanSession = (): boolean => {
  return getPlanSession() !== null;
};

/**
 * デバッグ用：現在のセッション状態を表示
 */
export const debugPlanSession = (): void => {
  const sessionData = getPlanSession();
  if (sessionData) {
    console.log('現在のプランセッション:', {
      ...sessionData,
      expiresAt: new Date(sessionData.selectedAt + (EXPIRY_HOURS * 60 * 60 * 1000)).toLocaleString(),
      remainingTime: Math.max(0, (sessionData.selectedAt + (EXPIRY_HOURS * 60 * 60 * 1000)) - Date.now())
    });
  } else {
    console.log('プランセッション情報は存在しません');
  }
};
