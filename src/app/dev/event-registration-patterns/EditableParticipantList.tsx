"use client";

/**
 * 参加者のコメント一覧（提案）。本人の行にだけ「あなた」バッジと ⋯ を出し、
 * ⋯ →「コメントを編集」でその場で1行入力に切り替える（手元の state だけ。送信しない）。
 * 本番の EventParticipantList と同じ並び（新しい申込順）・同じ行の形。
 */

import { useId, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  REGISTRATION_COMMENT_MAX_LENGTH,
  type EventParticipant,
} from "@/lib/events/onsite-registration";
import { MoreMenu } from "./parts";

export default function EditableParticipantList({
  participants,
  viewerId,
  onChangeComment,
  id,
}: {
  participants: EventParticipant[];
  viewerId: string;
  onChangeComment: (comment: string) => void;
  /** ページ内リンク（カードの「コメントは参加者一覧で編集できます」）の飛び先 */
  id?: string;
}) {
  const headingId = useId();
  if (participants.length === 0) return null;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="flex w-full scroll-mt-24 flex-col gap-4 text-left"
    >
      {/* ページ内リンクで飛んできたとき、キーボード利用者のためにここへフォーカスを移す */}
      <h2
        id={headingId}
        tabIndex={-1}
        data-scroll-focus
        className="text-lg font-bold text-text-primary outline-none"
      >
        参加者のコメント（{participants.length}人）
      </h2>
      <ul className="flex flex-col divide-y divide-gray-100">
        {participants.map((p) =>
          p.id === viewerId ? (
            <OwnRow key={p.id} participant={p} onSave={onChangeComment} />
          ) : (
            <li key={p.id} className="flex items-start gap-3 py-3">
              <RowAvatar participant={p} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="break-words text-sm font-medium text-text-primary">
                  {p.name}
                </span>
                <p className="whitespace-pre-wrap break-words text-sm text-text-secondary">
                  {p.comment}
                </p>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

function RowAvatar({ participant }: { participant: EventParticipant }) {
  return (
    <Avatar className="size-10 shrink-0">
      {participant.avatarUrl && <AvatarImage src={participant.avatarUrl} alt="" />}
      <AvatarFallback>{participant.name.slice(0, 1) || "?"}</AvatarFallback>
    </Avatar>
  );
}

function OwnRow({
  participant,
  onSave,
}: {
  participant: EventParticipant;
  onSave: (comment: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(participant.comment);
  const fieldId = `own-comment-${useId()}`;
  const counterVisible = draft.length >= REGISTRATION_COMMENT_MAX_LENGTH - 20;

  return (
    <li className="flex items-start gap-3 py-3">
      <RowAvatar participant={participant} />
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
            <MoreMenu
              label="自分のコメントのメニュー"
              className="-my-1 text-text-muted"
              items={[
                {
                  label: "コメントを編集",
                  onSelect: () => {
                    setDraft(participant.comment);
                    setEditing(true);
                  },
                },
              ]}
            />
          )}
        </div>

        {editing ? (
          <form
            className="flex flex-col gap-2 pt-1"
            onSubmit={(e) => {
              e.preventDefault();
              onSave(draft.trim());
              setEditing(false);
            }}
          >
            <label htmlFor={fieldId} className="sr-only">
              参加コメント
            </label>
            <Input
              id={fieldId}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={REGISTRATION_COMMENT_MAX_LENGTH}
              autoComplete="off"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") setEditing(false);
              }}
              className="h-10 rounded-[12px] bg-surface text-sm md:text-sm"
            />
            {counterVisible && (
              <span className="text-right text-xs text-text-muted">
                {draft.length}/{REGISTRATION_COMMENT_MAX_LENGTH}
              </span>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
              >
                やめる
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={draft.trim().length === 0}
              >
                保存する
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
