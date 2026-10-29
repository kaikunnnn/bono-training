"use client";

/**
 * 会員メールの配信停止（#264 §5-8）。
 * 開いただけでは止めない。「受け取りをやめる」を押したときだけ止める（リンクを自動で開くセキュリティソフト対策）。
 * 止めたあとは、カテゴリごとに戻せる。
 */
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABEL, MAIL_CATEGORIES, type MailCategory } from "@/lib/member-mail/types";
import { restartMemberMail, stopMemberMail, type UnsubscribeActionState } from "./actions";

export function UnsubscribeForm({ token, initiallyStopped }: { token: string; initiallyStopped: MailCategory[] }) {
  const [stopState, stopAction, stopping] = useActionState<UnsubscribeActionState, FormData>(stopMemberMail, null);
  const [restartState, restartAction, restarting] = useActionState<UnsubscribeActionState, FormData>(
    restartMemberMail,
    null,
  );

  const latest = restartState ?? stopState;
  if (latest && (latest.status === "invalid" || latest.status === "unavailable")) {
    return <UnsubscribeMessage status={latest.status} />;
  }

  const stopped: MailCategory[] =
    latest && "stopped" in latest ? latest.stopped : stopState === null ? initiallyStopped : [];
  const hasStopped = stopState !== null || initiallyStopped.length > 0;

  if (!hasStopped) {
    return (
      <form action={stopAction} className="space-y-5">
        <h1 className="font-heading text-2xl font-bold leading-tight text-text-primary">BONOからのお知らせメールを止める</h1>
        <p className="text-base leading-relaxed text-text-secondary">
          ボタンを押すと、BONOからのお知らせのメール（週1回のメルマガ・ご案内など）が届かなくなります。
        </p>
        <p className="text-sm leading-relaxed text-text-muted">
          お支払い・契約・ログインに関するメールは、止めたあとも届きます。
        </p>
        <input type="hidden" name="t" value={token} />
        <Button type="submit" variant="primary" size="large" className="w-full" disabled={stopping}>
          {stopping ? "手続きしています…" : "受け取りをやめる"}
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold leading-tight text-text-primary">お知らせメールを止めました</h1>
      <p className="text-base leading-relaxed text-text-secondary">
        {stopped.length > 0
          ? "下のメールは、これから届きません。また受け取りたくなったら、種類ごとに戻せます。"
          : "いまは、すべてのお知らせメールを受け取る設定です。"}
      </p>
      <h2 className="text-sm font-bold text-text-primary">メールの種類</h2>
      <ul className="space-y-3">
        {MAIL_CATEGORIES.map((category) => {
          const isStopped = stopped.includes(category);
          return (
            <li
              key={category}
              className="flex flex-col gap-3 rounded-xl border border-border-light p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm leading-6 text-text-primary">{CATEGORY_LABEL[category]}</p>
                <p className="text-xs leading-5 text-text-muted">{isStopped ? "止めています" : "受け取っています"}</p>
              </div>
              {isStopped && (
                <form action={restartAction}>
                  <input type="hidden" name="t" value={token} />
                  <input type="hidden" name="category" value={category} />
                  <Button type="submit" variant="outline" size="sm" disabled={restarting}>
                    受け取りを再開する
                  </Button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs leading-5 text-text-muted">
        お支払い・契約・ログインに関するメールは、この設定にかかわらず届きます。
      </p>
    </div>
  );
}

export function UnsubscribeMessage({ status }: { status: "invalid" | "unavailable" }) {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold leading-tight text-text-primary">
        {status === "invalid" ? "このリンクは使えません" : "いま手続きできません"}
      </h1>
      <p className="text-base leading-relaxed text-text-secondary">
        {status === "invalid"
          ? "メールのリンクが途中で切れているかもしれません。メールの「配信停止」のリンクから、もう一度開いてください。"
          : "時間をおいて、もう一度お試しください。うまくいかないときは、このメールに返信して「配信停止」とお知らせください。"}
      </p>
    </div>
  );
}
