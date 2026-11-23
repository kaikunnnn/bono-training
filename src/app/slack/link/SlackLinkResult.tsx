/**
 * Slack とつなぐ（#263）の結果表示。ページ（サーバー）とボタン押下後（クライアント）の両方で使う。
 */
import Link from "next/link";
import { LINK_PAGE_COPY, type LinkPageStatus } from "@/lib/slack-member-sync/link-copy";

export function SlackLinkResult({ status }: { status: LinkPageStatus }) {
  const copy = LINK_PAGE_COPY[status];
  return (
    <div className="space-y-4" role="status">
      <h1 className="font-heading text-2xl font-bold leading-tight text-text-primary">{copy.title}</h1>
      <p className="text-base leading-relaxed text-text-secondary">{copy.body}</p>
      <p>
        <Link
          href="/account"
          className="text-text-link underline underline-offset-2 hover:text-text-link-hover font-medium"
        >
          アカウント情報へ
        </Link>
      </p>
    </div>
  );
}
