"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { ME, ME_ID } from "../_data";
import { hasMyPost, initialState, reducer } from "../_state";
import { CompletionModal } from "./CompletionModal";
import { FeedPostCard } from "./FeedPostCard";
import { FirstTimersBox } from "./FirstTimersBox";
import { GuidePanel } from "./GuidePanel";
import { InitialAvatar } from "./InitialAvatar";
import { LiveNowStrip } from "./LiveNowStrip";
import { MockBell } from "./MockBell";
import { PatternSwitcher } from "./PatternSwitcher";
import { StartLearningDialog } from "./StartLearningDialog";

/** 自分が始めてから「がんばろ」が届くまで */
const INCOMING_CHEER_DELAY_MS = 4000;
/** 通知から戻ったときの強調表示の長さ */
const HIGHLIGHT_MS = 3500;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** 進捗フィードのプロト本体（状態はすべてここに持つ。保存しない） */
export function ProgressFeedPrototype() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [startOpen, setStartOpen] = useState(false);
  const feedRef = useRef<HTMLElement>(null);
  const postRefs = useRef(new Map<string, HTMLElement>());

  // 始めて少しすると誰かから「がんばろ」が届く
  useEffect(() => {
    if (!state.myContentId || state.receivedCheerFrom) return;
    const t = setTimeout(() => dispatch({ type: "receiveCheer" }), INCOMING_CHEER_DELAY_MS);
    return () => clearTimeout(t);
  }, [state.myContentId, state.receivedCheerFrom]);

  // 通知から戻ったら、その投稿までスクロールして一時的に強調する
  useEffect(() => {
    const id = state.highlightPostId;
    if (!id) return;
    const el = postRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
      el.focus({ preventScroll: true });
    }
    const t = setTimeout(() => dispatch({ type: "clearHighlight" }), HIGHLIGHT_MS);
    return () => clearTimeout(t);
  }, [state.highlightPostId]);

  const scrollToFeed = useCallback(() => {
    feedRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const myPostExists = hasMyPost(state);
  const progress = {
    hasStarted: state.hasStarted,
    isLearning: state.myContentId !== null,
    receivedCheer: state.receivedCheerFrom !== null,
    hasMyPost: myPostExists,
    skippedPost: state.skippedPost,
    cheeredOthers: state.posts.some((p) => p.authorId !== ME_ID && p.cheeredBy.includes(ME_ID)),
    reactionsDelivered: state.reactionsDelivered,
    hasReturned: state.hasReturned,
  };

  return (
    <div className="flex flex-col gap-6">
      <PatternSwitcher value={state.pattern} onChange={(pattern) => dispatch({ type: "setPattern", pattern })} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* 体験ガイド: PCでは右側に固定、狭い幅では上に出す */}
        <aside className="order-first lg:order-last">
          <div className="lg:sticky lg:top-6">
            <GuidePanel
              step={state.step}
              progress={progress}
              onStep={(step) => dispatch({ type: "setStep", step })}
              onOpenStart={() => setStartOpen(true)}
              onReceiveCheerNow={() => dispatch({ type: "receiveCheer" })}
              onFinish={() => dispatch({ type: "finish" })}
              onDeliverReactions={() => dispatch({ type: "deliverReactions" })}
              onScrollToFeed={scrollToFeed}
              onReset={() => {
                setStartOpen(false);
                dispatch({ type: "reset" });
              }}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          {/* ヘッダー相当の帯（本物のヘッダー右上のベルの位置を再現） */}
          <div className="flex items-center justify-between gap-3 rounded-[16px] border border-[var(--card-border-subtle)] bg-surface px-4 py-2.5">
            <p className="text-sm font-bold text-text-primary">
              進捗フィード
              <span className="ml-2 text-xs font-normal text-text-muted">パターンA（自動で流れる型）</span>
            </p>
            <div className="flex items-center gap-2">
              <MockBell
                notifications={state.notifications}
                onOpenNotification={(notificationId) => dispatch({ type: "openNotification", notificationId })}
                onMarkAllRead={() => dispatch({ type: "markAllRead" })}
              />
              <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                <InitialAvatar person={ME} size="sm" />
                <span className="hidden sm:inline">あなた（BONO 2週目）</span>
              </span>
            </div>
          </div>

          <LiveNowStrip
            live={state.live}
            sentCheerTo={state.sentCheerTo}
            myContentId={state.myContentId}
            receivedCheerFrom={state.receivedCheerFrom}
            onSendCheer={(learnerId) => dispatch({ type: "sendCheer", learnerId })}
            onOpenStart={() => setStartOpen(true)}
            onFinish={() => dispatch({ type: "finish" })}
          />

          <FirstTimersBox
            posts={state.posts}
            onToggleStamp={(postId) => dispatch({ type: "toggleStamp", postId })}
          />

          <section ref={feedRef} aria-labelledby="feed-heading" className="scroll-mt-6">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="feed-heading" className="font-heading text-lg font-bold text-text-primary">
                みんなの進捗
              </h2>
              <p className="text-xs text-text-muted">節目を迎えたときだけ、自動で流れます</p>
            </div>
            <ul className="flex flex-col gap-3">
              {state.posts.map((post) => (
                <li key={post.id}>
                  <FeedPostCard
                    ref={(el) => {
                      if (el) postRefs.current.set(post.id, el);
                      else postRefs.current.delete(post.id);
                    }}
                    post={post}
                    highlighted={state.highlightPostId === post.id}
                    onToggleStamp={() => dispatch({ type: "toggleStamp", postId: post.id })}
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <StartLearningDialog
        open={startOpen}
        onOpenChange={setStartOpen}
        onStart={(contentId) => dispatch({ type: "start", contentId })}
      />
      <CompletionModal
        contentId={state.completionContentId}
        onPublish={() => dispatch({ type: "publish" })}
        onSkip={() => dispatch({ type: "skipPublish" })}
      />
    </div>
  );
}
