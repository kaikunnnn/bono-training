
/**
 * Markdownコンテンツの分割とプレミアムコンテンツ処理（強化版）
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
  // 入力検証
  if (!content || typeof content !== 'string') {
    console.warn('splitPremiumContent: 無効なコンテンツが渡されました');
    return {
      freeContent: '',
      premiumContent: '',
      hasPremiumContent: false
    };
  }

  if (!marker || typeof marker !== 'string') {
    console.warn('splitPremiumContent: 無効なマーカーが渡されました');
    return {
      freeContent: content,
      premiumContent: '',
      hasPremiumContent: false
    };
  }

  if (!content.includes(marker)) {
    return {
      freeContent: content,
      premiumContent: '',
      hasPremiumContent: false
    };
  }

  try {
    const parts = content.split(marker);
    return {
      freeContent: parts[0]?.trim() || '',
      premiumContent: parts[1]?.trim() || '',
      hasPremiumContent: true
    };
  } catch (error) {
    console.error('splitPremiumContent: コンテンツ分割中にエラーが発生:', error);
    return {
      freeContent: content,
      premiumContent: '',
      hasPremiumContent: false
    };
  }
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
  // 入力検証
  if (!content || typeof content !== 'string') {
    console.warn('getDisplayContent: 無効なコンテンツが渡されました');
    return { content: '', showBanner: false };
  }

  if (typeof isPremium !== 'boolean') {
    console.warn('getDisplayContent: isPremiumが真偽値ではありません、falseとして扱います');
    isPremium = false;
  }

  if (typeof hasPremiumAccess !== 'boolean') {
    console.warn('getDisplayContent: hasPremiumAccessが真偽値ではありません、falseとして扱います');
    hasPremiumAccess = false;
  }

  // 無料コンテンツの場合は常に全文表示、バナーなし
  if (!isPremium) {
    return { content, showBanner: false };
  }

  // プレミアムアクセスがある場合は全文表示、バナーなし
  if (hasPremiumAccess) {
    return { content, showBanner: false };
  }

  // プレミアムアクセスがない場合
  try {
    const split = splitPremiumContent(content, marker);
    
    if (split.hasPremiumContent) {
      // マーカーがある場合は無料部分のみ表示、バナーあり
      return { content: split.freeContent, showBanner: true };
    } else {
      // マーカーがない場合は全文表示、バナーあり
      return { content, showBanner: true };
    }
  } catch (error) {
    console.error('getDisplayContent: コンテンツ処理中にエラーが発生:', error);
    // エラー時は安全にコンテンツを表示、バナーあり
    return { content, showBanner: true };
  }
}
