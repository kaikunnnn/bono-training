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
 * SPAページビューを送信
 */
export const trackPageView = (path: string, title?: string) => {
  if (typeof window.gtag !== 'function') return;

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
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, params);
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
export const trackSignUp = (method?: string) => {
  trackEvent('sign_up', {
    method: method || 'email',
  });
};

/**
 * 有料プラン開始
 */
export const trackSubscriptionStart = (planName: string, planPrice: number) => {
  trackEvent('subscription_start', {
    plan_name: planName,
    plan_price: planPrice,
  });
};
