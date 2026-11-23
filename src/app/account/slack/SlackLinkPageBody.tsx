/**
 * 「Slackとつなぐ」の詳細ページ（/account/slack・#263）の中身。通知設定ページと同じ形。
 * 出し分け（state）はページ側で決めて渡す（確認用ページからも同じ見た目を出せるように、ここは表示だけ）。
 */
import { MYPAGE_LINK_COPY } from "@/lib/slack-member-sync/link-copy";
import {
  SettingsBackLink,
  SettingsCard,
  SettingsPageLayout,
  SettingsPageTitle,
} from "@/components/common/SettingsPageLayout";
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
    <SettingsPageLayout>
      <SettingsBackLink href="/account">アカウント情報</SettingsBackLink>
      <SettingsPageTitle>Slackとつなぐ</SettingsPageTitle>

      <SettingsCard>
        {state === "show" ? (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              SlackのアカウントがBONOのアカウントとつながっていません。つながっていないと、課金メンバーかを確認できず、Slackから外れることがあります。Slackで使っているメールアドレスを入れると、確認のDMが届きます。
            </p>
            <SlackLinkForm />
            <section className="space-y-2">
              <h2 className="font-noto-sans-jp text-base font-bold text-text-primary">このあとの流れ</h2>
              <ol className="list-decimal pl-5 space-y-1 text-sm leading-relaxed text-text-secondary">
                {STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          </div>
        ) : (
          <p role="status" className="text-sm text-muted-foreground">
            {MESSAGE[state]}
          </p>
        )}
      </SettingsCard>
    </SettingsPageLayout>
  );
}
