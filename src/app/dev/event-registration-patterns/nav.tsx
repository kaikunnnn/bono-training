"use client";

/**
 * 「0. 決定：P3＋ラベルA と、コメント一覧への動線」の見本（手元の state だけで動く）。
 *
 * 申込済みは P3（「✓ 参加中（自分のアイコン）⋯」の1行）、アイコン列はラベルA に決定。
 * そのうえで、本文のあと（ページのずっと下）にある参加者のコメント一覧への動線を比べる。
 *
 * - コメント一覧は有料会員にだけ見せる。ゲスト（未ログイン・非会員）には、行き先の無いリンクは出さない
 *   （N2 だけ、ゲストに「メンバーはみんなのコメントが見られます」を出す案を見せる）
 * - スクロールは prefers-reduced-motion を守り、着いたら一覧の見出しにフォーカスを移す
 */

import { useState, type MouseEvent, type ReactNode } from "react";
import { ArrowDown, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditableParticipantList from "./EditableParticipantList";
import {
  AvatarStack,
  CardShell,
  P3Compact,
  UnregisteredCard,
  stripLabel,
  type MoreMenuItem,
} from "./parts";
import {
  ME,
  MY_COMMENT,
  OTHERS,
  VIEWER_ID,
  myParticipant,
  sortNewestFirst,
  stripAvatars,
} from "./mock";

/** 一覧（会員）／案内（ゲスト）の置き場所の id。本番では `#participants` を想定 */
export const LIST_ID = "participants";

export type NavPattern = "n1" | "n2" | "n3" | "n4";
type ViewerState = "guest" | "member" | "registered";

// ---------------------------------------------------------------------------
// スクロール＋フォーカス
// ---------------------------------------------------------------------------

/**
 * id の要素までスクロールし、中の [data-scroll-focus]（見出し）にフォーカスを移す。
 * 動きを減らす設定の人には、なめらかスクロールを使わず一瞬で移動する。
 */
export function scrollToAnchor(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  const target = el.querySelector<HTMLElement>("[data-scroll-focus]") ?? el;
  target.focus({ preventScroll: true });
}

/** ページ内リンク。JS が無くても href で飛べる。JS があればスクロール＋フォーカス */
function AnchorLink({
  className,
  children,
  ariaLabel,
}: {
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <a
      href={`#${LIST_ID}`}
      aria-label={ariaLabel}
      className={className}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        scrollToAnchor(LIST_ID);
      }}
    >
      {children}
    </a>
  );
}

// ---------------------------------------------------------------------------
// 動線のパーツ
// ---------------------------------------------------------------------------

const linkText =
  "inline-flex items-center gap-1 rounded-[8px] text-sm text-text-muted underline-offset-4 hover:text-text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** ラベルAのアイコン列（リンクにしない版） */
function PlainStrip({ count, avatarUrls }: { count: number; avatarUrls: (string | null)[] }) {
  return (
    <div role="group" aria-label={`${count}人が参加中`} className="flex items-center gap-2">
      <AvatarStack avatarUrls={avatarUrls} />
      <span className="whitespace-nowrap text-sm text-text-muted" aria-hidden="true">
        {stripLabel(count)}
      </span>
    </div>
  );
}

/** N1: アイコン列そのものがリンク（ホバーで薄い背景＋下線、右に ⌄） */
function LinkedStrip({ count, avatarUrls }: { count: number; avatarUrls: (string | null)[] }) {
  return (
    <AnchorLink
      ariaLabel={`${count}人が参加中。参加者のコメントを見る`}
      className="group -mx-2 inline-flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <AvatarStack avatarUrls={avatarUrls} />
      <span className="whitespace-nowrap text-sm text-text-muted underline-offset-4 group-hover:text-text-secondary group-hover:underline">
        {stripLabel(count)}
      </span>
      <ChevronDown className="size-4 text-text-muted group-hover:text-text-secondary" aria-hidden="true" />
    </AnchorLink>
  );
}

/** N2: アイコン列の下の小さな文字リンク */
function CommentsTextLink() {
  return (
    <AnchorLink className={linkText}>
      みんなのコメントを見る
      <ArrowDown className="size-3.5" aria-hidden="true" />
    </AnchorLink>
  );
}

/** N2（ゲスト向けの1案）: 会員だけが見られることを伝え、下の案内へ */
function GuestTeaserLink() {
  return (
    <AnchorLink className={linkText}>
      メンバーはみんなのコメントが見られます
      <ArrowDown className="size-3.5" aria-hidden="true" />
    </AnchorLink>
  );
}

/** N4（追加提案）: 最新コメント1件のプレビュー行（会員だけ。名前とコメントは会員向けの情報なので） */
function LatestCommentPreview({ name, avatarUrl, comment }: { name: string; avatarUrl: string | null; comment: string }) {
  return (
    <AnchorLink
      ariaLabel={`最新のコメント ${name}さん：${comment}。参加者のコメントを見る`}
      className="group flex w-full max-w-[343px] min-w-0 items-center gap-2 rounded-full border border-border-default bg-surface py-1.5 pl-1.5 pr-3 text-left transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar className="size-6 shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
        <AvatarFallback className="text-[11px]">{name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1 truncate text-sm text-text-secondary">
        <span className="font-medium text-text-primary">{name}</span>：{comment}
      </span>
      <ChevronRight className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
    </AnchorLink>
  );
}

/** 未ログイン向けの申込カード（本番の GuestCard の見た目。ボタンは何もしない） */
function GuestCard() {
  return (
    <CardShell band="参加はこちら">
      <div className="flex flex-col items-center gap-1 pt-1 text-center">
        <p className="text-balance text-base font-bold text-text-primary">
          このイベントはBONOメンバー限定です
        </p>
        <p className="text-sm text-text-muted">参加するにはログインしてください</p>
      </div>
      <Button type="button" size="large" className="w-full">
        ログインして参加する
      </Button>
    </CardShell>
  );
}

// ---------------------------------------------------------------------------
// 上部（アイコン列＋動線＋カード/P3）
// ---------------------------------------------------------------------------

function TopArea({
  pattern,
  viewer,
  onRegister,
  onCancel,
}: {
  pattern: NavPattern;
  viewer: ViewerState;
  onRegister: () => void;
  onCancel: () => void;
}) {
  const others = OTHERS.length;
  const registered = viewer === "registered";
  const count = others + (registered ? 1 : 0);
  const avatarUrls = registered ? [ME.avatarUrl, ...stripAvatars(others)] : stripAvatars(others);
  const isMember = viewer !== "guest";

  // アイコン列
  const strip =
    pattern === "n1" && isMember ? (
      <LinkedStrip count={count} avatarUrls={avatarUrls} />
    ) : (
      <PlainStrip count={count} avatarUrls={avatarUrls} />
    );

  // アイコン列の下の動線
  let nav: ReactNode = null;
  if (!isMember) {
    nav = pattern === "n2" ? <GuestTeaserLink /> : null;
  } else if (pattern === "n2") {
    nav = <CommentsTextLink />;
  } else if (pattern === "n3" && !registered) {
    nav = <CommentsTextLink />;
  } else if (pattern === "n4") {
    // 自分のコメントは上部に出さない（決定事項）ので、申込済みでも「ほかの人の最新」を出す
    const latest = OTHERS[0];
    nav = (
      <LatestCommentPreview
        name={latest.name}
        avatarUrl={latest.avatarUrl}
        comment={latest.comment}
      />
    );
  }

  const menuItems: MoreMenuItem[] =
    pattern === "n3"
      ? [
          {
            label: "コメントを見る",
            keepFocus: true,
            // メニューが閉じてからスクロールする（閉じる処理と競合させない）
            onSelect: () => requestAnimationFrame(() => scrollToAnchor(LIST_ID)),
          },
        ]
      : [];

  let card: ReactNode;
  if (!isMember) card = <GuestCard />;
  else if (!registered) card = <UnregisteredCard onRegister={onRegister} />;
  else card = <P3Compact closed={false} onCancel={onCancel} extraMenuItems={menuItems} />;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex w-full flex-col items-center gap-2">
        {strip}
        {nav}
      </div>
      <div className={cn("flex w-full justify-center", !registered && "mt-5")}>{card}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 一覧の置き場所（会員: コメント一覧 / ゲスト: 会員だけが見られる案内）
// ---------------------------------------------------------------------------

function ListTarget({ viewer }: { viewer: ViewerState }) {
  const [comment, setComment] = useState(MY_COMMENT);
  if (viewer === "guest") {
    return (
      <section id={LIST_ID} aria-labelledby={`${LIST_ID}-h`} className="flex scroll-mt-24 flex-col items-center gap-3 rounded-2xl bg-muted-custom px-4 py-6 text-center">
        <h2 id={`${LIST_ID}-h`} tabIndex={-1} data-scroll-focus className="text-base font-bold text-text-primary outline-none">
          参加者のコメントはメンバーだけが見られます
        </h2>
        <p className="text-sm text-text-muted">
          （ゲストに案内リンクを出す N2 の飛び先。本番ではここに下部の申込カードが来る想定）
        </p>
        <Button type="button" size="large">
          ログインして参加する
        </Button>
      </section>
    );
  }
  const participants = sortNewestFirst(
    viewer === "registered"
      ? [...OTHERS, myParticipant(comment, "2026-10-09T00:00:00.000Z")]
      : OTHERS,
  );
  return (
    <EditableParticipantList
      id={LIST_ID}
      participants={participants}
      viewerId={VIEWER_ID}
      onChangeComment={setComment}
    />
  );
}

// ---------------------------------------------------------------------------
// セクション全体
// ---------------------------------------------------------------------------

const PATTERNS: { id: NavPattern; title: string; extra?: boolean; recommended?: boolean; note: string }[] = [
  {
    id: "n1",
    title: "N1 アイコン列そのものをリンクにする",
    note: "アイコン＋「N人が参加中」＋ ⌄ 全体が押せる。ホバーで薄い背景と下線。要素が増えずすっきりするが、押せることに気づきにくい（特にスマホはホバーが無い）。ゲストには押せない普通の列。",
  },
  {
    id: "n2",
    title: "N2 アイコン列の下に文字リンク「みんなのコメントを見る ↓」",
    recommended: true,
    note: "押せることが文字で分かり、未申込・申込済みのどちらでも同じ位置に出る。ゲストには「メンバーはみんなのコメントが見られます ↓」を出し、一覧の位置にある会員向けの案内へ飛ばす（この案だけ。ほかの案はゲストには何も出さない）。",
  },
  {
    id: "n3",
    title: "N3 P3 の ⋯ メニューに「コメントを見る」",
    note: "申込済みは ⋯ →「コメントを見る」（「参加を取り消す」の上）。未申込の会員は ⋯ が無いので N2 の文字リンク。申込の前後で動線の場所が変わり、⋯ の中は見つけにくい。",
  },
  {
    id: "n4",
    title: "N4（追加提案）最新コメントのプレビュー1行",
    extra: true,
    note: "アイコン列の下に「（アイコン）名前：コメント ›」を1行。中身が少し見えるので「読みたい」と思わせやすい。会員だけに出す（名前とコメントは会員向けの情報）。自分のコメントは上部に出さない決定なので、申込済みでも「ほかの人の最新」を出す。",
  },
];

const VIEWERS: { id: ViewerState; label: string }[] = [
  { id: "guest", label: "ゲスト（未ログイン・非会員）" },
  { id: "member", label: "会員・未申込" },
  { id: "registered", label: "会員・申込済み（P3）" },
];

function Frame({ label, width, children }: { label: string; width: 640 | 343; children: ReactNode }) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-2", width === 640 ? "max-w-[640px]" : "max-w-[343px]")}>
      <span className="text-xs text-text-muted">{label}</span>
      <div className="flex min-h-[200px] w-full flex-col items-center justify-start rounded-2xl bg-base py-6">
        {children}
      </div>
    </div>
  );
}

export function NavPatternsSection({ intro }: { intro: ReactNode }) {
  const [viewer, setViewer] = useState<ViewerState>("registered");

  return (
    <div className="flex flex-col gap-10">
      {intro}

      <div className="z-10 -mx-4 lg:sticky lg:top-0 flex flex-wrap items-center gap-3 border-b border-gray-200 bg-base/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <span className="text-xs font-bold text-text-secondary">見ている人</span>
        <div role="group" aria-label="見ている人の状態" className="inline-flex flex-wrap gap-1 rounded-[12px] bg-muted-custom p-1">
          {VIEWERS.map((v) => (
            <Button
              key={v.id}
              type="button"
              size="sm"
              variant={viewer === v.id ? "outline" : "ghost"}
              aria-pressed={viewer === v.id}
              className="h-8 rounded-[8px] px-3 text-xs"
              onClick={() => setViewer(v.id)}
            >
              {v.label}
            </Button>
          ))}
        </div>
      </div>

      {PATTERNS.map((p) => {
        const area = (
          <TopArea
            pattern={p.id}
            viewer={viewer}
            onRegister={() => setViewer("registered")}
            onCancel={() => setViewer("member")}
          />
        );
        return (
          <div key={p.id} data-pattern={p.id} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="flex flex-wrap items-center gap-2 text-base font-bold text-text-primary">
                {p.title}
                {p.recommended && (
                  <span className="rounded-full bg-success-feedback px-2 py-0.5 text-[11px] font-bold text-text-success">おすすめ</span>
                )}
                {p.extra && (
                  <span className="rounded-full bg-muted-custom px-2 py-0.5 text-[11px] font-bold text-text-secondary">追加提案</span>
                )}
              </h3>
              <p className="text-xs leading-relaxed text-text-primary/60">{p.note}</p>
            </div>
            <div className="flex flex-wrap items-start gap-6">
              <Frame label="PC（640px）" width={640}>{area}</Frame>
              <Frame label="スマホ（343px）" width={343}>{area}</Frame>
            </div>
          </div>
        );
      })}

      {/* 本文の代わり（一覧がページのずっと下にあることを再現する） */}
      <div className="mx-auto flex h-[720px] w-full max-w-[640px] items-center justify-center rounded-2xl border border-dashed border-gray-300 text-sm text-text-muted">
        （サムネイル・本文が続く）
      </div>

      <div className="mx-auto w-full max-w-[640px]">
        <ListTarget viewer={viewer} />
      </div>
    </div>
  );
}
