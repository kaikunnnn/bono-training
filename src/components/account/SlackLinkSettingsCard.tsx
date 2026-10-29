/**
 * アカウント情報（/account）の「Slack」カード（#263）。通知カードと同じ形。
 * show: 説明＋「Slackとつなぐ」（/account/slack へ） / linked: つながっている旨だけ。
 * 出すかどうか（loadSlackLinkState）はページ側で決める（ここは表示だけ）。
 */
import Link from "next/link";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsCard } from "@/components/common/SettingsPageLayout";

export function SlackLinkSettingsCard({ state }: { state: "show" | "linked" }) {
  return (
    <SettingsCard title="Slack">
      {state === "linked" ? (
        <p className="text-sm text-muted-foreground">Slackとつながっています。</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            SlackのアカウントがBONOとつながっていません。つながっていないと、課金メンバーかを確認できず、Slackから外れることがあります。
          </p>
          <Button asChild variant="outline">
            <Link href="/account/slack">
              <Link2 className="h-4 w-4" />
              Slackとつなぐ
            </Link>
          </Button>
        </div>
      )}
    </SettingsCard>
  );
}
