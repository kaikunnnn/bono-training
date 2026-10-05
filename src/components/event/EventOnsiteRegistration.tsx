"use client";

import { useActionState, useId, useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  registerForEvent,
  updateRegistrationComment,
  cancelRegistration,
  type EventRegistrationActionResult,
} from "@/app/events/[slug]/actions";
import {
  DEFAULT_REGISTRATION_COMMENT,
  REGISTRATION_COMMENT_MAX_LENGTH,
} from "@/lib/events/onsite-registration";

interface EventOnsiteRegistrationProps {
  slug: string;
  /** 本人の申込（未申込なら null）。サーバーで毎回最新を読んだ値 */
  registration: { comment: string; updatedAt: string } | null;
}

/**
 * イベントのサイト上参加申込（#218）。有料会員にだけ表示する。
 *
 * - 未申込: コメント入力（初期値「参加します！」）＋「参加する」
 * - 申込済み: 「参加申込済み」＋コメント＋編集＋取り消し
 *
 * 表示の切り替えは props（サーバーの値）で決める。上部と本文下の2か所に置かれるため、
 * 操作後は revalidatePath で両方が同じ状態に揃う。
 */
export default function EventOnsiteRegistration({
  slug,
  registration,
}: EventOnsiteRegistrationProps) {
  if (!registration) {
    return <RegisterForm slug={slug} />;
  }
  // 申込内容が更新されたら（編集・再申込）、編集モードなどの手元の状態をリセットする
  return (
    <RegisteredView
      key={registration.updatedAt}
      slug={slug}
      comment={registration.comment}
    />
  );
}

function ErrorMessage({ state }: { state: EventRegistrationActionResult | null }) {
  if (!state || state.ok) return null;
  return (
    <p role="alert" className="text-sm text-red-600">
      {state.error}
    </p>
  );
}

function CommentField({
  value,
  onChange,
  disabled,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  id: string;
}) {
  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className="text-left text-sm text-gray-600">
        参加コメント
      </label>
      {/* React 19 のフォームはアクション後に非制御の入力をリセットするため、制御コンポーネントにして失敗時も入力を残す */}
      <Textarea
        id={id}
        name="comment"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={REGISTRATION_COMMENT_MAX_LENGTH}
        rows={2}
        disabled={disabled}
        className="min-h-[64px] resize-none bg-white text-base"
      />
      <span className="text-right text-xs text-gray-400">
        {value.length}/{REGISTRATION_COMMENT_MAX_LENGTH}
      </span>
    </div>
  );
}

function RegisterForm({ slug }: { slug: string }) {
  const [comment, setComment] = useState(DEFAULT_REGISTRATION_COMMENT);
  const [state, formAction, pending] = useActionState(registerForEvent, null);
  const fieldId = `event-register-comment-${useId()}`;

  return (
    <form
      action={formAction}
      className="flex w-full max-w-[400px] flex-col items-center gap-3"
    >
      <input type="hidden" name="slug" value={slug} />
      <CommentField
        id={fieldId}
        value={comment}
        onChange={setComment}
        disabled={pending}
      />
      <ErrorMessage state={state} />
      <Button
        type="submit"
        size="large"
        className="font-noto-sans-jp"
        disabled={pending || comment.trim().length === 0}
      >
        {pending ? "送信中…" : "参加する"}
      </Button>
    </form>
  );
}

function RegisteredView({ slug, comment }: { slug: string; comment: string }) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm-cancel">("view");
  const [draft, setDraft] = useState(comment);
  const [editState, editAction, editPending] = useActionState(
    updateRegistrationComment,
    null,
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelRegistration,
    null,
  );
  const fieldId = `event-edit-comment-${useId()}`;

  return (
    <div className="flex w-full max-w-[400px] flex-col items-center gap-3">
      <p className="flex items-center gap-2 text-base font-bold text-[#101828]">
        <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
        参加申込済み
      </p>

      {mode === "edit" ? (
        <form action={editAction} className="flex w-full flex-col items-center gap-3">
          <input type="hidden" name="slug" value={slug} />
          <CommentField
            id={fieldId}
            value={draft}
            onChange={setDraft}
            disabled={editPending}
          />
          <ErrorMessage state={editState} />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={editPending}
              onClick={() => {
                setDraft(comment);
                setMode("view");
              }}
            >
              やめる
            </Button>
            <Button
              type="submit"
              disabled={editPending || draft.trim().length === 0}
            >
              {editPending ? "保存中…" : "保存する"}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <p className="w-full whitespace-pre-wrap break-words rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700">
            {comment}
          </p>

          {mode === "confirm-cancel" ? (
            <form action={cancelAction} className="flex flex-col items-center gap-2">
              <input type="hidden" name="slug" value={slug} />
              <p className="text-sm text-gray-600">参加を取り消しますか？</p>
              <ErrorMessage state={cancelState} />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={cancelPending}
                  onClick={() => setMode("view")}
                >
                  やめる
                </Button>
                <Button type="submit" variant="destructive" disabled={cancelPending}>
                  {cancelPending ? "取り消し中…" : "取り消す"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode("edit")}
              >
                コメントを編集
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMode("confirm-cancel")}
              >
                参加を取り消す
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
