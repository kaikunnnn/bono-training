/**
 * 料金ページ 本番プロトタイプ — データ/純関数ヘルパ
 *
 * 価格の唯一の真実は AVAILABLE_PLANS（src/lib/subscription-utils.ts）。
 * ここでは価格リテラルを一切書かず、AVAILABLE_PLANS から view-model を算出する
 * 純関数のみを定義する（比較ラボの data.ts と同等の作りだが import せず独立）。
 */
import { AVAILABLE_PLANS, getPlanDisplayName } from "@/lib/subscription-utils";
import type { PlanType, PlanDuration } from "@/types/subscription";

// ---- 確認用コントロールの軸/状態（クエリ値） --------------------------------

/** A1: 通常レイアウト内 / A2: フォーカスシェル */
export type FrameOption = "A1" | "A2";
/** CTA状態（本番の課金状態を模擬） */
export type CtaState = "guest" | "free" | "other" | "current";

export const FRAME_OPTIONS: FrameOption[] = ["A1", "A2"];
export const CTA_STATES: CtaState[] = ["guest", "free", "other", "current"];

/** 既定値（frame=A2 は仕様指定。cta 既定は比較ラボに合わせ free） */
export const DEFAULTS = {
  frame: "A2" as FrameOption,
  cta: "free" as CtaState,
};

/** このページで扱うプラン（standard / feedback の2種・この順で対等表示） */
export const PROTO_PLAN_TYPES: PlanType[] = ["standard", "feedback"];

/** クエリ値のホワイトリスト検証（不正値は既定へフォールバック） */
export function parseFrame(v: string | null): FrameOption {
  return FRAME_OPTIONS.includes(v as FrameOption)
    ? (v as FrameOption)
    : DEFAULTS.frame;
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
  /** getPlanDisplayName 由来のプラン名（「スタンダード」「フィードバック」） */
  displayName: string;
  /** 1ヶ月プラン定義の description（3ヶ月の「割引」文言と重複しないよう1ヶ月側を使う） */
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

/** この7行・この順で固定（共通4行 → 差分3行） */
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
  { label: "フィードバック", standard: "なし", feedback: "2回/月", group: "diff" },
  { label: "ポートフォリオ添削", standard: "なし", feedback: "可能", group: "diff" },
  { label: "オンライン相談・添削", standard: "なし", feedback: "可能", group: "diff" },
];

export function featureValue(row: FeatureRow, type: PlanType): string {
  return type === "standard" ? row.standard : row.feedback;
}

/** その機能行の値が「提供なし」かどうか（Checkアイコンの有無に使う） */
export function isFeatureAbsent(value: string): boolean {
  return value === "なし";
}

// ---- CTA 文言/状態ヘルパ ----------------------------------------------------

export interface CtaView {
  label: string;
  disabled: boolean;
}

/**
 * CTA状態とプランタイプから、ボタンの文言と disabled を算出する。
 * - guest（未ログイン）は free（未課金）と統一し「{プラン名}で始める」
 * - current のときは standard を現行プランとみなし standard=disabled、feedback=「プラン変更」
 */
export function getCtaView(ctaState: CtaState, type: PlanType): CtaView {
  switch (ctaState) {
    case "guest":
    case "free":
      return { label: `${getPlanDisplayName(type)}で始める`, disabled: false };
    case "other":
      return { label: "プラン変更", disabled: false };
    case "current":
      return type === "standard"
        ? { label: "現在のプラン", disabled: true }
        : { label: "プラン変更", disabled: false };
    default:
      return { label: `${getPlanDisplayName(type)}で始める`, disabled: false };
  }
}

// ---- ラベル（確認用コントロールUI用） --------------------------------------

export const OPTION_LABELS: {
  frame: Record<FrameOption, string>;
  cta: Record<CtaState, string>;
} = {
  frame: {
    A1: "A1 通常",
    A2: "A2 フォーカス",
  },
  cta: {
    guest: "未ログイン",
    free: "未課金",
    other: "課金中(他)",
    current: "課金中(現行)",
  },
};
