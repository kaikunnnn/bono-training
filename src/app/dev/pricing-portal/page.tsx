import type { Metadata } from "next";
import Link from "next/link";

/**
 * 料金ページ リニューアル — パターン出しポータル（内部用・noindex）
 *
 * issue #186 の探索ページを1枚に集約。散らばった /dev/pricing-* をここから辿る。
 * データ取得なしの静的リンク集（Server Component）。装飾は最小・DSトークンのみ。
 */
export const metadata: Metadata = {
  title: "料金ページ パターン出しポータル (/dev)",
  robots: { index: false, follow: false },
};

type Status = "採用" | "不採用" | "検証中" | "役目終了" | "組み立て中";

interface Variant {
  label: string;
  href: string;
}

interface Experiment {
  title: string;
  purpose: string;
  status: Status;
  note?: string;
  variants: Variant[];
}

const EXPERIMENTS: Experiment[] = [
  {
    title: "★ 昇格版 L4（クリーン部品）",
    purpose:
      "L4確定を受け、production志向のクリーン部品で組み直した本命。ラボ非依存・左揃え。src/lib/pricing + src/components/pricing を使用。",
    status: "組み立て中",
    note: "canonical部品を src/components/pricing・src/lib/pricing に集約（居候解消）。ここを本番 /subscription へ昇格していく。",
    variants: [{ label: "/dev/pricing-final（L4・左揃え・クリーン）", href: "/dev/pricing-final" }],
  },
  {
    title: "R6 ページ全体レイアウト（3案）",
    purpose:
      "全セクション（Hero／価格カード／プラン説明／実績・アウトプット／再掲CTA）を並べ方違いで比較。決定→課金の導線を検証。",
    status: "検証中",
    note: "実績・アウトプットは既存トップの getAchievementGroups を再利用。現在の統合ビュー。",
    variants: [
      { label: "L4 L3改：カード起点＋末尾に価格再掲", href: "/dev/pricing-layout?l=L4" },
      { label: "L1 王道（判断材料を順に）", href: "/dev/pricing-layout?l=L1" },
      { label: "L2 信頼先出し", href: "/dev/pricing-layout?l=L2" },
      { label: "L3 即決導線（価格主役）", href: "/dev/pricing-layout?l=L3" },
    ],
  },
  {
    title: "本番組み立てプロト（セクション単位）",
    purpose:
      "採用構成を1ページに組み立てる本体。導入＋価格カード（D0・説得コピー入り）。",
    status: "組み立て中",
    note: "R2まで反映済み（説得コピー＋解放機能）。レイアウト検証は R6 側へ。",
    variants: [{ label: "/dev/pricing", href: "/dev/pricing" }],
  },
  {
    title: "R3 プラン説明の簡潔化",
    purpose:
      "情報過多な「◯◯プランについて／何が変化する？」を簡潔に伝える見せ方。",
    status: "採用",
    note: "E2（変化ストーリー）採用。見出し統一・白カード撤去・スタンダード6項目・CTA見出し直下に改善済み。",
    variants: [
      { label: "E2 変化ストーリー（採用）", href: "/dev/pricing-detail?p=E2" },
      { label: "E1 要約2カラム（不採用）", href: "/dev/pricing-detail?p=E1" },
    ],
  },
  {
    title: "違いの見せ方（スタンダード↔フィードバック）",
    purpose:
      "サポートの手厚さ＝違いをどう見せるか。D0を採用（＋feedback限定項目の前景グラデは検討中）。",
    status: "採用",
    note: "D0採用 / D1・D2は不採用。",
    variants: [
      { label: "D0 現行カード並列（採用）", href: "/dev/pricing-diff?d=D0" },
      { label: "D1 積み上げ式（不採用）", href: "/dev/pricing-diff?d=D1" },
      { label: "D2 差分比較表（不採用）", href: "/dev/pricing-diff?d=D2" },
    ],
  },
  {
    title: "構造比較ラボ",
    purpose:
      "枠A（通常/フォーカス）× 見せ方B（カード/主従/比較表/タブ）× 期間C（トグル/カード内/リンク）の総当り。装飾ゼロで構造だけ比較。",
    status: "役目終了",
    note: "初期の構造選定用。カード並列＋上部トグルを選定済み。",
    variants: [
      { label: "B1 カード並列", href: "/dev/pricing-lab?plans=B1&period=C1&cta=free" },
      { label: "B2 主従", href: "/dev/pricing-lab?plans=B2&period=C1&cta=free" },
      { label: "B3 比較表", href: "/dev/pricing-lab?plans=B3&period=C1&cta=free" },
      { label: "B4 タブ集中", href: "/dev/pricing-lab?plans=B4&period=C1&cta=free" },
      { label: "A2 フォーカス枠", href: "/dev/pricing-lab?frame=A2&plans=B1" },
    ],
  },
  {
    title: "初期フルページプロト",
    purpose:
      "最初のフォーカスモード版フルページ。背景/角丸トークンの不整合など学びのある旧版（参考）。",
    status: "役目終了",
    variants: [
      { label: "A2 フォーカス", href: "/dev/pricing-proto?frame=A2&cta=free" },
      { label: "A1 通常", href: "/dev/pricing-proto?frame=A1&cta=free" },
    ],
  },
];

const STATUS_ORDER: Status[] = [
  "組み立て中",
  "検証中",
  "採用",
  "不採用",
  "役目終了",
];

export default function PricingPortalPage() {
  const sorted = [...EXPERIMENTS].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  );

  return (
    <main className="mx-auto max-w-[880px] px-6 py-12">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        料金ページ リニューアル — パターン出しポータル
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        issue #186 の料金ページ検証ページを1枚に集約したものです。目的は
        「/plan の内容を土台に、ユーザーがこの場でプランを決めて課金に進める設計を
        パターンで検証すること」。各リンクから確認できます（/dev 配下＝本番非公開）。
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {sorted.map((exp) => (
          <section
            key={exp.title}
            className="rounded-2xl border border-border bg-surface px-6 py-5"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                {exp.title}
              </h2>
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {exp.status}
              </span>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {exp.purpose}
            </p>
            {exp.note && (
              <p className="mt-1 text-xs text-muted-foreground">※ {exp.note}</p>
            )}

            <ul className="mt-3 flex flex-wrap gap-2">
              {exp.variants.map((v) => (
                <li key={v.href}>
                  <Link
                    href={v.href}
                    className="inline-block rounded-lg border border-border px-3 py-1.5 text-sm text-foreground underline-offset-4 hover:underline"
                  >
                    {v.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        進め方: R2 価格カード（済）→ R3 プラン説明（検証中）→ R4 Hero/見出し →
        R5 実績・アウトプット（既存データ再利用）→ R6 ページ全体構成 → R7 課金接続・/subscription 差し替え。
      </p>
    </main>
  );
}
