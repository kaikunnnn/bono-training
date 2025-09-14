// プランIDの配列
const PLAN_IDS = [
  // StripeのプランIDを指定する必要がある
  process.env.NEXT_PUBLIC_STRIPE_S1M_PID,
  process.env.NEXT_PUBLIC_STRIPE_S3M_PID,
  process.env.NEXT_PUBLIC_STRIPE_G1M_PID,
  process.env.NEXT_PUBLIC_STRIPE_G3M_PID,
  // 他のプランIDもここに追加
];

// プランIDの配列を受け取り、1つの文字列にまとめて返す関数
const formatPlanIds = (planIds) => {
  return planIds.join(", ");
};

// PLAN_IDSを文字列に変換
const planIdsString = formatPlanIds(PLAN_IDS);

// PLAN_IDS配列、formatPlanIds関数、そしてplanIdsStringをエクスポート
export { PLAN_IDS, formatPlanIds, planIdsString };
