/**
 * 料金ページ（/subscription）の出どころ（source_group）を決済まで持ち回るための
 * クライアント側の保存/読み出し（#213 A2 / 213-B P1 案B）。
 *
 * - 保存先は1st party cookie。sessionStorage だとメール確認リンクを別タブで開いた
 *   signup → intent 自動 checkout の経路で消えるため cookie にする。
 * - 最後に押したボタン1つ（last-click）: 有効な `from` を見たときだけ上書きする。
 *   `from` 無し・不正な値では何もしない（ログイン/登録後に from 無しで /subscription に
 *   戻ってくるため、ここで消すと持ち回りが切れる）。
 * - 値は9グループ（PRICING_CTA_SOURCE_GROUPS）のみ。読み出し時も再検証する。
 * - 無ければ null（=直接/不明。9グループに "direct" は作らない）。
 * - document.cookie へのアクセスは try/catch で包み、失敗しても例外を出さない。
 */
import {
  isPricingCtaSourceGroup,
  type PricingCtaSourceGroup,
} from "@/lib/activity-utils";
import { normalizeAttributionPath } from "../../supabase/functions/_shared/purchase-attribution";

export const PRICING_SOURCE_COOKIE = "bono_pricing_from";

/** 7日。メール確認・ログインの往復と Stripe 決済をまたいでも残る長さ */
export const PRICING_SOURCE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** Set-Cookie 用の文字列を作る（純粋関数）。不正な group は null */
export function buildPricingSourceCookie(
  group: unknown,
  secure: boolean
): string | null {
  if (!isPricingCtaSourceGroup(group)) return null;
  const parts = [
    `${PRICING_SOURCE_COOKIE}=${group}`,
    "Path=/",
    `Max-Age=${PRICING_SOURCE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

/** document.cookie 形式の文字列から source_group を読む（純粋関数）。不正・無しは null */
export function parsePricingSourceCookie(
  cookieString: string | null | undefined
): PricingCtaSourceGroup | null {
  if (!cookieString) return null;
  for (const part of cookieString.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const name = part.slice(0, eq).trim();
    if (name !== PRICING_SOURCE_COOKIE) continue;
    const value = part.slice(eq + 1).trim();
    return isPricingCtaSourceGroup(value) ? value : null;
  }
  return null;
}

/**
 * 料金ページで見た `from` を保存する（last-click）。
 * 有効な group のときだけ上書き。無効・無しは何もしない（既存値を消さない）。
 */
export function rememberPricingSource(from: unknown): void {
  if (typeof document === "undefined") return;
  try {
    const secure =
      typeof window !== "undefined" && window.location.protocol === "https:";
    const cookie = buildPricingSourceCookie(from, secure);
    if (!cookie) return;
    document.cookie = cookie;
  } catch {
    // cookie が使えない環境では持ち回らない（直接/不明として扱われる）
  }
}

/** 保存済みの source_group を読む。無し・不正・読めない場合は null */
export function readPricingSource(): PricingCtaSourceGroup | null {
  if (typeof document === "undefined") return null;
  try {
    return parsePricingSourceCookie(document.cookie);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// ボタンを押したページのパス（source_path・rebono issue #233 / D3）
//
// 料金ページへの導線は PricingCtaLink 以外にも router.push / Sidebar / Footer / モーダル等が
// あり、クリック地点で拾うと漏れる。そこで全ページ共通のトラッカー（AttributionTracker）が
// 「料金ページ・認証ページ以外で最後に表示したパス」を sessionStorage に記録し、
// 料金ページで有効な `from` を見た瞬間（= rememberPricingSource と同じタイミング）に
// その値を cookie に写す。cookie にするのは source_group と同じ理由（メール確認リンクを
// 別タブで開く signup → intent 自動 checkout の経路で sessionStorage は届かないため）。
// group と path は必ず同時に更新する（path が取れなければ path の cookie を消して、
// 古いページと新しい group の組み合わせが残らないようにする）。
// ---------------------------------------------------------------------------

export const PRICING_SOURCE_PATH_COOKIE = "bono_pricing_path";
export const LAST_PAGE_PATH_STORAGE_KEY = "bono_last_page_path";

/** 料金ページ・認証まわり（ボタンを押したページにはならない）のパスの接頭辞 */
const NON_SOURCE_PATH_PREFIXES = [
  "/subscription",
  "/dev/pricing-final",
  "/login",
  "/signup",
  "/forgot-password",
  "/auth",
];

/** ボタンを押したページとして記録してよいパスか（純粋関数） */
export function isAttributableSourcePath(path: string): boolean {
  return !NON_SOURCE_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

/** パスの Set-Cookie 文字列を作る（純粋関数）。不正なパスは null */
export function buildPricingSourcePathCookie(
  path: unknown,
  secure: boolean
): string | null {
  const safe = normalizeAttributionPath(path);
  if (!safe || !isAttributableSourcePath(safe)) return null;
  const parts = [
    `${PRICING_SOURCE_PATH_COOKIE}=${encodeURIComponent(safe)}`,
    "Path=/",
    `Max-Age=${PRICING_SOURCE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

/** document.cookie 形式の文字列からパスを読む（純粋関数）。不正・無しは null */
export function parsePricingSourcePathCookie(
  cookieString: string | null | undefined
): string | null {
  if (!cookieString) return null;
  for (const part of cookieString.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== PRICING_SOURCE_PATH_COOKIE) continue;
    try {
      const safe = normalizeAttributionPath(
        decodeURIComponent(part.slice(eq + 1).trim())
      );
      return safe && isAttributableSourcePath(safe) ? safe : null;
    } catch {
      return null;
    }
  }
  return null;
}

/** 表示したページのパスを記録する（AttributionTracker から毎ページ呼ぶ） */
export function recordPagePath(path: string): void {
  if (typeof window === "undefined") return;
  try {
    const safe = normalizeAttributionPath(path);
    if (!safe || !isAttributableSourcePath(safe)) return;
    window.sessionStorage.setItem(LAST_PAGE_PATH_STORAGE_KEY, safe);
  } catch {
    // sessionStorage が使えない環境では記録しない
  }
}

/** 同一オリジンの document.referrer からパスを取る（フルリロードで来た場合の予備） */
function sameOriginReferrerPath(): string | null {
  try {
    if (!document.referrer) return null;
    const ref = new URL(document.referrer);
    if (ref.origin !== window.location.origin) return null;
    return ref.pathname;
  } catch {
    return null;
  }
}

/**
 * 料金ページで有効な `from` を見たときに呼ぶ。直前のページのパスを cookie に写す。
 * 取れなければ path の cookie を消す（group と組がずれないように）。
 */
export function rememberPricingSourcePath(): void {
  if (typeof document === "undefined") return;
  try {
    let last: string | null = null;
    try {
      last = window.sessionStorage.getItem(LAST_PAGE_PATH_STORAGE_KEY);
    } catch {
      last = null;
    }
    const secure = window.location.protocol === "https:";
    const cookie =
      buildPricingSourcePathCookie(last, secure) ??
      buildPricingSourcePathCookie(sameOriginReferrerPath(), secure);
    document.cookie =
      cookie ?? `${PRICING_SOURCE_PATH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    // cookie が使えない環境では持ち回らない
  }
}

/** 保存済みのパスを読む。無し・不正・読めない場合は null */
export function readPricingSourcePath(): string | null {
  if (typeof document === "undefined") return null;
  try {
    return parsePricingSourcePathCookie(document.cookie);
  } catch {
    return null;
  }
}
