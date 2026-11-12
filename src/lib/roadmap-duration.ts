/**
 * ロードマップの目安期間（Sanity の estimatedDuration）を「数字」と「単位」に分ける。
 *
 * Sanity には "6-9"（単位なし＝月）と "約1年" / "6〜9ヶ月"（単位つき）の両方が入っている。
 * 表示側が無条件に「ヶ月」を付けると「約1年 ヶ月」になるため、単位がもう入っていれば付けない（#280）。
 */
export function splitDuration(duration: string): { value: string; unit: string } {
  const trimmed = duration.trim();
  if (/(ヶ月|か月|カ月|ヵ月)$/.test(trimmed)) {
    return { value: trimmed.replace(/(ヶ月|か月|カ月|ヵ月)$/, ""), unit: "ヶ月" };
  }
  if (/(年|週間|日)$/.test(trimmed)) {
    return { value: trimmed, unit: "" };
  }
  return { value: trimmed, unit: "ヶ月" };
}
