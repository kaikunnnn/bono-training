"use client";

import EventOnsiteRegistration, {
  type EventRegistrationActions,
  type RegisteredMode,
} from "@/components/event/EventOnsiteRegistration";

/** プレビューでは何も送信しない（本物の Server Actions を呼ばない） */
const noop = async () => null;
const PREVIEW_ACTIONS: EventRegistrationActions = {
  register: noop,
  update: noop,
  cancel: noop,
};

/**
 * /dev/event-registration 用。本物の EventOnsiteRegistration に、何もしないアクションを渡して表示する。
 * （関数は Server Component から Client Component へ props で渡せないため、ここで包む）
 */
export default function PreviewOnsiteRegistration(props: {
  registration: { comment: string; updatedAt: string } | null;
  initialMode?: RegisteredMode;
  initialError?: string;
}) {
  return (
    <EventOnsiteRegistration
      slug="dev-preview"
      actions={PREVIEW_ACTIONS}
      {...props}
    />
  );
}
