"use client";

/**
 * /dev/event-registration-patterns の操作できる見本（手元の state だけで動く）。
 */

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { EventParticipant } from "@/lib/events/onsite-registration";
import EditableParticipantList from "./EditableParticipantList";
import { RegistrationArea, type RegisteredPattern } from "./parts";
import {
  MY_COMMENT,
  OTHERS,
  VIEWER_ID,
  myParticipant,
  sortNewestFirst,
} from "./mock";

// ---------------------------------------------------------------------------
// 共通の小物
// ---------------------------------------------------------------------------

/** 幅を固定した見本枠（狭い画面では縮む。横スクロールを出さない） */
function Frame({
  label,
  width,
  children,
}: {
  label: string;
  width: 640 | 343;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-2",
        width === 640 ? "max-w-[640px]" : "max-w-[343px]",
      )}
    >
      <span className="text-xs text-text-muted">{label}</span>
      <div className="flex min-h-[220px] w-full flex-col items-center justify-start rounded-2xl bg-base py-6">
        {children}
      </div>
    </div>
  );
}

/** 「未申込 / 申込済み」の切り替え（カードの「参加する」を押しても切り替わる） */
function StateToggle({
  registered,
  onChange,
}: {
  registered: boolean;
  onChange: (registered: boolean) => void;
}) {
  return (
    <div
      role="group"
      aria-label="表示する状態"
      className="inline-flex rounded-[12px] bg-muted-custom p-1"
    >
      {(
        [
          [false, "未申込"],
          [true, "申込済み"],
        ] as const
      ).map(([value, label]) => (
        <Button
          key={label}
          type="button"
          size="sm"
          variant={registered === value ? "outline" : "ghost"}
          aria-pressed={registered === value}
          className="h-8 rounded-[8px] px-3 text-xs"
          onClick={() => onChange(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. 申込済みパターン（PC 640 / スマホ 343 を並べる。状態は両方で共有）
// ---------------------------------------------------------------------------

export function PatternDemo({
  pattern,
  commentsHref,
}: {
  pattern: RegisteredPattern;
  commentsHref?: string;
}) {
  const [registered, setRegistered] = useState(true);
  const area = (
    <RegistrationArea
      pattern={pattern}
      registered={registered}
      closed={false}
      onRegister={() => setRegistered(true)}
      onCancel={() => setRegistered(false)}
      commentsHref={commentsHref}
    />
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <StateToggle registered={registered} onChange={setRegistered} />
        <span className="text-xs text-text-muted">
          未申込にして「参加する」を押すと、申込済みの表示に切り替わります
        </span>
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <Frame label="PC（640px）" width={640}>
          {area}
        </Frame>
        <Frame label="スマホ（343px）" width={343}>
          {area}
        </Frame>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. ⋯ メニュー → 取り消し確認モーダル（受付中 / 受付終了）
// ---------------------------------------------------------------------------

export function CancelFlowDemo({ closed }: { closed: boolean }) {
  const [registered, setRegistered] = useState(true);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <RegistrationArea
        pattern="p1"
        registered={registered}
        closed={closed}
        onRegister={() => setRegistered(true)}
        onCancel={() => setRegistered(false)}
      />
      {!registered && (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => setRegistered(true)}
        >
          見本をリセット（申込済みに戻す）
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. コメント一覧（本人の行で編集）
// ---------------------------------------------------------------------------

export function OwnRowListDemo({ id }: { id?: string }) {
  const [comment, setComment] = useState(MY_COMMENT);
  const participants = sortNewestFirst([...OTHERS, myParticipant(comment)]);
  return (
    <EditableParticipantList
      id={id}
      participants={participants}
      viewerId={VIEWER_ID}
      onChangeComment={setComment}
    />
  );
}

// ---------------------------------------------------------------------------
// 5. ページ全体（P1・申込済み）
// ---------------------------------------------------------------------------

export function FullPageDemo({
  mobile,
  body,
  listId,
}: {
  /** true: スマホ幅の枠（画面幅に関係なくスマホの文字サイズで出す） */
  mobile: boolean;
  /** 本文（Server 側で描画した RichTextSection） */
  body: ReactNode;
  listId: string;
}) {
  const [registered, setRegistered] = useState(true);
  const [comment, setComment] = useState(MY_COMMENT);
  // 申込し直したときは「いちばん新しい申込」として先頭に入る
  const [myCreatedAt, setMyCreatedAt] = useState("2026-10-06T00:00:00.000Z");

  const participants: EventParticipant[] = sortNewestFirst(
    registered ? [...OTHERS, myParticipant(comment, myCreatedAt)] : OTHERS,
  );

  const area = (
    <RegistrationArea
      pattern="p1"
      registered={registered}
      closed={false}
      onRegister={(c) => {
        setComment(c);
        setMyCreatedAt("2026-10-09T00:00:00.000Z");
        setRegistered(true);
      }}
      onCancel={() => setRegistered(false)}
      commentsHref={`#${listId}`}
    />
  );

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-gray-200 bg-base",
        mobile ? "max-w-[375px]" : "",
      )}
    >
      <div className={cn("mx-auto max-w-[800px] px-4 py-12", !mobile && "sm:px-6")}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex size-[96px] items-center justify-center rounded-xl bg-muted-custom text-xs text-text-muted">
              日付カード
            </div>
            <span className="text-sm text-text-muted">（ Event ）</span>
            <h1
              className={cn(
                "text-balance font-rounded-mplus text-3xl font-bold leading-[148%] text-text-primary",
                !mobile && "md:text-5xl",
              )}
            >
              10/21スタート！BONOの数字を見てUIを改善する1ヶ月チャレンジ
            </h1>
            {area}
            <div className="mt-4 flex aspect-video w-full max-w-[640px] items-center justify-center rounded-xl bg-muted-custom text-xs text-text-muted">
              サムネイル
            </div>
          </div>

          <div className="mx-auto w-full max-w-[640px]">{body}</div>

          <div className="mx-auto w-full max-w-[640px]">
            <EditableParticipantList
              id={listId}
              participants={participants}
              viewerId={VIEWER_ID}
              onChangeComment={setComment}
            />
          </div>

          <div className="mx-auto flex w-full max-w-[640px] justify-center border-t border-gray-200 pt-6">
            {area}
          </div>
        </div>
      </div>
    </div>
  );
}
