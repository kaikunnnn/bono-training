"use client";

/**
 * Slack とつなぐ確認（#263）。「つなぐ」を押すと Server Action でつなぎ、結果の文を出す。
 */
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { confirmSlackLink, type ConfirmSlackLinkResult } from "./actions";
import { SlackLinkResult } from "./SlackLinkResult";

export function SlackLinkConfirm({ token, email }: { token: string; email: string | null }) {
  const [result, action, pending] = useActionState<ConfirmSlackLinkResult, FormData>(confirmSlackLink, null);

  if (result) return <SlackLinkResult status={result.status} />;

  return (
    <form action={action} className="space-y-5">
      <h1 className="font-heading text-2xl font-bold leading-tight text-text-primary">SlackとBONOをつなぐ</h1>
      <p className="text-base leading-relaxed text-text-secondary">
        DMを受け取ったSlackアカウントと、ログイン中のBONOアカウントをつなぎます。つなぐと、課金メンバーとしてSlackに残れます。
      </p>
      {email && <p className="text-xs leading-5 text-text-muted">ログイン中：{email}</p>}
      <input type="hidden" name="t" value={token} />
      <Button type="submit" variant="primary" size="large" className="w-full" disabled={pending}>
        {pending ? "つないでいます…" : "つなぐ"}
      </Button>
      <p className="text-xs leading-5 text-text-muted">
        別のBONOアカウントでつなぎたいときは、ログアウトしてから、もう一度DMのリンクを開いてください。
      </p>
    </form>
  );
}
