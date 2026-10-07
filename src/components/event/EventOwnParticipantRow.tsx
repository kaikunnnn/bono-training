"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EventMoreMenu from "@/components/event/EventMoreMenu";
import {
  updateRegistrationComment,
  type EventRegistrationActionResult,
} from "@/app/events/[slug]/actions";
import {
  REGISTRATION_COMMENT_MAX_LENGTH,
  type EventParticipant,
} from "@/lib/events/onsite-registration";

export type OwnRowAction = (
  prev: EventRegistrationActionResult | null,
  formData: FormData,
) => Promise<EventRegistrationActionResult | null>;

/** 文字数カウンターを出し始める文字数（申込カードと同じ） */
const COUNTER_VISIBLE_FROM = REGISTRATION_COMMENT_MAX_LENGTH - 20;

/**
 * 参加者のコメント一覧の「自分の行」（#218）。
 * 「あなた」バッジと ⋯ →「コメントを編集」で、その場で1行入力に切り替える。
 * 保存は updateRegistrationComment（締め切り後も申込済みなら編集できる）。
 * 保存に成功すると revalidatePath で一覧が最新のコメントに変わる。
 */
export default function EventOwnParticipantRow({
  participant,
  slug,
  action = updateRegistrationComment,
}: {
  participant: EventParticipant;
  slug: string;
  /** /dev/event-registration のプレビュー用（本番では渡さない） */
  action?: OwnRowAction;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(participant.comment);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // 編集を閉じたあと（保存・やめる）に ⋯ へフォーカスを戻すか
  const returnFocus = useRef(false);
  const fieldId = `event-own-comment-${useId()}`;
  const errorId = `${fieldId}-error`;
  const counterId = `${fieldId}-counter`;

  function openEditor() {
    setDraft(participant.comment);
    setEditing(true);
  }
  function closeEditor() {
    returnFocus.current = true;
    setEditing(false);
  }

  const [state, formAction, pending] = useActionState(
    async (prev: EventRegistrationActionResult | null, formData: FormData) => {
      const result = await action(prev, formData);
      if (result?.ok) closeEditor();
      return result;
    },
    null,
  );

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    } else if (returnFocus.current) {
      returnFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [editing]);

  const hasError = !!state && !state.ok && editing;
  const showCounter = draft.length >= COUNTER_VISIBLE_FROM;
  const describedBy =
    [hasError ? errorId : null, showCounter ? counterId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <li className="flex items-start gap-3 py-3">
      <Avatar className="size-10 shrink-0">
        {participant.avatarUrl && <AvatarImage src={participant.avatarUrl} alt="" />}
        <AvatarFallback>{participant.name.slice(0, 1) || "?"}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 break-words text-sm font-medium text-text-primary">
              {participant.name}
            </span>
            <span className="shrink-0 rounded-full bg-muted-custom px-2 py-px text-[11px] font-medium leading-4 text-text-secondary">
              あなた
            </span>
          </span>
          {!editing && (
            <EventMoreMenu
              triggerRef={triggerRef}
              label="自分のコメントのメニュー"
              className="-my-1"
              items={[{ label: "コメントを編集", onSelect: openEditor }]}
            />
          )}
        </div>

        {editing ? (
          <form action={formAction} className="flex flex-col gap-2 pt-1">
            <input type="hidden" name="slug" value={slug} />
            <label htmlFor={fieldId} className="sr-only">
              参加コメント
            </label>
            {/* React 19 のフォームはアクション後に非制御の入力をリセットするため、制御コンポーネントにする */}
            <Input
              ref={inputRef}
              id={fieldId}
              name="comment"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && !pending) closeEditor();
              }}
              maxLength={REGISTRATION_COMMENT_MAX_LENGTH}
              disabled={pending}
              aria-invalid={hasError || undefined}
              aria-describedby={describedBy}
              autoComplete="off"
              className="h-10 rounded-[12px] bg-surface text-sm md:text-sm"
            />
            {showCounter && (
              <span id={counterId} className="text-right text-xs text-text-muted">
                {draft.length}/{REGISTRATION_COMMENT_MAX_LENGTH}
              </span>
            )}
            {hasError && (
              <p id={errorId} role="alert" className="text-sm text-text-error">
                {state.error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={closeEditor}
              >
                やめる
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={pending || draft.trim().length === 0}
              >
                {pending ? "保存中…" : "保存する"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm text-text-secondary">
            {participant.comment}
          </p>
        )}
      </div>
    </li>
  );
}
