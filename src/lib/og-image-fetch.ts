import "server-only";

/**
 * リンク先ページの Open Graph 画像URLを取得する（サーバー専用）。
 *
 * 内部パス（"/" 始まり）・外部URL（"https://" 始まり）のどちらも、
 * 対象ページのHTMLを fetch して `<meta property="og:image">` を
 * 正規表現で抽出する統一実装。新しいnpm依存は追加しない。
 *
 * 取得失敗時は null を返す。呼び出し側で bg-muted-custom 等の
 * フォールバック表示に切り替えること。
 *
 * NOTE: ファイル名を og-image.ts ではなく og-image-fetch.ts にしているのは、
 * 既存の src/lib/og-image.tsx（`generateOgImage` を export する edge OGP 生成）
 * と `@/lib/og-image` の解決が衝突するのを避けるため。
 */

/** 内部パスを絶対URLに解決するためのサイトURL。 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://app.bo-no.design";

/** HTML文字列から og:image の content を抽出する。 */
function extractOgImage(html: string): string | null {
  // property が content より前・後どちらのケースも拾う
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

/**
 * 指定URL（内部パス or 外部URL）の OGP 画像URLを返す。取得失敗時は null。
 */
export async function getOgImageUrl(url: string): Promise<string | null> {
  try {
    const target = url.startsWith("/") ? `${SITE_URL}${url}` : url;

    const res = await fetch(target, {
      // ISR: OGP は頻繁に変わらないため1時間キャッシュ
      next: { revalidate: 3600 },
      headers: {
        // 一部サイトは UA が無いとOGPを返さないため付与
        "User-Agent": "Mozilla/5.0 (compatible; BONOBot/1.0; +https://bo-no.design)",
      },
    });

    if (!res.ok) return null;

    const html = await res.text();
    return extractOgImage(html);
  } catch {
    return null;
  }
}
