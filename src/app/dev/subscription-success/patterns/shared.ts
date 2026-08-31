/**
 * 課金完了ページ改善パターンの共有モック / 暫定定数（/dev 検討用）
 *
 * ⚠️ 暫定: オンボーディングレッスンは CMS 未作成のため、CTA の飛び先は
 * プレースホルダ slug を置いている。本番反映時は以下を差し替える:
 * - オンボーディングレッスンの先頭記事へディープリンク（/contents/{firstArticleSlug}）
 * - 定数の置き場所は本番では src/lib（external-links.ts 隣接 or onboarding.ts）を想定
 */

import type { PlanType } from "@/types/subscription";

/** 暫定: オンボーディングレッスンの入口（本番は先頭記事 /contents/{slug} へ差し替え） */
export const ONBOARDING_ENTRY_HREF = "/lessons/bono-onboarding";

/** アカウント設定 */
export const ACCOUNT_HREF = "/account";

/** 7日間オンボーディングでやることのチラ見せ（完了ページでは非リンク） */
export interface OnboardingPeek {
  day: string;
  title: string;
  detail: string;
}

export const ONBOARDING_PEEKS: OnboardingPeek[] = [
  {
    day: "Day 1-2",
    title: "コミュニティ（Slack）に参加する",
    detail: "仲間とつながって、つまずきを相談できる場所を用意します。",
  },
  {
    day: "Day 3-4",
    title: "質問・相談を1回やってみる",
    detail: "小さな疑問でOK。聞くことに慣れると学習が一気に進みます。",
  },
  {
    day: "Day 5-7",
    title: "コンテンツを進める計画を立てる",
    detail: "ゴールから逆算して、身につけるスキルの順番を決めます。",
  },
];

/** プレビュー用モックデータ */
export interface PreviewMock {
  planType: PlanType;
  planLabel: string;
  durationLabel: string;
  /** 次回更新日（表示用に整形済み文字列） */
  renewalDate: string;
}

export const MOCK: PreviewMock = {
  planType: "standard",
  planLabel: "スタンダードプラン",
  durationLabel: "1ヶ月",
  renewalDate: "2026年9月7日",
};
