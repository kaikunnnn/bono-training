"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ME_ID, type FeedPost } from "../_data";
import { FeedPostCard } from "../_components/FeedPostCard";
import { useProto } from "./ProtoProvider";

/** 通知から戻ったときの強調表示の長さ */
const HIGHLIGHT_MS = 3500;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * プレビュー用に3件選ぶ。
 * 「今週はじめた人」の投稿（はじめての完了）が3件に1つも無ければ、3件目をそれに入れ替える
 * （始めたばかりの人に応援が集まるように）。
 */
export function pickPreviewPosts(posts: FeedPost[]): FeedPost[] {
  const top = posts.slice(0, 3);
  const hasNewcomer = top.some((p) => p.authorId !== ME_ID && p.milestone === "first");
  if (hasNewcomer) return top;
  const newcomer = posts.find((p) => p.authorId !== ME_ID && p.milestone === "first");
  return newcomer ? [...top.slice(0, 2), newcomer] : top;
}

export function FeedPostList({ posts, highlightId }: { posts: FeedPost[]; highlightId?: string | null }) {
  const { dispatch } = useProto();
  return (
    <ul className="flex w-full flex-col gap-3">
      {posts.map((post) => (
        <li key={post.id}>
          <FeedPostCard
            post={post}
            highlighted={highlightId === post.id}
            onToggleStamp={() => dispatch({ type: "toggleStamp", postId: post.id })}
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * 全件フィード。`#post-<id>` 付きで来たら、その投稿までスクロールして少しのあいだ強調する。
 * 自分の投稿は sessionStorage にしか無いので、読み込みが終わってから探す。
 */
export function FeedFullList() {
  const { state, hydrated, highlightRequest } = useProto();
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const highlight = useCallback((postId: string) => {
    // 描画が終わってから要素を探す
    requestAnimationFrame(() => {
      const el = document.getElementById(`post-${postId}`);
      if (!el) return;
      el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
      el.focus({ preventScroll: true });
      setHighlightId(postId);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setHighlightId(null), HIGHLIGHT_MS);
    });
  }, []);

  // URLのハッシュ（通知・「みんなの進捗を見る」から来たとき）
  useEffect(() => {
    if (!hydrated) return;
    const hash = window.location.hash;
    if (hash.startsWith("#post-")) highlight(decodeURIComponent(hash.slice("#post-".length)));
  }, [hydrated, highlight]);

  // すでにこのタブを開いているときに通知を押した場合
  useEffect(() => {
    if (hydrated && highlightRequest) highlight(highlightRequest.postId);
  }, [hydrated, highlightRequest, highlight]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return <FeedPostList posts={state.posts} highlightId={highlightId} />;
}
