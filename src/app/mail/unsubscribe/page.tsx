/**
 * 会員メールの配信停止（#264 §5-8）。メール本文の「配信停止」リンク（/mail/unsubscribe?t=…）の行き先。
 *
 * - ログインは要らない。t= の署名つきトークンで「誰の・どのカテゴリか」を確かめる
 * - 開いただけでは止めない（GET では何も書き換えない）。ボタンを押すと Server Action で止める
 * - メールソフトの「配信停止」ボタンからの停止は POST /api/mail/unsubscribe（画面なし）
 */
import type { Metadata } from "next";
import { getMailStore, getUnsubscribeSecret } from "@/lib/member-mail/runtime";
import type { MailCategory } from "@/lib/member-mail/types";
import { verifyUnsubscribeToken } from "@/lib/member-mail/unsubscribe-token";
import { UnsubscribeForm, UnsubscribeMessage } from "./UnsubscribeForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "お知らせメールの配信停止",
  robots: { index: false, follow: false },
};

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[60vh] px-4 py-16">
      <div className="mx-auto max-w-[520px] rounded-2xl border border-border-light bg-surface p-6 sm:p-8">{children}</div>
    </div>
  );
}

export default async function MailUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.t === "string" ? params.t : null;
  const secret = getUnsubscribeSecret();
  const store = getMailStore();

  if (!secret || !store) {
    return (
      <Frame>
        <UnsubscribeMessage status="unavailable" />
      </Frame>
    );
  }
  const verified = verifyUnsubscribeToken(secret, token);
  if (!verified || !token) {
    return (
      <Frame>
        <UnsubscribeMessage status="invalid" />
      </Frame>
    );
  }

  let stopped: MailCategory[] = [];
  try {
    stopped = await store.listStoppedCategories(verified.userId);
  } catch (error) {
    console.error("[member-mail] unsubscribe page read failed:", error instanceof Error ? error.message : "unknown");
    return (
      <Frame>
        <UnsubscribeMessage status="unavailable" />
      </Frame>
    );
  }

  return (
    <Frame>
      <UnsubscribeForm token={token} initiallyStopped={stopped} />
    </Frame>
  );
}
