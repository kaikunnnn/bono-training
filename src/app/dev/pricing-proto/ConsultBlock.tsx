/**
 * 下部の相談導線ブロック（プレースホルダー）。
 * プラン選びに迷った人への導線を置く場所。文言は本実装で差し替える想定。
 */

export function ConsultBlock() {
  return (
    <section
      aria-labelledby="pricing-proto-consult-heading"
      className="rounded-md-card border border-border bg-surface px-6 py-8 text-center"
    >
      <h2
        id="pricing-proto-consult-heading"
        className="font-heading text-lg font-bold text-foreground"
      >
        プラン選びに迷ったら
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        （プレースホルダー）どちらが合うか分からない場合の相談導線をここに置きます。目的や状況に合わせて最適なプランをご案内します。
      </p>
    </section>
  );
}
