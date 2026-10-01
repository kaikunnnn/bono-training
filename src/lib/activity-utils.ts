/**
 * 会員の活動ログ（member_activity_events / #213 A1）の純粋ユーティリティ。
 *
 * - event_type は DB の CHECK 制約と同じ8種のみ（勝手に増やさない）
 * - Server Action（src/lib/services/activity.ts）が入力の検証・整形に使う
 * - "use server" ファイルは async 関数しか export できないため、定数・型・純粋関数はここに置く
 */

export const ACTIVITY_EVENT_TYPES = [
  "site_visit",
  "article_view",
  "article_complete",
  "lesson_view",
  "questions_view",
  "community_join_click",
  "success_next_click",
  "pricing_cta_click",
] as const;

export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export function isActivityEventType(value: unknown): value is ActivityEventType {
  return (
    typeof value === "string" &&
    (ACTIVITY_EVENT_TYPES as readonly string[]).includes(value)
  );
}

export interface RecordActivityInput {
  eventType: ActivityEventType;
  articleId?: string | null;
  lessonId?: string | null;
  path?: string | null;
  meta?: Record<string, unknown>;
}

/** insert する行（user_id はサーバー側で付与。occurred_at / jst_date は DB の default） */
export interface ActivityRow {
  event_type: ActivityEventType;
  article_id: string | null;
  lesson_id: string | null;
  path: string | null;
  meta: Record<string, unknown>;
}

const MAX_ID_LENGTH = 200;
const MAX_PATH_LENGTH = 500;
const MAX_META_BYTES = 2000;

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function normalizeMeta(value: unknown): Record<string, unknown> | null {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) return null;
  try {
    const json = JSON.stringify(value);
    if (json.length > MAX_META_BYTES) return null;
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Server Action の入力を検証して insert 用の行にする。
 * Server Action は外部から任意の値で呼べるため、型を信用せずここで弾く。
 * 不正なら null（呼び出し側は記録しない）。
 */
export function buildActivityRow(input: unknown): ActivityRow | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  if (!isActivityEventType(raw.eventType)) return null;
  const meta = normalizeMeta(raw.meta);
  if (meta === null) return null;
  return {
    event_type: raw.eventType,
    article_id: normalizeText(raw.articleId, MAX_ID_LENGTH),
    lesson_id: normalizeText(raw.lessonId, MAX_ID_LENGTH),
    path: normalizeText(raw.path, MAX_PATH_LENGTH),
    meta,
  };
}

/** 日本時間の日付（YYYY-MM-DD）。DB の jst_date と同じ基準 */
export function toJstDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// ===== 料金ページ（/subscription）への CTA の出どころ（P1 の9グループ） =====

export const PRICING_CTA_SOURCE_GROUPS = [
  "lesson_lock",
  "content_lock",
  "roadmap",
  "feedback",
  "questions",
  "top",
  "nav",
  "event",
  "other",
] as const;

export type PricingCtaSourceGroup = (typeof PRICING_CTA_SOURCE_GROUPS)[number];

export function isPricingCtaSourceGroup(
  value: unknown
): value is PricingCtaSourceGroup {
  return (
    typeof value === "string" &&
    (PRICING_CTA_SOURCE_GROUPS as readonly string[]).includes(value)
  );
}

/**
 * 料金ページへの href に `from=<source_group>` を付ける。
 * 既にクエリがあれば `&` で足し、既存の from は上書きする。hash は保持する。
 * 不正な group は "other" に丸める。
 */
export function withPricingFrom(
  href: string,
  group: PricingCtaSourceGroup
): string {
  const safeGroup: PricingCtaSourceGroup = isPricingCtaSourceGroup(group)
    ? group
    : "other";
  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const queryIndex = withoutHash.indexOf("?");
  const pathname =
    queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const params = new URLSearchParams(
    queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : ""
  );
  params.set("from", safeGroup);
  return `${pathname}?${params.toString()}${hash}`;
}

/** URL の `from` を source_group として読む。不正・無しは undefined */
export function parsePricingFrom(
  value: string | null | undefined
): PricingCtaSourceGroup | undefined {
  return isPricingCtaSourceGroup(value) ? value : undefined;
}
