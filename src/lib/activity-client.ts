/**
 * 活動ログ（#213 A1）のクライアント側ヘルパー。Client Component からのみ使う。
 *
 * - logActivity: Server Action を fire-and-forget で呼ぶ（await しない・失敗しても無視）
 * - Supabase の auth cookie が無い（=確実に未ログイン）ときは Server Action を呼ばない
 *   （匿名の閲覧ごとに無駄な POST を飛ばさないため。最終判定はサーバー側）
 * - trackPricingCtaClick: 料金ページへの CTA クリックを GA4 と活動ログの両方に送る
 *   （未ログインは活動ログが no-op になるため GA4 側で数える）
 * - trackHomeClick: /top・マイページで押したもの（#232）を GA4 と活動ログの両方に送る
 * - trackArticleVideo*: 記事の動画の再生・進捗・完了（#262）を GA4 と活動ログの両方に送る
 * - trackArticleReadEvent: 記事を読んだ（#262 article_read）を GA4 と活動ログの両方に送る
 */
import { recordActivity } from "@/lib/services/activity";
import {
  trackArticleRead,
  trackEvent,
  trackVideoComplete,
  trackVideoPlay,
  trackVideoProgress,
} from "@/lib/analytics";
import {
  buildHomeClickParams,
  isPricingCtaSourceGroup,
  type HomeClickTracking,
  type PricingCtaSourceGroup,
  type RecordActivityInput,
} from "@/lib/activity-utils";
import { ARTICLE_READ_PERCENT } from "@/lib/article-read";

/** @supabase/ssr の auth cookie（sb-<ref>-auth-token / 分割時は .0 .1 ...）があるか */
export function hasSupabaseAuthCookie(): boolean {
  try {
    return /(?:^|;\s*)sb-[^=;]+-auth-token/.test(document.cookie);
  } catch {
    // 読めない環境では判定をサーバーに任せる
    return true;
  }
}

export function logActivity(input: RecordActivityInput): void {
  if (typeof window === "undefined") return;
  if (!hasSupabaseAuthCookie()) return;
  try {
    recordActivity({
      path: window.location.pathname,
      ...input,
    }).catch(() => {
      // Server Action 側でログ済み。体験は止めない
    });
  } catch {
    // 同上
  }
}

export function trackPricingCtaClick(group: PricingCtaSourceGroup): void {
  const sourceGroup: PricingCtaSourceGroup = isPricingCtaSourceGroup(group)
    ? group
    : "other";
  try {
    trackEvent("pricing_cta_click", { source_group: sourceGroup });
  } catch {
    // GA 失敗で遷移を止めない
  }
  logActivity({
    eventType: "pricing_cta_click",
    meta: { source_group: sourceGroup },
  });
}

export function trackSuccessNextClick(destination: string): void {
  logActivity({
    eventType: "success_next_click",
    meta: { destination },
  });
}

/**
 * Slack コミュニティ参加（招待リンク）クリック。
 * 招待URL自体はトークンを含むため meta には入れず、置き場所のラベルだけ残す。
 */
export function trackCommunityJoinClick(placement: string): void {
  logActivity({
    eventType: "community_join_click",
    meta: { placement },
  });
}

/**
 * /top・マイページで押したもの（#232 home_click）。
 * GA4 には surface / section / item_type / position / content_id だけを送る（user_id・個人情報は送らない）。
 * 活動ログには同じ値を meta に入れ、記事・レッスンの ID があれば article_id / lesson_id 列にも入れる。
 */
export function trackHomeClick(tracking: HomeClickTracking): void {
  let built: ReturnType<typeof buildHomeClickParams>;
  try {
    built = buildHomeClickParams(tracking);
  } catch {
    return;
  }
  try {
    trackEvent("home_click", built.params);
  } catch {
    // GA 失敗で遷移を止めない
  }
  logActivity({
    eventType: "home_click",
    articleId: built.articleId,
    lessonId: built.lessonId,
    meta: built.params,
  });
}

// ===== 記事の動画（#262 video_play / video_progress / video_complete） =====

/** どの記事の動画か。Server Component から props で渡すのでプレーンな値だけで持つ */
export interface ArticleVideoTracking {
  articleId: string;
  lessonId?: string | null;
  /** GA4 の article_title 用（活動ログには入れない） */
  title: string;
}

function videoActivityIds(tracking: ArticleVideoTracking) {
  return {
    articleId: tracking.articleId,
    lessonId: tracking.lessonId || undefined,
  };
}

/** 最初の再生。呼び出し側（プレーヤー）でページ内1回に絞ってから呼ぶ */
export function trackArticleVideoPlay(tracking: ArticleVideoTracking): void {
  try {
    trackVideoPlay(tracking.articleId, tracking.title);
  } catch {
    // GA 失敗で再生を止めない
  }
  logActivity({ eventType: "video_play", ...videoActivityIds(tracking) });
}

/** 25 / 50 / 75% 到達（各1回） */
export function trackArticleVideoProgress(
  tracking: ArticleVideoTracking,
  percent: number
): void {
  try {
    trackVideoProgress(tracking.articleId, tracking.title, percent);
  } catch {
    // 同上
  }
  logActivity({
    eventType: "video_progress",
    ...videoActivityIds(tracking),
    meta: { percent },
  });
}

/** 90% 以上 or 最後まで再生（1回） */
export function trackArticleVideoComplete(tracking: ArticleVideoTracking): void {
  try {
    trackVideoComplete(tracking.articleId, tracking.title);
  } catch {
    // 同上
  }
  logActivity({ eventType: "video_complete", ...videoActivityIds(tracking) });
}

// ===== 記事を読んだ（#262 article_read） =====

/** どの記事を読んだか。Server Component から props で渡すのでプレーンな値だけで持つ */
export interface ArticleReadTracking {
  articleId: string;
  lessonId?: string | null;
  /** GA4 の article_title 用（活動ログには入れない） */
  title: string;
  slug: string;
}

/**
 * 本文の70%まで届いた＋そのページに30秒以上。呼び出し側（ArticleReadTracker）で1ページ表示につき1回に絞ってから呼ぶ。
 * meta.percent は判定のしきい値（70）、meta.seconds は実際に見ていた秒数、meta.max_percent は届いた一番深い位置
 */
export function trackArticleReadEvent(
  tracking: ArticleReadTracking,
  result: { percent: number; seconds: number }
): void {
  try {
    trackArticleRead({
      articleId: tracking.articleId,
      articleTitle: tracking.title,
      lessonId: tracking.lessonId || undefined,
      percent: ARTICLE_READ_PERCENT,
      seconds: result.seconds,
    });
  } catch {
    // GA 失敗で読書を止めない
  }
  logActivity({
    eventType: "article_read",
    articleId: tracking.articleId,
    lessonId: tracking.lessonId || undefined,
    meta: {
      slug: tracking.slug,
      percent: ARTICLE_READ_PERCENT,
      max_percent: result.percent,
      seconds: result.seconds,
    },
  });
}
