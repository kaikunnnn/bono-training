/**
 * 料金ページ 文言/コンテンツ集約（production 集約版）。
 *
 * 価格は一切扱わない（価格は @/lib/pricing/price に集約）。ここは表示コピーのみ。
 * 価格でない文言はリテラルOK（/plan・Figma 準拠の実データ）。
 *
 * 移植・統合元:
 *  - src/app/dev/pricing-diff/data.ts   … FEATURE_ROWS / featureValue / isFeatureAbsent / getCtaLabel
 *  - src/app/dev/pricing/PlanCards.tsx  … 価格カードの catch / description（PLAN_CONTENT）
 *  - src/app/dev/pricing-detail/data.ts … STANDARD / FEEDBACK / CHANGE_PAIRS 等プラン説明コピー
 */

import { getPlanDisplayName } from "@/lib/subscription-utils";
import type { PlanType } from "@/types/subscription";
import {
  Edit3,
  FileText,
  MessageCircle,
  Play,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

// ---- CTA 文言 ---------------------------------------------------------------

/** CTA文言（「{プラン名}で始める」）。プラン名は getPlanDisplayName 由来 */
export function getCtaLabel(type: PlanType): string {
  return `${getPlanDisplayName(type)}で始める`;
}

// ---- 機能行（価格でないため文言リテラルOK） --------------------------------
//
// Figma(186) の feature-row 準拠。順番はこの通り（共通3 → 差分3）。
// アイコンは lucide-react（Figmaのアイコン名がそのまま lucide）。

export interface FeatureRow {
  label: string;
  icon: LucideIcon;
  standard: string;
  feedback: string;
  /** diff = feedback独自（差分）/ common = 両プラン共通 */
  group: "diff" | "common";
}

/**
 * 共通3行（上）→ 差分3行（下）の固定順（Figma 186 準拠）。
 * 共通（1〜3）は両プラン同一、差分（4〜6）は feedback 独自。
 * 旧仕様の「勉強会(月1)」は Figma 未記載のため廃止。
 */
export const FEATURE_ROWS: FeatureRow[] = [
  // --- 共通（両プラン同じ・上に置く） ---
  {
    label: "解説動画",
    icon: Play,
    standard: "見放題",
    feedback: "見放題",
    group: "common",
  },
  {
    label: "コミュニティ",
    icon: Users,
    standard: "参加",
    feedback: "参加",
    group: "common",
  },
  {
    label: "質問 / 相談",
    icon: MessageCircle,
    standard: "無制限",
    feedback: "無制限",
    group: "common",
  },
  // --- 差分（feedback独自・下に置く） ---
  {
    label: "添削 / 相談",
    icon: Edit3,
    standard: "なし",
    feedback: "月2回",
    group: "diff",
  },
  {
    label: "ポートフォリオ相談",
    icon: FileText,
    standard: "なし",
    feedback: "可能",
    group: "diff",
  },
  {
    label: "オンライン相談・添削",
    icon: Video,
    standard: "なし",
    feedback: "可能",
    group: "diff",
  },
];

export function featureValue(row: FeatureRow, type: PlanType): string {
  return type === "standard" ? row.standard : row.feedback;
}

/** その機能行の値が「提供なし」かどうか（アイコン/淡色表現に使う） */
export function isFeatureAbsent(value: string): boolean {
  return value === "なし";
}

// ---- 価格カードのコピー（/plan準拠。価格でないため文言リテラルOK） -------------
// 移植元: src/app/dev/pricing/PlanCards.tsx の PLAN_CONTENT

export interface PlanCardContent {
  /** キャッチ見出し（太字タグライン） */
  catch: string;
  /** 説明文（説得コピー） */
  description: string;
}

// catch = カード上部のタグライン（Figma 186）。description は現状カード未使用
// （PlanCards から説明文ブロックを撤去したため）だが、型互換のため残置。
export const PLAN_CONTENT: Record<PlanType, PlanCardContent> = {
  standard: {
    catch: "デザインを伸ばす環境を、飲み会1回分で手に入れよう",
    description:
      "飲み会1回分でデザイン力を向上する コミュニティと解説動画にアクセスしよう。",
  },
  feedback: {
    catch: "添削と相談で速く、迷いなく、深く成長しよう",
    description:
      "プロがデザインをフィードバック。成長したい、キャリアに不安がある人にピッタリ。",
  },
};

// ---- プラン説明（/plan 実データ）--------------------------------------------
// 移植元: src/app/dev/pricing-detail/data.ts

export const STANDARD = {
  type: "standard" as PlanType,
  name: "スタンダード",
  sub: "自分のペースで進める",
  /** プラン説明ブロック（Figma 43:4509）の主見出し。sub とは別に持つ。 */
  detailHeading: "スタンダードで自分のペースで成長しよう",
  description:
    "サブスクリプション制で閲覧、実践できます。自分のペースで学習できます。",
  ctaLabel: "スタンダードで始める",
  /** /plan フル6項目（薄くしないため厚く見せる用） */
  fullPoints: [
    "BONOのコンテンツ全て見放題",
    "コミュニティで質問可能",
    "自分のペースで自由に成長できる",
    "他メンバーと切磋琢磨するコミュニティ",
    "平均月1のワークショップに参加可能",
    "UIUX転職実績のあるコンテンツ",
  ],
} as const;

export const FEEDBACK = {
  type: "feedback" as PlanType,
  name: "フィードバック",
  sub: "添削で確実に成長したい人へ",
  /** プラン説明ブロック（Figma 43:4460）の主見出し。sub とは別に持つ。 */
  detailHeading: "フィードバックで確実に成長しよう",
  description:
    "コンテンツ見放題に加えて、月2回フィードバックや相談ができるプランです。悩む時間を減らして早く確実に成長したい人におすすめです",
  ctaLabel: "フィードバックで始める",
  secondaryCtaLabel: "内容を見る",
} as const;

// ---- 変化ストーリー（悩み → 解決の対比） -------------------------------------
//
// pain（悩み）→ solved（解決）の4対。Figma 43:4460 の変化リスト確定コピー。
// solved 側は /plan の「フィードバックで何が変化する？」実データ由来。

export interface ChangePair {
  /** 悩み側（term） */
  pain: string;
  /** 解決後（description） */
  solved: string;
}

export const CHANGE_PAIRS: ChangePair[] = [
  {
    pain: "独学だと、次に何をすべきか迷い続ける",
    solved: "悩む時間が減り、やることが明確に",
  },
  {
    pain: "自己流のまま、成長が頭打ちになる",
    solved: "進め方が改善して成長速度が上がる",
  },
  {
    pain: "自分のデザインの実力が分からない",
    solved: "自分のアウトプットレベルがわかる",
  },
  {
    pain: "現場でどう評価されるか不安",
    solved: "キャリアの悩みが現場目線でわかる",
  },
];
