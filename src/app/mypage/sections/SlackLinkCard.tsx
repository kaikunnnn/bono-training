"use client";

/**
 * マイページの「Slackとつなぐ」カード（#263）の入力フォーム。
 * Slack で使っているメールを入れると、その Slack アカウントに確認DMが届く。DM のリンクを開くとつながる。
 * 結果の文は、Slack にそのメールの人がいてもいなくても同じ（MYPAGE_LINK_COPY.sent）。
 */
import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MYPAGE_LINK_COPY } from "@/lib/slack-member-sync/link-copy";
import { requestSlackLink, type RequestSlackLinkResult } from "@/app/slack/link/actions";

export function SlackLinkCard() {
  const [result, action, pending] = useActionState<RequestSlackLinkResult, FormData>(requestSlackLink, null);
  const inputId = useId();
  const noteId = useId();

  return (
    <section className="w-full pt-8 pb-10 flex flex-col items-start gap-3 border-b border-black/10">
      <h2
        className="text-slate-950"
        style={{ fontFamily: "'Rounded Mplus 1c', sans-serif", fontSize: 16, fontWeight: 600, lineHeight: "24px" }}
      >
        Slackとつなぐ
      </h2>
      <div className="w-full rounded-2xl border border-border-light bg-white p-5 space-y-4">
        <p className="text-[14px] leading-relaxed text-text-secondary">
          SlackのアカウントがBONOのアカウントとつながっていません。つながっていないと、課金メンバーかを確認できず、Slackから外れることがあります。Slackで使っているメールアドレスを入れると、確認のDMが届きます。
        </p>
        <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 min-w-0 space-y-1.5">
            <label htmlFor={inputId} className="text-[13px] font-medium text-text-primary">
              Slackで使っているメールアドレス
            </label>
            <Input
              id={inputId}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={254}
              aria-describedby={result ? noteId : undefined}
              disabled={pending}
            />
          </div>
          <Button type="submit" variant="primary" disabled={pending} className="sm:w-auto">
            {pending ? "送っています…" : "確認のDMを送る"}
          </Button>
        </form>
        {result && (
          <p id={noteId} role="status" className="text-[13px] leading-5 text-text-muted">
            {MYPAGE_LINK_COPY[result.status]}
          </p>
        )}
      </div>
    </section>
  );
}
