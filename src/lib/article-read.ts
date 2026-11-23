/**
 * 「記事を読んだ」の判定（#262 article_read）。純粋なロジックだけを置く（React・DOM・通信に依存しない）。
 *
 * 読んだ = 次の2つが両方そろったとき（どちらが先でもよい）。そのページ表示中に1回だけ true を返す。
 * - 本文（記事の中身の要素。フッター・サイドバーは含めない）の 70% まで画面の下端が届いた
 * - そのページを 30 秒以上見ている（タブが裏にある間の時間は数えない）
 *
 * 出典（rebono/issues/262 「採用した定石（出典）」）:
 * - スクロールの深さ: GA4 拡張計測の scroll（90% の深さが見えた最初の1回）
 * - 時間: Medium の read（30 秒以上ページにいたら read）
 * - タブが裏の時間を除く: Page Visibility API（visibilitychange / document.hidden）
 */

/** 本文のこの割合（%）まで届いたら「読み進めた」 */
export const ARTICLE_READ_PERCENT = 70;

/** このページを見ていた時間（秒）がこれ以上なら「読み進めた」 */
export const ARTICLE_READ_SECONDS = 30;

/**
 * 本文がどこまで画面に入ったか（0〜1）。画面の下端が本文の上から何割の位置にあるか。
 * - 本文が画面より短く全部見えている: 1
 * - 本文の上端がまだ画面の下より下: 0
 */
export function bodyDepthFraction(
  bodyTop: number,
  bodyHeight: number,
  viewportHeight: number
): number {
  if (
    !Number.isFinite(bodyTop) ||
    !Number.isFinite(bodyHeight) ||
    !Number.isFinite(viewportHeight) ||
    bodyHeight <= 0 ||
    viewportHeight <= 0
  ) {
    return 0;
  }
  const fraction = (viewportHeight - bodyTop) / bodyHeight;
  return Math.min(1, Math.max(0, fraction));
}

export interface ArticleReadResult {
  /** 届いた一番深い位置（%・整数） */
  percent: number;
  /** 見ていた時間（秒・整数。タブが裏の時間を除く） */
  seconds: number;
}

export interface ArticleReadTracker {
  /** スクロール位置から求めた深さ（0〜1）を渡す。一番深い値だけ覚える */
  depth(fraction: number): void;
  /** タブが裏（hidden）/ 表に変わったとき */
  visibility(hidden: boolean, nowMs: number): void;
  /** 今「読んだ」になったか。条件がそろった最初の1回だけ結果を返す（以降は null） */
  check(nowMs: number): ArticleReadResult | null;
  /** あと何ミリ秒見ていれば時間の条件を満たすか（タブが裏なら Infinity、満たしていれば 0） */
  remainingMs(nowMs: number): number;
  /** 深さの条件（70%）を満たしたか */
  readonly depthReached: boolean;
  /** すでに「読んだ」を返したか */
  readonly done: boolean;
}

export interface ArticleReadOptions {
  percent?: number;
  seconds?: number;
  /** ページを開いた時刻 */
  startMs: number;
  /** 開いた時点でタブが裏か */
  hidden?: boolean;
}

export function createArticleReadTracker(
  options: ArticleReadOptions
): ArticleReadTracker {
  const thresholdFraction = (options.percent ?? ARTICLE_READ_PERCENT) / 100;
  const thresholdMs = (options.seconds ?? ARTICLE_READ_SECONDS) * 1000;

  let maxFraction = 0;
  let accumulatedMs = 0;
  /** 表にいる区間の開始時刻（裏なら null） */
  let visibleSince: number | null = options.hidden ? null : options.startMs;
  let done = false;

  const visibleMs = (nowMs: number) =>
    accumulatedMs +
    (visibleSince === null ? 0 : Math.max(0, nowMs - visibleSince));

  return {
    depth(fraction) {
      if (!Number.isFinite(fraction)) return;
      if (fraction > maxFraction) maxFraction = Math.min(1, fraction);
    },

    visibility(hidden, nowMs) {
      if (hidden) {
        if (visibleSince !== null) {
          accumulatedMs += Math.max(0, nowMs - visibleSince);
          visibleSince = null;
        }
      } else if (visibleSince === null) {
        visibleSince = nowMs;
      }
    },

    check(nowMs) {
      if (done) return null;
      if (maxFraction < thresholdFraction) return null;
      const ms = visibleMs(nowMs);
      if (ms < thresholdMs) return null;
      done = true;
      return {
        percent: Math.floor(maxFraction * 100),
        seconds: Math.floor(ms / 1000),
      };
    },

    remainingMs(nowMs) {
      const rest = thresholdMs - visibleMs(nowMs);
      if (rest <= 0) return 0;
      return visibleSince === null ? Infinity : rest;
    },

    get depthReached() {
      return maxFraction >= thresholdFraction;
    },

    get done() {
      return done;
    },
  };
}
