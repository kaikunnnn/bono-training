/**
 * オンボーディング導線の定数
 *
 * 課金完了（新規加入）画面の主役CTA「使い方をセットアップする」の遷移先。
 * オンボーディングレッスン「BONOのはじめかた」(slug: bono-onboarding) へ直接飛ばす。
 *
 * ここ1箇所を変えれば導線が切り替わる:
 * - レッスンハブ（6記事の一覧）: /lessons/bono-onboarding
 * - 先頭記事へ直接（1歩目）:     /contents/bono-onboarding-community
 */
export const ONBOARDING_ENTRY_HREF = "/lessons/bono-onboarding";
