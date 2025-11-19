import { PlanType } from './subscriptionPlans';

/**
 * プラン名と期間を統一フォーマットで表示
 *
 * @param planType - プランタイプ ('standard' | 'feedback' | 'community' | 'growth')
 * @param duration - 期間（1または3）
 * @returns フォーマットされた表示文字列
 *
 * @example
 * formatPlanDisplay('standard', 1) // => "スタンダード（1ヶ月）"
 * formatPlanDisplay('standard', 3) // => "スタンダード（3ヶ月）"
 * formatPlanDisplay('feedback', 1) // => "フィードバック（1ヶ月）"
 * formatPlanDisplay('community', null) // => "フリープラン"
 * formatPlanDisplay(null, null) // => "フリープラン"
 */
export function formatPlanDisplay(
  planType: PlanType | null,
  duration: number | null
): string {
  // フリープランの場合は期間を表示しない
  if (!planType || planType === 'community') {
    return 'フリープラン';
  }

  // プラン名のマッピング
  const planNames: Record<PlanType, string> = {
    standard: 'スタンダード',
    feedback: 'フィードバック',
    community: 'フリープラン',
    growth: 'グロース'
  };

  const planName = planNames[planType] || 'フリープラン';

  // 期間がある場合は追加
  if (duration) {
    return `${planName}（${duration}ヶ月）`;
  }

  // 期間がない場合はプラン名のみ
  return planName;
}

/**
 * 短縮形式のプラン表示（バッジ用など）
 *
 * @param planType - プランタイプ
 * @param duration - 期間（1または3）
 * @returns フォーマットされた短縮表示文字列
 *
 * @example
 * formatPlanBadge('standard', 3) // => "スタンダード（3ヶ月）"
 */
export function formatPlanBadge(
  planType: PlanType | null,
  duration: number | null
): string {
  // 現状は formatPlanDisplay と同じ
  // 将来的により短縮した形式が必要になった場合はここを変更
  return formatPlanDisplay(planType, duration);
}
