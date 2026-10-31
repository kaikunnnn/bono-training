"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  bodyDepthFraction,
  createArticleReadTracker,
} from "@/lib/article-read";
import {
  trackArticleReadEvent,
  type ArticleReadTracking,
} from "@/lib/activity-client";

interface ArticleReadTrackerProps {
  tracking: ArticleReadTracking;
  className?: string;
  children: ReactNode;
}

/**
 * 記事本文を包み、「記事を読んだ」（#262 article_read）を1ページ表示につき1回送る。
 *
 * - 本文 = この要素（PortableText の中身だけ。完了ボタン・前後ナビ・フッターは含めない）
 * - 深さ: passive な scroll / resize を requestAnimationFrame で間引き、この要素1つの位置だけ読む。
 *   70% に届いたらスクロールの監視をやめる
 * - 時間: タブが表にある時間だけ数える（visibilitychange）。残り時間ぶんの setTimeout を1本だけ置く
 * - 見た目は呼び出し側の div と同じ（className をそのまま付ける）ので、レイアウトは変わらない
 */
export function ArticleReadTracker({
  tracking,
  className,
  children,
}: ArticleReadTrackerProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const { articleId, lessonId, title, slug } = tracking;

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || typeof window === "undefined") return;

    const tracker = createArticleReadTracker({
      startMs: performance.now(),
      hidden: document.visibilityState === "hidden",
    });
    let rafId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let scrollWatching = false;

    const clearTimer = () => {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    };

    const stopScroll = () => {
      if (!scrollWatching) return;
      scrollWatching = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const evaluate = () => {
      if (tracker.done) return;
      const now = performance.now();
      const result = tracker.check(now);
      if (result) {
        cleanup();
        trackArticleReadEvent({ articleId, lessonId, title, slug }, result);
        return;
      }
      // 深さは届いて時間待ちだけ残っているなら、残りぶんのタイマーを1本置く
      // （深さが未達ならスクロールで再判定するのでタイマーは置かない。タブが裏でも置かない）
      clearTimer();
      if (!tracker.depthReached) return;
      const rest = tracker.remainingMs(now);
      if (Number.isFinite(rest)) {
        timerId = setTimeout(evaluate, Math.max(0, rest) + 50);
      }
    };

    const measure = () => {
      rafId = null;
      const rect = body.getBoundingClientRect();
      tracker.depth(
        bodyDepthFraction(rect.top, rect.height, window.innerHeight)
      );
      if (tracker.depthReached) stopScroll();
      evaluate();
    };

    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(measure);
    }

    const onVisibility = () => {
      tracker.visibility(document.visibilityState === "hidden", performance.now());
      evaluate();
    };

    function cleanup() {
      stopScroll();
      clearTimer();
      document.removeEventListener("visibilitychange", onVisibility);
    }

    scrollWatching = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    // 本文が短く最初から見えている記事もあるので、開いた時点でも1回測る
    onScroll();

    return cleanup;
  }, [articleId, lessonId, title, slug]);

  return (
    <div ref={bodyRef} className={className}>
      {children}
    </div>
  );
}
