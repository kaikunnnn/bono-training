"use client";

import EventOnsiteRegistration, {
  type EventRegistrationActions,
  type RegisteredMode,
} from "@/components/event/EventOnsiteRegistration";
import type { RegistrantProfile } from "@/lib/events/onsite-registration";

/** プレビューでは何も送信しない（本物の Server Actions を呼ばない） */
const noop = async () => null;
const PREVIEW_ACTIONS: EventRegistrationActions = {
  register: noop,
  update: noop,
  cancel: noop,
};

/** プレビュー用の本人（会員のときにカードへ出す名前・アイコン） */
const PREVIEW_VIEWER: RegistrantProfile = {
  name: "かい",
  avatarUrl: null,
};

/**
 * /dev/event-registration 用。本物の EventOnsiteRegistration に、何もしないアクションを渡して表示する。
 * （関数は Server Component から Client Component へ props で渡せないため、ここで包む）
 *
 * access: 未ログイン（guest）／ログイン済み・非会員（non-member）／会員（member、既定）
 * 未ログイン・非会員のボタンは本物と同じく /login・/subscription へ移動する。
 */
export default function PreviewOnsiteRegistration({
  access = "member",
  viewer = PREVIEW_VIEWER,
  ...props
}: {
  access?: "guest" | "non-member" | "member";
  viewer?: RegistrantProfile;
  registration: { comment: string; updatedAt: string } | null;
  initialMode?: RegisteredMode;
  initialError?: string;
}) {
  return (
    <EventOnsiteRegistration
      slug="dev-preview"
      actions={PREVIEW_ACTIONS}
      isLoggedIn={access !== "guest"}
      hasMemberAccess={access === "member"}
      viewer={access === "member" ? viewer : null}
      {...props}
    />
  );
}
