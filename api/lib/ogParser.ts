/**
 * OG情報取得ユーティリティ
 * 記事URLからOGP情報（タイトル、画像、説明文）を取得する
 */

export interface OgData {
  title: string | null;
  image: string | null;
  description: string | null;
  siteName: string | null;
}

/**
 * URLからOG情報を取得
 */
export async function fetchOgData(url: string): Promise<OgData> {
  const result: OgData = {
    title: null,
    image: null,
    description: null,
    siteName: null,
  };

  try {
    // タイムアウト付きでフェッチ
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BONOBot/1.0; +https://bo-no.design)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Failed to fetch URL: ${url}, status: ${response.status}`);
      return result;
    }

    const html = await response.text();

    // OGタグを抽出
    result.title = extractMetaContent(html, 'og:title') || extractTitle(html);
    result.image = extractMetaContent(html, 'og:image');
    result.description = extractMetaContent(html, 'og:description') || extractMetaContent(html, 'description');
    result.siteName = extractMetaContent(html, 'og:site_name');

    // 相対URLを絶対URLに変換
    if (result.image && !result.image.startsWith('http')) {
      const baseUrl = new URL(url);
      result.image = new URL(result.image, baseUrl.origin).href;
    }

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`Timeout fetching OG data from: ${url}`);
    } else {
      console.error(`Error fetching OG data from ${url}:`, error);
    }
  }

  return result;
}

/**
 * HTMLからmetaタグのcontentを抽出
 */
function extractMetaContent(html: string, property: string): string | null {
  // og:xxx形式
  const ogRegex = new RegExp(
    `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`,
    'i'
  );
  const ogMatch = html.match(ogRegex);
  if (ogMatch) return decodeHtmlEntities(ogMatch[1]);

  // content が先に来るパターン
  const ogRegex2 = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`,
    'i'
  );
  const ogMatch2 = html.match(ogRegex2);
  if (ogMatch2) return decodeHtmlEntities(ogMatch2[1]);

  // name属性（descriptionなど）
  const nameRegex = new RegExp(
    `<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`,
    'i'
  );
  const nameMatch = html.match(nameRegex);
  if (nameMatch) return decodeHtmlEntities(nameMatch[1]);

  // content が先に来るパターン (name)
  const nameRegex2 = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`,
    'i'
  );
  const nameMatch2 = html.match(nameRegex2);
  if (nameMatch2) return decodeHtmlEntities(nameMatch2[1]);

  return null;
}

/**
 * HTMLから<title>タグを抽出
 */
function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

/**
 * HTMLエンティティをデコード
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}
