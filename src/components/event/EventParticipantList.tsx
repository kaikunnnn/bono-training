import { useId } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { EventParticipant } from "@/lib/events/onsite-registration";

/**
 * 参加者のコメント一覧（#218 スライスD）。有料会員にだけ表示する。
 * 呼び出し側（page.tsx）でサーバーが会員と確認したときだけ描画・データ取得すること。
 *
 * 並びは新しい申込順。0人のときは何も出さない。
 * アイコン未設定の人は、掲示板のコメントと同じく AvatarFallback に名前の頭文字を出す。
 */
export default function EventParticipantList({
  participants,
}: {
  participants: EventParticipant[];
}) {
  const headingId = useId();
  if (participants.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="flex w-full flex-col gap-4"
    >
      <h2
        id={headingId}
        className="text-lg font-bold text-[#101828]"
      >
        参加者のコメント（{participants.length}人）
      </h2>
      <ul className="flex flex-col divide-y divide-gray-100">
        {participants.map((p) => (
          <li key={p.id} className="flex items-start gap-3 py-3">
            <Avatar className="size-10 shrink-0">
              {p.avatarUrl && <AvatarImage src={p.avatarUrl} alt="" />}
              <AvatarFallback>{p.name.slice(0, 1) || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="break-words text-sm font-medium text-[#101828]">
                {p.name}
              </span>
              <p className="whitespace-pre-wrap break-words text-sm text-gray-700">
                {p.comment}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
