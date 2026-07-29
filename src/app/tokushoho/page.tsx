import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表示",
  description: "BONOの特定商取引法に基づく表示です。",
  alternates: { canonical: "/tokushoho" },
};

const ROWS: { label: string; value: string[] }[] = [
  { label: "事業者の名称", value: ["カイクン"] },
  {
    label: "代表者又は通信販売に関する業務の責任者の氏名",
    value: ["甲斐琢巳"],
  },
  { label: "住所", value: ["杉並区西荻北3-42-17"] },
  { label: "電話番号", value: ["07084264038"] },
  { label: "メールアドレス", value: ["takumi.kai.skywalker@gmail.com"] },
  {
    label: "商品の販売価格・サービスの対価",
    value: ["各商品・サービスのご購入ページにて表示する価格"],
  },
  { label: "対価以外に必要となる費用", value: ["消費税"] },
  { label: "支払方法", value: ["クレジットカード"] },
  {
    label: "代金の支払時期",
    value: [
      "クレジットカード：ご注文時にお支払いが確定いたします。",
      "定期購入（サブスクリプション）の場合、初回のお支払いのお日にちより、毎月又は毎年、代金を決済いたします。",
    ],
  },
  {
    label: "商品引き渡し又はサービスの提供の時期",
    value: [
      "【役務・サービスについて】",
      "所定の手続き終了後、直ちにご利用いただけます。",
    ],
  },
  {
    label: "返品・キャンセルに関する特約",
    value: [
      "本サービスで販売する商品・サービスについては、当社が別途定める場合を除き、購入手続き完了後の返品又はキャンセルをお受けいたしません。なお、商品・サービスに欠陥・不良がある場合は、利用規約の定めに従って対応します。",
      "商品がソフトウェアの場合、動作環境及びスペックはご購入ページで表示いたします。",
      "特別な販売条件又は提供条件がある商品又はサービスについては、各商品又はサービスの購入ページにおいて条件を表示します。",
    ],
  },
];

export default function TokushohoPage() {
  return (
    <main className="container max-w-3xl py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-rounded-mplus font-bold mb-8">
        特定商取引法に基づく表示
      </h1>
      <dl className="divide-y divide-border text-sm md:text-base">
        {ROWS.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 md:grid-cols-[minmax(0,220px)_1fr] gap-1 md:gap-6 py-4"
          >
            <dt className="font-semibold text-foreground">{row.label}</dt>
            <dd className="text-muted-foreground space-y-1">
              {row.value.map((line, i) => (
                <p key={i} className="whitespace-pre-line">
                  {line}
                </p>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
