/**
 * 料金ページ レイアウト検証（/dev/pricing-layout）用の再掲CTAブロック。
 *
 * このページ用の自作（既存に単体コンポーネントが無いため）。作り込まず簡潔に。
 * ボタンは共通 Button（rule 03: 押せる要素は必ず共通Button）。CTA は Stripe を呼ばず
 * onClick=console.log のダミー。見出しはページ h1 の下位なので h2。
 */

import { Button } from "@/components/ui/button";

export function RepeatCta() {
  const handleCta = (plan: "standard" | "feedback") => {
    console.log("[pricing-layout] RepeatCTA", { plan });
  };

  return (
    <section className="rounded-3xl border border-border bg-surface px-6 py-10 text-center">
      <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
        まずは気になるプランからはじめよう
      </h2>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="sm:min-w-[200px]"
          onClick={() => handleCta("standard")}
        >
          スタンダードで始める
        </Button>
        <Button
          type="button"
          variant="default"
          className="sm:min-w-[200px]"
          onClick={() => handleCta("feedback")}
        >
          フィードバックで始める
        </Button>
      </div>
    </section>
  );
}
