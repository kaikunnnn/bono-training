/**
 * 「Slackとつなぐ」の詳細ページ（/mypage/slack・#263）の中身。
 * 出し分け（state）はページ側で決めて渡す（確認用ページからも同じ見た目を出せるように、ここは表示だけ）。
 * 幅・余白・見出しはマイページのヘッダー（MyPageShell）にそろえる。
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MYPAGE_LINK_COPY } from "@/lib/slack-member-sync/link-copy";
import { SlackLinkForm } from "./SlackLinkForm";

/** フォームを出す（show）か、その代わりに文だけ出すか */
export type SlackLinkPageState = "show" | "linked" | "not_paid" | "unavailable";

const MESSAGE: Record<Exclude<SlackLinkPageState, "show">, string> = {
  linked: "このBONOアカウントは、すでにSlackとつながっています。",
  not_paid: MYPAGE_LINK_COPY.not_paid,
  unavailable: MYPAGE_LINK_COPY.unavailable,
};

const STEPS = [
  "Slackにカイクンから確認のDMが届きます",
  "DMの「BONOとつなぐ」を開きます",
  "開いたページで「つなぐ」を押すと完了です",
];

export function SlackLinkPageBody({ state }: { state: SlackLinkPageState }) {
  return (
    <div className="min-h-screen">
      <div className="pt-10 pb-16 px-4 max-w-3xl mx-auto">
        <Link
          href="/mypage"
          className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft className="size-4" aria-hidden />
          マイページ
        </Link>
        {/* 見出しはマイページ（MyPageShell）の「マイページ」と同じ */}
        <h1 className="mt-6 mb-6 text-2xl font-semibold leading-6 font-rounded-mplus text-slate-950">Slackとつなぐ</h1>

        {state === "show" ? (
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-text-secondary">
              SlackのアカウントがBONOのアカウントとつながっていません。つながっていないと、課金メンバーかを確認できず、Slackから外れることがあります。Slackで使っているメールアドレスを入れると、確認のDMが届きます。
            </p>
            <SlackLinkForm />
            <section className="space-y-3">
              <h2 className="font-heading text-base font-semibold leading-6 text-text-primary">このあとの流れ</h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-sm leading-relaxed text-text-secondary">
                {STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          </div>
        ) : (
          <p role="status" className="text-base leading-relaxed text-text-secondary">
            {MESSAGE[state]}
          </p>
        )}
      </div>
    </div>
  );
}
