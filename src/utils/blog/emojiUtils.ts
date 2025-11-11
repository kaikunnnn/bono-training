/**
 * BONO Blog - Emoji Utilities
 *
 * 絵文字をFluent Emoji 3D画像URLに変換するユーティリティ関数
 */

/**
 * 絵文字をユニコードコードポイント（16進数）に変換
 * @param emoji - 絵文字文字列（例: "📝"）
 * @returns ハイフン区切りのコードポイント文字列（例: "1f4dd"）
 */
export const emojiToCodePoints = (emoji: string): string => {
  if (!emoji) return '';

  // スプレッド演算子で正しく絵文字を分割
  const codePoints: string[] = [];
  const chars = [...emoji];

  for (const char of chars) {
    const codePoint = char.codePointAt(0);
    if (codePoint && codePoint > 0x7F) { // ASCII以外のみ
      codePoints.push(codePoint.toString(16).toLowerCase().padStart(4, '0'));
    }
  }

  // 最初のコードポイントのみを返す（絵文字は通常1つのコードポイント）
  return codePoints[0] || '';
};

/**
 * 絵文字をFluent Emoji 3D画像URLに変換
 * @param emoji - 絵文字文字列（例: "📝"）
 * @returns Fluent Emoji 3D画像のURL
 */
export const getFluentEmojiUrl = (emoji: string): string => {
  if (!emoji || emoji.trim() === '') {
    // デフォルト絵文字: 📝（メモ）
    return 'https://emojicdn.elk.sh/%F0%9F%93%9D?style=microsoft-fluent';
  }

  // 絵文字の最初の文字のみを使用
  const firstEmoji = [...emoji.trim()][0];

  // Emoji CDN (elk.sh) を使用 - Microsoft Fluent スタイル
  // URLエンコードして絵文字を埋め込む
  const encodedEmoji = encodeURIComponent(firstEmoji);
  return `https://emojicdn.elk.sh/${encodedEmoji}?style=microsoft-fluent`;
};

/**
 * Fluent Emoji 3D画像のフォールバックURL（画像が見つからない場合）
 * @param emoji - 絵文字文字列
 * @returns Twemoji CDNのURL（より確実に画像が存在する）
 */
export const getFluentEmojiFallbackUrl = (emoji: string): string => {
  if (!emoji || emoji.trim() === '') {
    return 'https://emojicdn.elk.sh/%F0%9F%93%9D?style=twitter';
  }

  const firstEmoji = [...emoji.trim()][0];
  const encodedEmoji = encodeURIComponent(firstEmoji);

  // Twemojiスタイルをフォールバックとして使用
  return `https://emojicdn.elk.sh/${encodedEmoji}?style=twitter`;
};

/**
 * 絵文字が有効かチェック
 * @param emoji - 絵文字文字列
 * @returns 有効な絵文字ならtrue
 */
export const isValidEmoji = (emoji: string): boolean => {
  if (!emoji || emoji.trim() === '') return false;

  // 基本的な絵文字の正規表現チェック
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/u;
  return emojiRegex.test(emoji);
};

/**
 * テキストから最初の絵文字を抽出
 * @param text - テキスト（タイトルなど）
 * @returns 最初の絵文字、または undefined
 */
export const extractEmojiFromText = (text: string): string | undefined => {
  if (!text) return undefined;

  // 絵文字を検出する正規表現（より包括的）
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{231A}-\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{24C2}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2600}-\u{2604}\u{260E}\u{2611}\u{2614}-\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}-\u{2623}\u{2626}\u{262A}\u{262E}-\u{262F}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{265F}-\u{2660}\u{2663}\u{2665}-\u{2666}\u{2668}\u{267B}\u{267E}-\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}-\u{269C}\u{26A0}-\u{26A1}\u{26A7}\u{26AA}-\u{26AB}\u{26B0}-\u{26B1}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26C8}\u{26CE}-\u{26CF}\u{26D1}\u{26D3}-\u{26D4}\u{26E9}-\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/u;

  const match = text.match(emojiRegex);
  return match ? match[0] : undefined;
};

/**
 * テキストから絵文字を除去
 * @param text - テキスト
 * @returns 絵文字を除去したテキスト
 */
export const removeEmojiFromText = (text: string): string => {
  if (!text) return text;

  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{231A}-\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{24C2}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2600}-\u{2604}\u{260E}\u{2611}\u{2614}-\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}-\u{2623}\u{2626}\u{262A}\u{262E}-\u{262F}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{265F}-\u{2660}\u{2663}\u{2665}-\u{2666}\u{2668}\u{267B}\u{267E}-\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}-\u{269C}\u{26A0}-\u{26A1}\u{26A7}\u{26AA}-\u{26AB}\u{26B0}-\u{26B1}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26C8}\u{26CE}-\u{26CF}\u{26D1}\u{26D3}-\u{26D4}\u{26E9}-\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu;

  return text.replace(emojiRegex, '').trim();
};

/**
 * 絵文字表示用のデフォルト値を取得
 */
export const DEFAULT_EMOJI = '📝';
export const DEFAULT_FLUENT_EMOJI_URL = 'https://emojicdn.elk.sh/%F0%9F%93%9D?style=microsoft-fluent';
