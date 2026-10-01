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
