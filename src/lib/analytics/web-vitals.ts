import { trackEvent } from "@/lib/analytics";
import { isAnalyticsHost } from "./config";

/**
 * 実ユーザーのWeb Vitals（RUM）をGA4の単一イベントへ送る。
 *
 * 送信先は既存の本番GA4ストリーム（`GA_MEASUREMENT_ID`）。新しい測定IDは作らない。
 * hostガードは `isAnalyticsHost()` を再利用するため、localhost・previewでは送らない。
 *
 * 単位の約束:
 * - CLSは無次元の小数。GA4のイベントパラメータは整数の方が集計が安定するため
 *   `value * CLS_VALUE_MULTIPLIER`(=1000) を整数へ丸めて送る。
 *   例: CLS 0.083 → `metric_value` 83。分析時は必ず1000で割る。
 * - CLS以外（TTFB/FCP/LCP/INP）はミリ秒。倍率なしで整数へ丸める。
 * - `metric_delta` も同じ倍率・丸めを適用する。
 */

/** GA4上のイベント名。metric名はイベント名に混ぜず `metric_name` で持つ（低cardinality維持）。 */
export const WEB_VITALS_EVENT_NAME = "web_vitals";

/** CLSだけに適用する整数化倍率。分析時は1000で割る。 */
export const CLS_VALUE_MULTIPLIER = 1000;

/**
 * 扱うmetricのallowlist。
 * Next.jsの `useReportWebVitals` は内部で `onFID` も登録するが、FIDは廃止指標なので送らない。
 * Pages Routerの `Next.js-hydration` 等のカスタムmetricも対象外。
 */
export const REPORTED_METRIC_NAMES = ["TTFB", "FCP", "LCP", "CLS", "INP"] as const;
export type ReportedMetricName = (typeof REPORTED_METRIC_NAMES)[number];

export const ROUTE_GROUPS = [
  "top",
  "lesson",
  "article",
  "training",
  "questions",
  "mypage",
  "other",
] as const;
export type RouteGroup = (typeof ROUTE_GROUPS)[number];

/** `useReportWebVitals` が渡すmetricのうち、送信に使う範囲だけを型にする。 */
export interface WebVitalMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating?: string;
  navigationType?: string;
}

export interface WebVitalsEventParams {
  metric_name: ReportedMetricName;
  /** CLSは1000倍した整数。それ以外はms整数。 */
  metric_value: number;
  metric_id: string;
  metric_rating: string;
  /** 直前報告からの差分。metric_valueと同じ倍率。 */
  metric_delta: number;
  navigation_type: string;
  route_group: RouteGroup;
}

/**
 * pathnameを低cardinalityなグループへ畳む。slugとURL queryは絶対に含めない。
 *
 * - `article` は学習記事 `/contents/[slug]`。公開ブログの `/articles`・`/blog` は
 *   別レイアウトなので意図的に `other` に置く。
 * - `training` は引き継ぎ書の例には無いが、専用の性能改善履歴があり
 *   `other` に混ぜるとp75が読めなくなるため1グループだけ足している。
 * - グループを増やすときはこのテーブルと対応テストの両方を更新する。
 */
const ROUTE_PREFIX_GROUPS: ReadonlyArray<readonly [string, RouteGroup]> = [
  ["/top", "top"],
  ["/lessons", "lesson"],
  ["/contents", "article"],
  ["/training", "training"],
  ["/questions", "questions"],
  ["/mypage", "mypage"],
];

export function toRouteGroup(pathname: string): RouteGroup {
  // queryやhashが混ざった値を渡されても落とす。
  const path = (pathname.split("?")[0].split("#")[0] || "/").toLowerCase();
  // 会員トップ `/top` とゲストトップ `/` はどちらも top 扱い。
  if (path === "/") return "top";
  for (const [prefix, group] of ROUTE_PREFIX_GROUPS) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return group;
  }
  return "other";
}

function isReportedMetricName(name: string): name is ReportedMetricName {
  return (REPORTED_METRIC_NAMES as readonly string[]).includes(name);
}

function toIntegerValue(name: ReportedMetricName, value: number): number {
  return Math.round(name === "CLS" ? value * CLS_VALUE_MULTIPLIER : value);
}

/**
 * 送信パラメータを作る。対象外のmetric名なら `null`。
 *
 * SPAの注意: CLSとINPはページ寿命全体で累積するため、soft navigation後に届いた報告は
 * 「ずれが起きた画面」ではなく「報告時点の画面」の `route_group` を持つ。
 * LCP/FCP/TTFBはhard navigationのみの指標。これは仕様として受け入れ、補正しない。
 */
export function buildWebVitalsEventParams(
  metric: WebVitalMetric,
  pathname: string
): WebVitalsEventParams | null {
  if (!isReportedMetricName(metric.name)) return null;
  return {
    metric_name: metric.name,
    metric_value: toIntegerValue(metric.name, metric.value),
    metric_id: metric.id,
    metric_rating: metric.rating ?? "unknown",
    metric_delta: toIntegerValue(metric.name, metric.delta),
    navigation_type: metric.navigationType ?? "unknown",
    route_group: toRouteGroup(pathname),
  };
}

/**
 * 重複送信方針。
 *
 * Next.js 16は `reportAllChanges` を渡さないため、各metricは原則1ページロード1回だけ報告される。
 * ただしCLSとINPは visible→hidden を繰り返すと、同じ `metric_id` のまま
 * 「より大きい値」で再報告されることがある（web-vitalsは値が増えた時だけ再通知する）。
 *
 * そこで:
 * - 同じ `metric_id` で整数値が変わった報告は送る（累積値の最終形を取り逃がさない）。
 * - 同じ `metric_id` で整数値が同じ報告は送らない（同一行の重複を作らない）。
 * - 集計側は `metric_id` ごとに MAX(metric_value) を取ってから percentile を出す。
 *   `metric_id` はページロードごとに一意なので、これで1ページロード1サンプルになる。
 */
const lastSentValueByMetricId = new Map<string, number>();

/** テスト用。モジュールレベルの重複排除状態を捨てる。 */
export function resetWebVitalsDedupe(): void {
  lastSentValueByMetricId.clear();
}

const GTAG_RETRY_INTERVAL_MS = 250;
const GTAG_RETRY_LIMIT = 40;

/**
 * hostガードを通った本番でだけ送る。GA bootstrapは `afterInteractive` なので、
 * 早いTTFB/FCP報告がgtag未初期化に当たることがある。その場合だけ再試行する
 * （`lesson-intro.ts` と同じ方針。localhost・previewではタイマーも作らない）。
 */
function deliver(params: WebVitalsEventParams, attempt = 0): void {
  if (typeof window.gtag === "function") {
    const previous = lastSentValueByMetricId.get(params.metric_id);
    if (previous === params.metric_value) return;
    lastSentValueByMetricId.set(params.metric_id, params.metric_value);
    trackEvent(WEB_VITALS_EVENT_NAME, { ...params });
    return;
  }
  if (attempt < GTAG_RETRY_LIMIT) {
    window.setTimeout(() => deliver(params, attempt + 1), GTAG_RETRY_INTERVAL_MS);
  }
}

/** `useReportWebVitals` のcallback本体。参照を安定させるためモジュールスコープに置く。 */
export function reportWebVitalsMetric(metric: WebVitalMetric): void {
  if (typeof window === "undefined") return;
  if (!isAnalyticsHost(window.location.hostname)) return;
  const params = buildWebVitalsEventParams(metric, window.location.pathname);
  if (!params) return;
  deliver(params);
}
