/**
 * マイページの「Slackとつなぐ」の入口（#263）の見た目。説明1文と、詳細ページ（/mypage/slack）へのボタンだけ。
 * 出すかどうかは SlackLinkSection が決める（ここは表示だけ）。
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SlackLinkEntry() {
  return (
    // 外枠は隣のセクション（_shared/MySection）と同じ。色・文字はデザイントークン（text-text-* / font-heading）
    <section className="w-full pt-8 pb-10 flex flex-col items-start gap-3 border-b border-black/10">
      <h2 className="font-heading text-base font-semibold leading-6 text-text-primary">Slackとつなぐ</h2>
      <p className="text-sm leading-relaxed text-text-secondary">
        SlackのアカウントがBONOとつながっていません。つながっていないと、課金メンバーかを確認できず、Slackから外れることがあります。
      </p>
      <Button asChild variant="primary">
        <Link href="/mypage/slack">Slackとつなぐ</Link>
      </Button>
    </section>
  );
}
