import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 動画時間を表示用文字列に変換
 * @param duration "MM:SS" or "H:MM:SS" or number 形式
 * @returns 表示用文字列、無効な場合は null
 */
export function formatVideoDuration(duration: string | number | null | undefined): string | null {
  if (duration == null) return null;

  // 既に数値の場合は分として扱い "MM分" 形式で返す
  if (typeof duration === 'number') {
    return duration > 0 ? `${Math.floor(duration)}分` : null;
  }

  // 文字列の場合、"MM:SS" or "H:MM:SS" 形式をそのまま返す
  const trimmed = duration.trim();
  if (!trimmed || trimmed === '00:00') return null;

  // 有効な時間形式かチェック
  const parts = trimmed.split(':').map(Number);
  if (parts.some(isNaN) || parts.length < 2) return null;

  return trimmed;
}

/**
 * 動画時間を分数に変換（計算用）
 */
export function parseVideoDurationMinutes(duration: string | number | null | undefined): number | null {
  if (duration == null) return null;

  if (typeof duration === 'number') {
    return duration > 0 ? Math.floor(duration) : null;
  }

  const trimmed = duration.trim();
  if (!trimmed || trimmed === '00:00') return null;

  const parts = trimmed.split(':').map(Number);
  if (parts.some(isNaN)) return null;

  if (parts.length === 2) {
    return parts[0] > 0 ? parts[0] : null;
  } else if (parts.length === 3) {
    const totalMinutes = parts[0] * 60 + parts[1];
    return totalMinutes > 0 ? totalMinutes : null;
  }
  return null;
}
