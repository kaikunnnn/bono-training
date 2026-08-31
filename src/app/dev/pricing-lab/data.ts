/**
 * 料金ページ構造パターン検証ラボ — データ/純関数ヘルパ
 *
 * 価格の唯一の真実は AVAILABLE_PLANS。ここでは価格リテラルを一切書かず、
 * AVAILABLE_PLANS から view-model を算出する純関数のみを定義する。
 */
import {
  AVAILABLE_PLANS,
  getPlanDisplayName,
} from "@/lib/subscription-utils";
import type { PlanType, PlanDuration } from "@/types/subscription";

// ---- 軸/状態の型（クエリ値） -------------------------------------------------

export type FrameOption = "A1" | "A2";
export type PlansOption = "B1" | "B2" | "B3" | "B4";
export type PeriodOption = "C1" | "C2" | "C3";
export type CtaState = "guest" | "free" | "other" | "current";

export const FRAME_OPTIONS: FrameOption[] = ["A1", "A2"];
export const PLANS_OPTIONS: PlansOption[] = ["B1", "B2", "B3", "B4"];
export const PERIOD_OPTIONS: PeriodOption[] = ["C1", "C2", "C3"];
export const CTA_STATES: CtaState[] = ["guest", "free", "other", "current"];

export const DEFAULTS = {
  frame: "A1" as FrameOption,
  plans: "B1" as PlansOption,
  period: "C1" as PeriodOption,
  cta: "free" as CtaState,
};

/** ラボで扱うプラン（standard/feedback の2種） */
export const LAB_PLAN_TYPES: PlanType[] = ["standard", "feedback"];

/** クエリ値のホワイトリスト検証（不正値は既定へフォールバック） */
export function parseFrame(v: string | null): FrameOption {
  return FRAME_OPTIONS.includes(v as FrameOption)
    ? (v as FrameOption)
    : DEFAULTS.frame;
}
export function parsePlans(v: string | null): PlansOption {
  return PLANS_OPTIONS.includes(v as PlansOption)
    ? (v as PlansOption)
    : DEFAULTS.plans;
}
export function parsePeriod(v: string | null): PeriodOption {
  return PERIOD_OPTIONS.includes(v as PeriodOption)
    ? (v as PeriodOption)
    : DEFAULTS.period;
}
export function parseCta(v: string | null): CtaState {
  return CTA_STATES.includes(v as CtaState) ? (v as CtaState) : DEFAULTS.cta;
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
  displayName: string; // getPlanDisplayName 由来
  description: string; // 1ヶ月定義の description 由来
  duration: PlanDuration; // 表示中の期間
  /** 表示中の期間の月額（税込） */
  monthlyForDuration: number;
  monthly1m: number;
  monthly3m: number;
  /** 3ヶ月契約の合計（月額 × duration） */
  total3m: number;
  /** 3ヶ月にした場合の月あたりのお得額（1ヶ月 − 3ヶ月） */
  savingsPerMonth: number;
  /** 3ヶ月契約での節約総額 */
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
    total3m: monthly3m * p3.duration,
    savingsPerMonth,
    savingsTotal3m: savingsPerMonth * p3.duration,
  };
}

/** 3ヶ月プランの契約月数（AVAILABLE_PLANS 由来。リテラルにしない） */
export function getThreeMonthDuration(): number {
  return findPlan("standard", 3).duration;
}

/** 通貨表示（桁区切り + ¥）。数値は算出済みのものを受け取る */
export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

// ---- 機能行（価格でないため文言リテラルOK） --------------------------------

export interface FeatureRow {
  label: string;
  standard: string;
  feedback: string;
  group: "common" | "diff";
}

/** この7行・この順で固定 */
export const FEATURE_ROWS: FeatureRow[] = [
  { label: "解説動画", standard: "見放題", feedback: "見放題", group: "common" },
  { label: "コミュニティ", standard: "参加", feedback: "参加", group: "common" },
  { label: "質問/相談", standard: "無制限", feedback: "無制限", group: "common" },
  {
    label: "勉強会(月1)",
    standard: "参加可能",
    feedback: "参加可能",
    group: "common",
  },
  {
    label: "フィードバック",
    standard: "なし",
    feedback: "2回/月",
    group: "diff",
  },
  {
    label: "ポートフォリオ添削",
    standard: "なし",
    feedback: "可能",
    group: "diff",
  },
  {
    label: "オンライン相談・添削",
    standard: "なし",
    feedback: "可能",
    group: "diff",
  },
];

export function featureValue(row: FeatureRow, type: PlanType): string {
  return type === "standard" ? row.standard : row.feedback;
}

// ---- ペルソナ文（価格でないため文言リテラルOK） ----------------------------

export const PLAN_PERSONA: Record<PlanType, string> = {
  standard: "自分のペースで学習を進めたい方",
  feedback: "添削・フィードバックで確実に伸ばしたい方",
};

// ---- CTA 文言/状態ヘルパ ----------------------------------------------------

export interface CtaView {
  label: string;
  disabled: boolean;
}

/**
 * CTA状態とプランタイプから、ボタンの文言と disabled を算出する。
 * cta=current のときは standard を現行プランとみなす。
 */
export function getCtaView(ctaState: CtaState, type: PlanType): CtaView {
  switch (ctaState) {
    case "guest":
      return { label: "ログインして始める", disabled: false };
    case "free":
      return { label: `${getPlanDisplayName(type)}で始める`, disabled: false };
    case "other":
      return { label: "プラン変更", disabled: false };
    case "current":
      // standard を現行プランとみなす
      return type === "standard"
        ? { label: "現在のプラン", disabled: true }
        : { label: "プラン変更", disabled: false };
    default:
      return { label: `${getPlanDisplayName(type)}で始める`, disabled: false };
  }
}

// ---- ラベル（コントロールUI用） --------------------------------------------

export const OPTION_LABELS: {
  frame: Record<FrameOption, string>;
  plans: Record<PlansOption, string>;
  period: Record<PeriodOption, string>;
  cta: Record<CtaState, string>;
} = {
  frame: {
    A1: "A1 通常",
    A2: "A2 フォーカス",
  },
  plans: {
    B1: "B1 カード並列",
    B2: "B2 ペルソナ分岐",
    B3: "B3 比較表",
    B4: "B4 タブ集中",
  },
  period: {
    C1: "C1 上部トグル",
    C2: "C2 カード内",
    C3: "C3 3ヶ月既定",
  },
  cta: {
    guest: "未ログイン",
    free: "未課金",
    other: "課金中(他)",
    current: "課金中(現行)",
  },
};

export const PATTERN_TITLES: Record<PlansOption, string> = {
  B1: "カード並列（B1）",
  B2: "ペルソナ分岐（B2）",
  B3: "比較表（B3）",
  B4: "タブ集中（B4）",
};
