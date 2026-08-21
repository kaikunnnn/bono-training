/**
 * 料金ページ「違いの見せ方」検討（D1/D2） — データ/純関数ヘルパ
 *
 * 目的: スタンダード↔フィードバックの違い（＝フィードバックはサポートが手厚い）の
 * 見せ方を D1（積み上げ式）/ D2（差分フォーカス比較表）で比較する。
 *
 * 価格の唯一の真実は AVAILABLE_PLANS（src/lib/subscription-utils.ts）。
 * ここでは価格リテラルを一切書かず、AVAILABLE_PLANS から view-model を算出する
 * 純関数のみを定義する（pricing-proto の data.ts と同等の作りだが import せず独立）。
 */
import { AVAILABLE_PLANS, getPlanDisplayName } from "@/lib/subscription-utils";
import type { PlanType, PlanDuration } from "@/types/subscription";
import {
  CalendarDays,
  Edit3,
  FileText,
  MessageCircle,
  Play,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

// ---- 確認用コントロールの軸/状態（クエリ値） --------------------------------

/** D0: 現行カード並列 / D1: 積み上げ式 / D2: 差分フォーカス比較表 */
export type DPattern = "D0" | "D1" | "D2";

export const D_PATTERNS: DPattern[] = ["D0", "D1", "D2"];

/** 既定パターン（D0＝現行のカード並列） */
export const DEFAULTS = {
  d: "D0" as DPattern,
};

/** このページで扱うプラン（standard / feedback の2種・この順） */
export const DIFF_PLAN_TYPES: PlanType[] = ["standard", "feedback"];

/** クエリ値のホワイトリスト検証（不正値は既定へフォールバック） */
export function parseDPattern(v: string | null): DPattern {
  return D_PATTERNS.includes(v as DPattern) ? (v as DPattern) : DEFAULTS.d;
}

// ---- 価格 view-model（AVAILABLE_PLANS から算出） ----------------------------

function findPlan(type: PlanType, duration: PlanDuration) {
  const plan = AVAILABLE_PLANS.find(
    (p) => p.type === type && p.duration === duration
  );
  if (!plan) {
    // 定義漏れは静かに握りつぶさず明示する（価格を捏造しない）
    throw new Error(`AVAILABLE_PLANS に定義がありません: ${type}/${duration}`);
  }
  return plan;
}

export interface PlanPriceView {
  type: PlanType;
  /** getPlanDisplayName 由来のプラン名（「スタンダード」「フィードバック」） */
  displayName: string;
  /** 1ヶ月プラン定義の description */
  description: string;
  /** 表示中の期間 */
  duration: PlanDuration;
  /** 表示中の期間の月額（税込） */
  monthlyForDuration: number;
  /** 1ヶ月（毎月払い）の月額 */
  monthly1m: number;
  /** 3ヶ月契約の月あたり */
  monthly3m: number;
  /** 3ヶ月契約の合計（月額 × duration） */
  total3m: number;
  /** 3ヶ月にした場合の月あたりお得額（1ヶ月 − 3ヶ月） */
  savingsPerMonth: number;
  /** 3ヶ月契約での節約総額（月あたりお得額 × duration） */
  savingsTotal3m: number;
}

/**
 * プランタイプと表示中の期間から価格 view-model を算出する。
 * 全ての数値は AVAILABLE_PLANS 由来で、価格リテラルは含まない。
 */
export function getPlanPriceView(
  type: PlanType,
  duration: PlanDuration
): PlanPriceView {
  const p1 = findPlan(type, 1);
  const p3 = findPlan(type, 3);
  const monthly1m = p1.pricePerMonth;
  const monthly3m = p3.pricePerMonth;
  const savingsPerMonth = monthly1m - monthly3m;

  return {
    type,
    displayName: getPlanDisplayName(type),
    description: p1.description,
    duration,
    monthlyForDuration: duration === 3 ? monthly3m : monthly1m,
    monthly1m,
    monthly3m,
    // duration は AVAILABLE_PLANS のプラン定義由来（3）。裸のリテラルにしない。
    total3m: monthly3m * p3.duration,
    savingsPerMonth,
    savingsTotal3m: savingsPerMonth * p3.duration,
  };
}

/** 通貨表示（桁区切り + ¥）。数値は算出済みのものを受け取る */
export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

/** CTA文言（「{プラン名}で始める」）。プラン名は getPlanDisplayName 由来 */
export function getCtaLabel(type: PlanType): string {
  return `${getPlanDisplayName(type)}で始める`;
}

// ---- 機能行（価格でないため文言リテラルOK） --------------------------------
//
// Figma(2026_Price) の feature-row 準拠。順番はこの通り（差分3つ → 共通）。
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
 * 差分3行（上）→ 共通4行（下）の固定順。
 * 差分（1〜3）は feedback 独自、共通（4〜6）は両プラン同一。
 * 7行目「勉強会(月1)」は Figma未記載（当初仕様由来）。共通の最後に置く（要確認）。
 */
export const FEATURE_ROWS: FeatureRow[] = [
  // --- 差分（feedback独自・上に置く） ---
  {
    label: "フィードバック / 相談",
    icon: Edit3,
    standard: "なし",
    feedback: "2回/月",
    group: "diff",
  },
  {
    label: "ポートフォリオ添削",
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
  // --- 共通（両プラン同じ・下に置く） ---
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
  // ⚠️ Figma未記載・要確認: 「勉強会(月1)」は Figma(2026_Price) には無く、
  // 当初仕様由来の共通機能。共通の最後に置いている（Figmaに追加すべきか要確認）。
  {
    label: "勉強会(月1)",
    icon: CalendarDays,
    standard: "参加可能",
    feedback: "参加可能",
    group: "common",
  },
];

/** 差分行のみ（group === "diff"） */
export const DIFF_ROWS: FeatureRow[] = FEATURE_ROWS.filter(
  (r) => r.group === "diff"
);

/** 共通行のみ（group === "common"） */
export const COMMON_ROWS: FeatureRow[] = FEATURE_ROWS.filter(
  (r) => r.group === "common"
);

export function featureValue(row: FeatureRow, type: PlanType): string {
  return type === "standard" ? row.standard : row.feedback;
}

/** その機能行の値が「提供なし」かどうか（アイコン/淡色表現に使う） */
export function isFeatureAbsent(value: string): boolean {
  return value === "なし";
}

// ---- ラベル（確認用コントロールUI用） --------------------------------------

export const OPTION_LABELS: {
  d: Record<DPattern, string>;
} = {
  d: {
    D0: "現行（カード並列）",
    D1: "D1 積み上げ",
    D2: "D2 比較表",
  },
};
