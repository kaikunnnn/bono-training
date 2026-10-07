"use client";

/**
 * 参加者のコメント一覧への動線（#218 N2）。
 *
 * - EventParticipantsLink: アイコン列の下の小さな文字リンク
 *   - 会員:   「みんなのコメントを見る ↓」→ 本文のあとのコメント一覧へ
 *   - 非会員: 「メンバーはみんなのコメントが見られます ↓」→ 同じ位置の「メンバーだけが見られます」案内へ
 * - EventParticipantsMembersOnly: 非会員向けに、コメント一覧の位置へ置く案内（リンクの飛び先）
 *
 * 飛び先はどちらも id="participants"（PARTICIPANTS_ANCHOR_ID）。行き先の無いリンクは出さないこと
 * （呼び出し側で、飛び先を描画するときだけリンクを出す）。
 */

import { useId, type MouseEvent } from "react";
import { ArrowDown } from "lucide-react";
import {
  PARTICIPANTS_ANCHOR_ID,
  PARTICIPANTS_SCROLL_MARGIN,
} from "@/lib/events/onsite-registration";

/**
 * id の要素までスクロールし、中の [data-scroll-focus]（見出し）にフォーカスを移す。
 * 動きを減らす設定（prefers-reduced-motion: reduce）の人には、なめらかスクロールを使わず一瞬で移動する。
 * フォーカスは preventScroll で移す（スクロールの途中で位置が飛ばないように）。
 */
export function scrollToParticipants() {
  const el = document.getElementById(PARTICIPANTS_ANCHOR_ID);
  if (!el) return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  el.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
  const target = el.querySelector<HTMLElement>("[data-scroll-focus]") ?? el;
  target.focus({ preventScroll: true });
}

export function EventParticipantsLink({
  variant,
}: {
  /** member: コメント一覧へ / guest: 未ログイン・非会員向けの案内へ */
  variant: "member" | "guest";
}) {
  return (
    <a
      href={`#${PARTICIPANTS_ANCHOR_ID}`}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        // JS が無いときは href でそのまま飛ぶ。JS があればスクロール＋見出しへフォーカス
        e.preventDefault();
        scrollToParticipants();
      }}
      className="inline-flex items-center gap-1 rounded-[8px] text-sm text-text-muted underline-offset-4 hover:text-text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {variant === "member"
        ? "みんなのコメントを見る"
        : "メンバーはみんなのコメントが見られます"}
      <ArrowDown className="size-3.5" aria-hidden="true" />
    </a>
  );
}

/**
 * 非会員向け: コメント一覧の位置に置く「メンバーだけが見られます」の案内（文章のみ）。
 * ログイン・メンバー登録のボタンは、すぐ下の申込カードにあるので、ここには置かない
 * （行き先が同じボタンが2つ続かないようにするため。2026-10-07 ユーザー判断）。
 * 名前・コメントは非会員に渡さないので、ここには中身を一切出さない。
 */
export function EventParticipantsMembersOnly() {
  const headingId = useId();

  return (
    <section
      id={PARTICIPANTS_ANCHOR_ID}
      aria-labelledby={headingId}
      className={`flex w-full flex-col items-center gap-3 rounded-[24px] bg-muted-custom px-4 py-6 text-center ${PARTICIPANTS_SCROLL_MARGIN}`}
    >
      <h2
        id={headingId}
        tabIndex={-1}
        data-scroll-focus
        className="text-lg font-bold text-text-primary outline-none"
      >
        参加者のコメント
      </h2>
      <p className="text-balance text-sm text-text-muted">
        参加者のコメントは、BONOメンバーだけが見られます
      </p>
    </section>
  );
}
