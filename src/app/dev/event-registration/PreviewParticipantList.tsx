"use client";

import EventParticipantList from "@/components/event/EventParticipantList";
import type { EventParticipant } from "@/lib/events/onsite-registration";

/**
 * /dev/event-registration 用。本物の EventParticipantList に、何も送信しない保存処理を渡す。
 * （関数は Server Component から Client Component へ props で渡せないため、ここで包む）
 * 保存は成功扱いにして編集を閉じるところまで見られるようにする（コメントの中身は変わらない）。
 */
export default function PreviewParticipantList({
  participants,
  ownRegistrationId = null,
}: {
  participants: EventParticipant[];
  ownRegistrationId?: string | null;
}) {
  return (
    <EventParticipantList
      participants={participants}
      slug="dev-preview"
      ownRegistrationId={ownRegistrationId}
      ownRowAction={async () => ({ ok: true })}
    />
  );
}
