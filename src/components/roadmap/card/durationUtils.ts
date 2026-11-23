/**
 * 目安期間の文字列を「前置き / 数値 / 単位」に分ける（rebono 279-E）
 *
 * Sanity の estimatedDuration は文字列。従来は数値だけ（"6-9" 等）が入り、
 * UI 側で「ヶ月」を付けていた。「約1年」のように単位込みの値も表示できるようにする。
 *
 * - "6-9"    → { prefix: "",   value: "6-9", unit: "ヶ月" }（単位なしは従来どおりヶ月）
 * - "約1年"  → { prefix: "約", value: "1",   unit: "年" }
 * - "約6ヶ月" → { prefix: "約", value: "6",   unit: "ヶ月" }
 * - 解釈できない文字列 → { prefix: "", value: そのまま, unit: "" }
 */
export interface ParsedDuration {
  prefix: string;
  value: string;
  unit: string;
}

const DURATION_PATTERN = /^(約)?\s*(\d+(?:\s*[-〜~]\s*\d+)?)\s*(ヶ月|か月|カ月|ヵ月|年)?$/;

export function parseDuration(raw: string | null | undefined): ParsedDuration {
  const text = (raw ?? "").trim();
  const match = text.match(DURATION_PATTERN);
  if (!match) {
    return { prefix: "", value: text, unit: "" };
  }
  const [, prefix = "", value, unit] = match;
  return { prefix, value, unit: unit ?? "ヶ月" };
}
