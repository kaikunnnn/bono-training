// src/lib/seo/googlebot-utils.ts — Googlebot 判定の純粋関数（#236 / rebono#18）
//
// User-Agent はなりすましできるので、それだけでは判定しない。
// Google 公式の「IP 範囲 JSON とリクエスト元 IP の照合」で確認する。
// https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot
//
// サーバー側の取得・リクエストヘッダの読み取りは googlebot.ts（server-only）。

import { BlockList, isIP } from "node:net";

/**
 * Googlebot（一般クローラー）の IP 範囲。旧 URL の googlebot.json はここへ 301 される（2026-10 確認）。
 * special-crawlers（AdsBot 等）と user-triggered-fetchers（人の操作で動く取得）は使わない。
 */
export const GOOGLE_COMMON_CRAWLERS_URL =
  "https://developers.google.com/static/crawling/ipranges/common-crawlers.json";

/** IP を確かめる前の安い絞り込み。Googlebot（Smartphone/Desktop/Image 等）と URL 検査ツール */
const GOOGLE_CRAWLER_UA = /Googlebot|Google-InspectionTool/i;

export function isGoogleCrawlerUserAgent(userAgent: string | null | undefined): boolean {
  return !!userAgent && GOOGLE_CRAWLER_UA.test(userAgent);
}

interface GoogleIpRangesJson {
  creationTime?: string;
  prefixes?: Array<{ ipv4Prefix?: string; ipv6Prefix?: string }>;
}

/**
 * 公開 JSON から照合用の BlockList を作る。形が違う・範囲が1つも無いときは null（＝誰も Googlebot と認めない）。
 */
export function buildGoogleIpBlockList(json: unknown): BlockList | null {
  const prefixes = (json as GoogleIpRangesJson | null)?.prefixes;
  if (!Array.isArray(prefixes)) return null;

  const list = new BlockList();
  let added = 0;
  for (const prefix of prefixes) {
    const cidr = prefix?.ipv4Prefix ?? prefix?.ipv6Prefix;
    if (typeof cidr !== "string") continue;
    const [address, bits] = cidr.split("/");
    const type = prefix.ipv4Prefix ? "ipv4" : "ipv6";
    const prefixLength = Number(bits);
    if (isIP(address) === 0 || !Number.isInteger(prefixLength)) continue;
    try {
      list.addSubnet(address, prefixLength, type);
      added++;
    } catch {
      // 壊れた行は飛ばす
    }
  }
  return added > 0 ? list : null;
}

/**
 * ヘッダ値から IP を1つ取り出して正規化する。
 * 「a, b」の形なら先頭（元のクライアント）。IPv4 射影 IPv6（::ffff:1.2.3.4）は IPv4 に戻す。
 */
export function normalizeIp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let ip = raw.split(",")[0].trim();
  if (ip.startsWith("[") && ip.includes("]")) ip = ip.slice(1, ip.indexOf("]"));
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (mapped) ip = mapped[1];
  return isIP(ip) === 0 ? null : ip;
}

export function isIpInBlockList(ip: string | null, list: BlockList | null): boolean {
  if (!ip || !list) return false;
  const family = isIP(ip);
  if (family === 0) return false;
  return list.check(ip, family === 4 ? "ipv4" : "ipv6");
}
