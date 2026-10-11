// src/lib/seo/googlebot.ts — リクエストが「確認済みの Googlebot」か（#236 / rebono#18）
//
// 会員限定記事の全文を返してよいのは、Google 公式の手順で確認できた Googlebot だけ。
// https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot
//
// 判定:
//   1. User-Agent に Googlebot / Google-InspectionTool が含まれる（安い絞り込み。これだけでは信用しない）
//   2. リクエスト元 IP が Google 公開の IP 範囲（common-crawlers.json）に入っている
//   どちらか欠ける・IP 範囲が取れない → Googlebot ではない（安全側）
//
// リクエスト元 IP は x-real-ip（@vercel/functions の ipAddress() と同じヘッダ）。
// Vercel はクライアントが送った X-Forwarded-For を上書きし外部の値を通さない（なりすまし対策）。
// https://vercel.com/docs/headers/request-headers#x-forwarded-for
//
// IP 範囲の JSON は Next のデータキャッシュで1日共有する（毎リクエスト取りに行かない）。
// これは公開データなので共有してよい。判定結果（＝出力 HTML の分岐）はキャッシュしない。

import "server-only";
import type { BlockList } from "node:net";
import {
  GOOGLE_COMMON_CRAWLERS_URL,
  buildGoogleIpBlockList,
  isGoogleCrawlerUserAgent,
  isIpInBlockList,
  normalizeIp,
} from "./googlebot-utils";

const RANGES_REVALIDATE_SECONDS = 60 * 60 * 24;
const RANGES_FETCH_TIMEOUT_MS = 3000;

/**
 * 開発時だけ効く検証用ヘッダ。リクエスト元 IP をこの値とみなす。
 * NODE_ENV=production（next build / next start / Vercel）では読まない。
 */
export const DEV_TEST_CLIENT_IP_HEADER = "x-bono-test-client-ip";

let memo: { createdAt: number; list: BlockList } | null = null;

async function loadGoogleCrawlerBlockList(): Promise<BlockList | null> {
  if (memo && Date.now() - memo.createdAt < RANGES_REVALIDATE_SECONDS * 1000) {
    return memo.list;
  }
  try {
    const res = await fetch(GOOGLE_COMMON_CRAWLERS_URL, {
      next: { revalidate: RANGES_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(RANGES_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const list = buildGoogleIpBlockList(await res.json());
    if (list) memo = { createdAt: Date.now(), list };
    return list;
  } catch (error) {
    console.warn("[googlebot] IP 範囲の取得に失敗（Googlebot ではない扱いにする）", error);
    return null;
  }
}

/** リクエスト元 IP。開発時のみ検証用ヘッダで差し替えられる */
export function clientIpFromHeaders(requestHeaders: Headers): string | null {
  if (process.env.NODE_ENV !== "production") {
    const testIp = normalizeIp(requestHeaders.get(DEV_TEST_CLIENT_IP_HEADER));
    if (testIp) return testIp;
  }
  return normalizeIp(requestHeaders.get("x-real-ip"));
}

export async function isVerifiedGooglebot(requestHeaders: Headers): Promise<boolean> {
  if (!isGoogleCrawlerUserAgent(requestHeaders.get("user-agent"))) return false;
  const ip = clientIpFromHeaders(requestHeaders);
  if (!ip) return false;
  const list = await loadGoogleCrawlerBlockList();
  return isIpInBlockList(ip, list);
}

/** テスト用: メモリ上のキャッシュを捨てる */
export function __resetGooglebotRangesForTest() {
  memo = null;
}
