// Google Analytics 4 utility functions
// 測定ID: G-MH9NGKFBCM

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

const GA_MEASUREMENT_ID = 'G-MH9NGKFBCM';

/**
 * 開発環境かどうかを判定
 * localhost または 127.0.0.1 の場合は開発環境とみなす
 */
const isDevelopment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

/**
 * GAが有効かどうかを判定
 * 開発環境では無効化される
 */
const isGAEnabled = (): boolean => {
  return !isDevelopment() && typeof window.gtag === 'function';
};

/**
 * SPAページビューを送信
 */
export const trackPageView = (path: string, title?: string) => {
  if (!isGAEnabled()) {
    if (isDevelopment()) {
      console.log('[GA] Page View (dev):', path, title);
    }
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  });
};

/**
 * カスタムイベントを送信
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (!isGAEnabled()) {
    if (isDevelopment()) {
      console.log('[GA] Event (dev):', eventName, params);
    }
    return;
  }

  window.gtag('event', eventName, params);
};

// ===== ユーザー属性設定 =====

/**
 * ログインユーザーのIDをGA4に設定（クロスデバイス分析用）
 */
export const setUserId = (userId: string) => {
  if (!isGAEnabled()) {
    if (isDevelopment()) {
      console.log('[GA] Set User ID (dev):', userId);
    }
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    user_id: userId,
  });
};

/**
 * ユーザープロパティを設定（サブスク状態など）
 */
export const setUserProperties = (properties: Record<string, string | number | boolean>) => {
  if (!isGAEnabled()) {
    if (isDevelopment()) {
      console.log('[GA] Set User Properties (dev):', properties);
    }
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    user_properties: properties,
  });
};

// ===== 定義済みイベント =====

/**
 * 動画再生開始
 */
export const trackVideoPlay = (articleId: string, articleTitle: string) => {
  trackEvent('video_play', {
    article_id: articleId,
    article_title: articleTitle,
  });
};

/**
 * 動画再生完了
 */
export const trackVideoComplete = (articleId: string, articleTitle: string) => {
  trackEvent('video_complete', {
    article_id: articleId,
    article_title: articleTitle,
  });
};

/**
 * 記事完了ボタン押下
 */
export const trackArticleComplete = (articleId: string, articleTitle: string) => {
  trackEvent('article_complete', {
    article_id: articleId,
    article_title: articleTitle,
  });
};

/**
 * 会員登録完了
 */
export const trackSignUp = (method?: string, referrer?: string) => {
  trackEvent('sign_up', {
    method: method || 'email',
    referrer: referrer,
  });
};

/**
 * ログイン
 */
export const trackLogin = (method?: string) => {
  trackEvent('login', {
    method: method || 'email',
  });
};

// ===== サブスクリプション・Eコマースイベント =====

/**
 * 有料プラン開始（後方互換）
 */
export const trackSubscriptionStart = (planName: string, planPrice: number) => {
  trackEvent('subscription_start', {
    plan_name: planName,
    plan_price: planPrice,
  });
};

/**
 * プランページ表示
 */
export const trackViewPlans = (referrer?: string) => {
  trackEvent('view_plans', {
    referrer: referrer,
  });
};

/**
 * プラン選択（カードクリック）
 */
export const trackSelectPlan = (planType: string, price: number, duration: number) => {
  trackEvent('select_plan', {
    plan_type: planType,
    price: price,
    duration: duration,
  });
};

/**
 * チェックアウト開始（購入ボタンクリック）
 * GA4推奨Eコマースイベント: begin_checkout
 */
export const trackBeginCheckout = (planType: string, price: number, duration: number) => {
  trackEvent('begin_checkout', {
    currency: 'JPY',
    value: price,
    items: [{
      item_id: `${planType}_${duration}m`,
      item_name: `${planType} - ${duration}ヶ月`,
      item_category: 'subscription',
      price: price,
      quantity: 1,
    }],
  });
};

/**
 * 購入完了
 * GA4推奨Eコマースイベント: purchase
 * → GA4のMonetizationレポートが自動生成される
 */
export const trackPurchase = (params: {
  planType: string;
  price: number;
  duration: number;
  transactionId?: string;
}) => {
  trackEvent('purchase', {
    transaction_id: params.transactionId || `sub_${Date.now()}`,
    currency: 'JPY',
    value: params.price,
    items: [{
      item_id: `${params.planType}_${params.duration}m`,
      item_name: `${params.planType} - ${params.duration}ヶ月`,
      item_category: 'subscription',
      price: params.price,
      quantity: 1,
    }],
  });
};

/**
 * プラン変更完了
 */
export const trackPlanChange = (params: {
  fromPlan: string;
  fromDuration: number;
  toPlan: string;
  toDuration: number;
}) => {
  trackEvent('plan_change', {
    from_plan: params.fromPlan,
    from_duration: params.fromDuration,
    to_plan: params.toPlan,
    to_duration: params.toDuration,
  });
};

// ===== コンテンツエンゲージメントイベント =====

/**
 * レッスン詳細ページ表示
 */
export const trackLessonView = (lessonId: string, title: string, category?: string, isPremium?: boolean) => {
  trackEvent('lesson_view', {
    lesson_id: lessonId,
    lesson_title: title,
    category: category,
    is_premium: isPremium,
  });
};

/**
 * レッスン完了（全記事完了時）
 */
export const trackLessonComplete = (lessonId: string, title: string) => {
  trackEvent('lesson_complete', {
    lesson_id: lessonId,
    lesson_title: title,
  });
};

/**
 * 検索実行
 */
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

/**
 * コンテンツブックマーク
 */
export const trackBookmark = (contentId: string, contentType: string, title?: string) => {
  trackEvent('content_bookmarked', {
    content_id: contentId,
    content_type: contentType,
    content_title: title,
  });
};

/**
 * ロードマップ表示
 */
export const trackRoadmapView = (roadmapId: string, title: string) => {
  trackEvent('roadmap_view', {
    roadmap_id: roadmapId,
    roadmap_title: title,
  });
};
