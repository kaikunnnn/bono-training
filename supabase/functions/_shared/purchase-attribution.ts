/**
 * 課金の出どころ（アトリビューション）の整形・検証・保存ルール（rebono issue #233 / D3）。
 *
 * 2つの情報を決済（Stripe metadata → user_subscriptions）まで持ち回る:
 *   - source_path: 料金ページへのボタンを押したページのパス（last-click。source_group の相棒）
 *   - first_touch_*: サイトに初めて来たときの入口（パス・?yt=・utm_*・参照元ドメイン・日時）
 *
 * 個人情報は残さない:
 *   - パスはクエリ・ハッシュを捨て、許可した文字だけ・200文字まで
 *   - クエリは yt と utm_* だけ拾い、それ以外は捨てる。'@' を含む値（メールアドレス等）は捨てる
 *   - 参照元はホスト名だけ（document.referrer のパス・クエリは捨てる）
 *
 * import を持たない純粋モジュール（Deno の Edge Function / Next.js アプリ / Vitest のどこからも読める）。
 * アプリ側（src/lib/first-touch.ts, src/lib/pricing-source.ts）もこのファイルを直接使い、
 * 同じ整形をブラウザ（保存前）と Edge Function（Stripe に載せる前）で二重にかける。
 */

/** パスの最大長（DB の CHECK 制約と同じ） */
export const ATTRIBUTION_PATH_MAX = 200;
/** yt の最大長 */
export const ATTRIBUTION_YT_MAX = 64;
/** utm_* の最大長 */
export const ATTRIBUTION_UTM_MAX = 100;
/** 参照元ホスト名の最大長 */
export const ATTRIBUTION_HOST_MAX = 100;

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

/** user_subscriptions の列名 = Stripe metadata のキー（40文字以内） */
export const ATTRIBUTION_COLUMNS = [
  "source_path",
  "first_touch_path",
  "first_touch_yt",
  "first_touch_utm_source",
  "first_touch_utm_medium",
  "first_touch_utm_campaign",
  "first_touch_utm_content",
  "first_touch_utm_term",
  "first_touch_referrer_host",
  "first_touch_at",
] as const;
export type AttributionColumn = (typeof ATTRIBUTION_COLUMNS)[number];
export type AttributionRecord = Record<AttributionColumn, string | null>;

/** 最初に来たページの記録（ブラウザの localStorage に保存する形） */
export interface FirstTouch {
  path: string | null;
  yt: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer_host: string | null;
  /** 記録した日時（ISO 8601） */
  at: string;
}

// ---------------------------------------------------------------------------
// 値の整形（不正値は null）
// ---------------------------------------------------------------------------

const PATH_PATTERN = /^\/[A-Za-z0-9\-._~/%]*$/;

/**
 * ページのパスを整形する。
 * - クエリ（?）・ハッシュ（#）以降は捨てる
 * - "/" で始まらない・"//" で始まる（別ホスト扱いされうる）・許可外の文字（空白・制御文字・
 *   非ASCII の生文字など）を含むものは null。非ASCIIはパーセントエンコード済みで渡す
 * - 200文字で切り詰める（%XX の途中で切れたら、その欠片も落とす）
 */
export function normalizeAttributionPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let path = value.trim();
  const cut = path.search(/[?#]/);
  if (cut >= 0) path = path.slice(0, cut);
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (!PATH_PATTERN.test(path)) return null;
  if (path.length > ATTRIBUTION_PATH_MAX) {
    path = path.slice(0, ATTRIBUTION_PATH_MAX).replace(/%[0-9A-Fa-f]?$/, "");
  }
  return path;
}

const YT_PATTERN = /^[A-Za-z0-9_\-.]+$/;

/** YouTube の印（?yt=）。英数と _ - . のみ・64文字まで。それ以外は null */
export function normalizeYt(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const yt = value.trim();
  if (!yt || yt.length > ATTRIBUTION_YT_MAX) return null;
  return YT_PATTERN.test(yt) ? yt : null;
}

// 文字（日本語可）・数字・空白・_ - . + : / だけ。'@'（メールアドレス）や記号は不可
// （アプリの tsconfig target が ES2017 のため、Unicode プロパティは RegExp コンストラクタで書く）
const UTM_PATTERN = new RegExp("^[\\p{L}\\p{N} _\\-.+:/]+$", "u");

/** utm_* の値。100文字に切り詰め、許可外の文字を含むものは null */
export function normalizeUtmValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().slice(0, ATTRIBUTION_UTM_MAX).trim();
  if (!v) return null;
  return UTM_PATTERN.test(v) ? v : null;
}

const HOST_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*$/;

/** 参照元のホスト名（小文字化）。ホスト名として不正・100文字超は null */
export function normalizeReferrerHost(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const host = value.trim().toLowerCase().replace(/\.$/, "");
  if (!host || host.length > ATTRIBUTION_HOST_MAX) return null;
  return HOST_PATTERN.test(host) ? host : null;
}

/** 2020年以降〜現在+1日の日時なら ISO 文字列、それ以外は null */
export function normalizeAttributionTimestamp(
  value: unknown,
  now: Date = new Date()
): string | null {
  if (typeof value !== "string" || value.length > 40) return null;
  const t = Date.parse(value);
  if (Number.isNaN(t)) return null;
  if (t < Date.UTC(2020, 0, 1)) return null;
  if (t > now.getTime() + 24 * 60 * 60 * 1000) return null;
  return new Date(t).toISOString();
}

/** document.referrer（URL全体）からホスト名だけ取り出す。自サイトは null */
export function extractReferrerHost(
  referrer: unknown,
  ownHost?: string | null
): string | null {
  if (typeof referrer !== "string" || !referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = normalizeReferrerHost(url.hostname);
    if (!host) return null;
    if (ownHost && host === ownHost.toLowerCase()) return null;
    return host;
  } catch {
    return null;
  }
}

/** 何か1つでも値を持つ FirstTouch を整形し直す（at が不正なら全体を捨てる） */
export function normalizeFirstTouch(
  value: unknown,
  now: Date = new Date()
): FirstTouch | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const at = normalizeAttributionTimestamp(v.at, now);
  if (!at) return null;
  return {
    path: normalizeAttributionPath(v.path),
    yt: normalizeYt(v.yt),
    utm_source: normalizeUtmValue(v.utm_source),
    utm_medium: normalizeUtmValue(v.utm_medium),
    utm_campaign: normalizeUtmValue(v.utm_campaign),
    utm_content: normalizeUtmValue(v.utm_content),
    utm_term: normalizeUtmValue(v.utm_term),
    referrer_host: normalizeReferrerHost(v.referrer_host),
    at,
  };
}

// ---------------------------------------------------------------------------
// Edge Function（create-checkout）: Stripe metadata に載せる値
// ---------------------------------------------------------------------------

/**
 * クライアントから受けた値を再検証し、Stripe metadata 用の {キー: 値} を作る。
 * 値が無いキーは入れない（Stripe metadata は文字列のみ・50キー/キー40字/値500字の制限内）。
 */
export function buildAttributionMetadata(
  input: { sourcePath?: unknown; firstTouch?: unknown },
  now: Date = new Date()
): Partial<Record<AttributionColumn, string>> {
  const out: Partial<Record<AttributionColumn, string>> = {};
  const sourcePath = normalizeAttributionPath(input.sourcePath);
  if (sourcePath) out.source_path = sourcePath;
  const ft = normalizeFirstTouch(input.firstTouch, now);
  if (ft) {
    if (ft.path) out.first_touch_path = ft.path;
    if (ft.yt) out.first_touch_yt = ft.yt;
    if (ft.utm_source) out.first_touch_utm_source = ft.utm_source;
    if (ft.utm_medium) out.first_touch_utm_medium = ft.utm_medium;
    if (ft.utm_campaign) out.first_touch_utm_campaign = ft.utm_campaign;
    if (ft.utm_content) out.first_touch_utm_content = ft.utm_content;
    if (ft.utm_term) out.first_touch_utm_term = ft.utm_term;
    if (ft.referrer_host) out.first_touch_referrer_host = ft.referrer_host;
    out.first_touch_at = ft.at;
  }
  return out;
}

// ---------------------------------------------------------------------------
// stripe-webhook: user_subscriptions に保存する値
// ---------------------------------------------------------------------------

/** metadata（未検証）から列ごとの値を取り出して整形する。不正・無しは null */
export function parseAttributionMetadata(
  metadata: Record<string, unknown> | null | undefined,
  now: Date = new Date()
): AttributionRecord {
  const m = metadata ?? {};
  return {
    source_path: normalizeAttributionPath(m.source_path),
    first_touch_path: normalizeAttributionPath(m.first_touch_path),
    first_touch_yt: normalizeYt(m.first_touch_yt),
    first_touch_utm_source: normalizeUtmValue(m.first_touch_utm_source),
    first_touch_utm_medium: normalizeUtmValue(m.first_touch_utm_medium),
    first_touch_utm_campaign: normalizeUtmValue(m.first_touch_utm_campaign),
    first_touch_utm_content: normalizeUtmValue(m.first_touch_utm_content),
    first_touch_utm_term: normalizeUtmValue(m.first_touch_utm_term),
    first_touch_referrer_host: normalizeReferrerHost(m.first_touch_referrer_host),
    first_touch_at: normalizeAttributionTimestamp(m.first_touch_at, now),
  };
}

/**
 * 複数の metadata（例: checkout session → subscription の順）をキーごとに先勝ちで合成する。
 * webhook のイベント順序に依存しないよう、create-checkout は両方に同じ値を載せている。
 */
export function mergeAttributionMetadata(
  ...sources: Array<Record<string, unknown> | null | undefined>
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const key of ATTRIBUTION_COLUMNS) {
    for (const src of sources) {
      const v = src?.[key];
      if (v !== undefined && v !== null && v !== "") {
        merged[key] = v;
        break;
      }
    }
  }
  return merged;
}

export interface AttributionPatchInput {
  /** user_subscriptions の既存行（無ければ null） */
  existing:
    | ({ stripe_subscription_id?: string | null } & Partial<
        Record<AttributionColumn, string | null>
      >)
    | null;
  /** 今回のイベントの Stripe subscription id */
  incomingSubscriptionId: string | null | undefined;
  /** 今回のイベントの metadata（未検証） */
  incomingMetadata: Record<string, unknown> | null | undefined;
  /** 既存契約の置き換え（checkout の replace_subscription_id）＝プラン変更扱い */
  isReplacement?: boolean;
  now?: Date;
}

/**
 * user_subscriptions の upsert に混ぜるアトリビューション列のパッチを決める。
 * ルールは resolveSourceGroupPatch（_shared/pricing-source.ts）と同じ:
 *
 * - プラン変更（置き換え checkout）→ 触らない（元の契約の記録を保持）
 * - 行が無い／保存済みと違う subscription id（=新しい契約。解約後の再入会を含む）
 *   → 全列を今回の値で上書き。値が無い列は null
 * - 同じ subscription（created と checkout.completed の重複・更新）
 *   → 列ごとに、既存値があれば保持。既存が null で今回の値があれば書く
 *
 * 返り値を upsert ペイロードにスプレッドする（空オブジェクト＝触らない）。
 */
export function resolveAttributionPatch(
  input: AttributionPatchInput
): Partial<AttributionRecord> {
  if (input.isReplacement) return {};
  if (!input.incomingSubscriptionId) return {};
  const incoming = parseAttributionMetadata(input.incomingMetadata, input.now);
  const existingSubId = input.existing?.stripe_subscription_id ?? null;
  const isNewSubscription =
    !input.existing ||
    !existingSubId ||
    existingSubId !== input.incomingSubscriptionId;
  if (isNewSubscription) return incoming;
  const patch: Partial<AttributionRecord> = {};
  for (const key of ATTRIBUTION_COLUMNS) {
    const existingValue = input.existing?.[key];
    const hasExisting =
      existingValue !== null && existingValue !== undefined && existingValue !== "";
    if (!hasExisting && incoming[key] !== null) patch[key] = incoming[key];
  }
  return patch;
}
