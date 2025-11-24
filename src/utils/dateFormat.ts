/**
 * 日付フォーマットユーティリティ
 */

/**
 * 日付を日本語フォーマットで表示
 * @param date - ISO 8601文字列、Unix timestamp、またはDateオブジェクト
 * @returns "2025年12月18日" 形式の文字列
 *
 * @example
 * formatDate('2025-12-18T00:00:00Z') // => "2025年12月18日"
 * formatDate(1734480000) // => "2025年12月18日"
 * formatDate(new Date()) // => "2025年11月18日"
 */
export function formatDate(date: string | number | Date | null | undefined): string {
  if (!date) return '';

  let dateObj: Date;

  if (typeof date === 'number') {
    // Unix timestamp (秒)
    dateObj = new Date(date * 1000);
  } else if (typeof date === 'string') {
    // ISO 8601文字列
    dateObj = new Date(date);
  } else {
    // Dateオブジェクト
    dateObj = date;
  }

  // 無効な日付をチェック
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return dateObj.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 日付を「○月○日」形式で表示（簡潔版）
 * @param date - ISO 8601文字列、Unix timestamp、またはDateオブジェクト
 * @returns "12月18日" 形式の文字列
 *
 * @example
 * formatDateShort('2025-12-18T00:00:00Z') // => "12月18日"
 */
export function formatDateShort(date: string | number | Date | null | undefined): string {
  if (!date) return '';

  let dateObj: Date;

  if (typeof date === 'number') {
    dateObj = new Date(date * 1000);
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  // 無効な日付をチェック
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return dateObj.toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric'
  });
}
