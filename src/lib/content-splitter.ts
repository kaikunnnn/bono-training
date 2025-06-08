
/**
 * Markdownコンテンツの分割とプレミアムコンテンツ処理
 */

export interface ContentSplit {
  freeContent: string;
  premiumContent: string;
  hasPremiumContent: boolean;
}

/**
 * マーカーでMarkdownコンテンツを無料部分とプレミアム部分に分割
 */
export function splitPremiumContent(
  content: string, 
  marker: string = '<!-- PREMIUM_ONLY -->'
): ContentSplit {
  if (!content.includes(marker)) {
    return {
      freeContent: content,
      premiumContent: '',
      hasPremiumContent: false
    };
  }

  const parts = content.split(marker);
  return {
    freeContent: parts[0].trim(),
    premiumContent: parts[1]?.trim() || '',
    hasPremiumContent: true
  };
}

/**
 * プレミアムアクセス権と有料コンテンツかどうかに基づいて表示するコンテンツを決定
 */
export function getDisplayContent(
  content: string,
  isPremium: boolean,
  hasPremiumAccess: boolean,
  marker: string = '<!-- PREMIUM_ONLY -->'
): { content: string; showBanner: boolean } {
  // 無料コンテンツの場合は常に全文表示、バナーなし
  if (!isPremium) {
    return { content, showBanner: false };
  }

  // プレミアムアクセスがある場合は全文表示、バナーなし
  if (hasPremiumAccess) {
    return { content, showBanner: false };
  }

  // プレミアムアクセスがない場合
  const split = splitPremiumContent(content, marker);
  
  if (split.hasPremiumContent) {
    // マーカーがある場合は無料部分のみ表示、バナーあり
    return { content: split.freeContent, showBanner: true };
  } else {
    // マーカーがない場合は全文表示、バナーあり
    return { content, showBanner: true };
  }
}
