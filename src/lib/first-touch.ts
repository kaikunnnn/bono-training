/**
 * 最初に来たページ（first touch）の記録（rebono issue #233 / D3）。
 *
 * - サイトに初めて来たときの入口パス・?yt=・utm_*・参照元ドメイン・日時を記録し、
 *   決済時に create-checkout へ渡して Stripe metadata → user_subscriptions に残す。
 * - 保存先は 1st party の localStorage（cookie と違い毎リクエストでサーバーへ送られない。
 *   読むのは決済ボタンを押したときのブラウザだけなので cookie にする理由がない）。
 * - 既にあれば上書きしない（write-once）。有効期間は 90 日（GA4 のキーイベントの
 *   既定のアトリビューション期間と同じ）。期限切れなら新しい入口で記録し直す。
 * - 限界: 別の端末・ブラウザで課金した人はつながらない。Safari は操作の無い状態が7日続くと
 *   スクリプトで書いた保存領域を消す（WebKit ITP）。プライベートブラウズでも残らない。
 * - 値の整形は supabase/functions/_shared/purchase-attribution.ts（Edge Function と同じ実装）。
 * - localStorage へのアクセスは try/catch で包み、失敗しても例外を出さない。
 */
import {
  extractReferrerHost,
  normalizeAttributionPath,
  normalizeFirstTouch,
  normalizeUtmValue,
  normalizeYt,
  UTM_KEYS,
  type FirstTouch,
} from "../../supabase/functions/_shared/purchase-attribution";

export type { FirstTouch };

export const FIRST_TOUCH_STORAGE_KEY = "bono_first_touch";

/** 90日 */
export const FIRST_TOUCH_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * 入口の URL から first touch の記録を作る（純粋関数）。
 * パス以外のクエリは yt と utm_* だけ拾い、他は捨てる。参照元はホスト名だけ（自サイトは null）。
 */
export function buildFirstTouch(input: {
  /** location.href（パスは location.pathname 由来の %エンコード済みを使う） */
  href: string;
  /** document.referrer */
  referrer: string | null | undefined;
  now: Date;
}): FirstTouch | null {
  let url: URL;
  try {
    url = new URL(input.href);
  } catch {
    return null;
  }
  const params = url.searchParams;
  const utm = Object.fromEntries(
    UTM_KEYS.map((key) => [key, normalizeUtmValue(params.get(key))])
  ) as Record<(typeof UTM_KEYS)[number], string | null>;
  return {
    path: normalizeAttributionPath(url.pathname),
    yt: normalizeYt(params.get("yt")),
    ...utm,
    referrer_host: extractReferrerHost(input.referrer, url.hostname),
    at: input.now.toISOString(),
  };
}

/** 保存済みの文字列を読んで整形し直す（純粋関数）。不正・期限切れは null */
export function parseStoredFirstTouch(
  raw: string | null | undefined,
  now: Date
): FirstTouch | null {
  if (!raw) return null;
  try {
    const ft = normalizeFirstTouch(JSON.parse(raw), now);
    if (!ft) return null;
    if (now.getTime() - Date.parse(ft.at) > FIRST_TOUCH_TTL_MS) return null;
    return ft;
  } catch {
    return null;
  }
}

/** 新しく記録すべきか（純粋関数）。有効な記録が既にあれば false（上書きしない） */
export function shouldWriteFirstTouch(
  raw: string | null | undefined,
  now: Date
): boolean {
  return parseStoredFirstTouch(raw, now) === null;
}

/** 初回来訪時に一度だけ記録する。既にあれば何もしない */
export function captureFirstTouch(): void {
  if (typeof window === "undefined") return;
  try {
    const now = new Date();
    const storage = window.localStorage;
    if (!shouldWriteFirstTouch(storage.getItem(FIRST_TOUCH_STORAGE_KEY), now)) {
      return;
    }
    const ft = buildFirstTouch({
      href: window.location.href,
      referrer: document.referrer,
      now,
    });
    if (!ft) return;
    storage.setItem(FIRST_TOUCH_STORAGE_KEY, JSON.stringify(ft));
  } catch {
    // localStorage が使えない環境では記録しない（不明として扱われる）
  }
}

/** 決済時に読む。無し・不正・期限切れ・読めない場合は null */
export function readFirstTouch(): FirstTouch | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredFirstTouch(
      window.localStorage.getItem(FIRST_TOUCH_STORAGE_KEY),
      new Date()
    );
  } catch {
    return null;
  }
}
