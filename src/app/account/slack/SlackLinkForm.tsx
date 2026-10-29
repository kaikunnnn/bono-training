"use client";

/**
 * 「Slackとつなぐ」（#263）の入力フォーム。詳細ページ（/account/slack）で使う。
 * Slack で使っているメールを入れると、その Slack アカウントに確認DMが届く。DM のリンクを開くとつながる。
 * 結果の文は、Slack にそのメールの人がいてもいなくても同じ（MYPAGE_LINK_COPY.sent）。
 */
import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MYPAGE_LINK_COPY } from "@/lib/slack-member-sync/link-copy";
import { requestSlackLink, type RequestSlackLinkResult } from "@/app/slack/link/actions";

export function SlackLinkForm() {
  const [result, action, pending] = useActionState<RequestSlackLinkResult, FormData>(requestSlackLink, null);
  const inputId = useId();
  const noteId = useId();

  return (
    <div className="w-full space-y-3">
      <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 min-w-0 space-y-1.5">
          <Label htmlFor={inputId} className="text-text-primary">
            Slackで使っているメールアドレス
          </Label>
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
        <p id={noteId} role="status" className="text-sm leading-relaxed text-text-secondary">
          {MYPAGE_LINK_COPY[result.status]}
        </p>
      )}
    </div>
  );
}
