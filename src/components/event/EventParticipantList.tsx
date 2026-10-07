import { useId } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PARTICIPANTS_ANCHOR_ID,
  PARTICIPANTS_SCROLL_MARGIN,
  type EventParticipant,
} from "@/lib/events/onsite-registration";
import EventOwnParticipantRow, {
  type OwnRowAction,
} from "@/components/event/EventOwnParticipantRow";

/**
 * 参加者のコメント一覧（#218 スライスD）。有料会員にだけ表示する。
 * 呼び出し側（page.tsx）でサーバーが会員と確認したときだけ描画・データ取得すること。
 *
 * 並びは新しい申込順。0人のときは何も出さない。
 * アイコン未設定の人は、掲示板のコメントと同じく AvatarFallback に名前の頭文字を出す。
 *
 * 自分の行（ownRegistrationId と同じ id）には「あなた」バッジと ⋯ を出し、
 * ⋯ →「コメントを編集」でその場で編集できる（申込カードには自分のコメントを出さない）。
 * id="participants" は、アイコン列の下の「みんなのコメントを見る ↓」の飛び先。
 */
export default function EventParticipantList({
  participants,
  slug,
  ownRegistrationId = null,
  ownRowAction,
}: {
  participants: EventParticipant[];
  /** 自分のコメントを編集するときに Server Action へ渡す slug */
  slug: string;
  /** 見ている会員本人の申込 id（未申込なら null）。会員本人にだけ渡す */
  ownRegistrationId?: string | null;
  /** /dev/event-registration のプレビュー用（本番では渡さない） */
  ownRowAction?: OwnRowAction;
}) {
  const headingId = useId();
  if (participants.length === 0) return null;

  return (
    <section
      id={PARTICIPANTS_ANCHOR_ID}
      aria-labelledby={headingId}
      className={`flex w-full flex-col gap-4 ${PARTICIPANTS_SCROLL_MARGIN}`}
    >
      {/* 「みんなのコメントを見る」で飛んできたとき、キーボード利用者のためにここへフォーカスを移す */}
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
          p.id === ownRegistrationId ? (
            <EventOwnParticipantRow
              key={p.id}
              participant={p}
              slug={slug}
              action={ownRowAction}
            />
          ) : (
            <li key={p.id} className="flex items-start gap-3 py-3">
              <Avatar className="size-10 shrink-0">
                {p.avatarUrl && <AvatarImage src={p.avatarUrl} alt="" />}
                <AvatarFallback>{p.name.slice(0, 1) || "?"}</AvatarFallback>
              </Avatar>
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
