/**
 * プレーンテキスト中の http/https URL を検出し、表示層に依存しないセグメント配列へ分解する純粋関数。
 *
 * - http/https のみを対象とする（`javascript:` 等のスキームは絶対にリンク化しない）
 * - URL 末尾の日本語句読点・閉じ括弧や `. , ) ] } 、。」』】` 等はリンクに含めず text 側へ残す
 * - Wikipedia 等の `(...)` を含む URL は、末尾で閉じ括弧の釣り合いが取れる範囲のみ許容する
 *
 * 表示（React 等）に一切依存しないため server-only 不要。
 */

export type LinkifySegment =
  | { type: "text"; value: string }
  | { type: "link"; href: string; label: string };

// http:// または https:// で始まり、空白・改行以外が続く塊を大まかに拾う。
// 末尾の余分な文字（句読点・括弧）は後段の trimUrlBoundary で切り落とす。
const URL_REGEX = /https?:\/\/[^\s]+/gi;

// URL 末尾に付きやすく、URL の一部として扱いたくない文字。
// 半角の記号 + 全角の句読点・閉じ括弧などを含む。
const TRAILING_CHARS = new Set([
  ".",
  ",",
  ";",
  ":",
  "!",
  "?",
  ")",
  "]",
  "}",
  "'",
  '"',
  "、",
  "。",
  "，",
  "．",
  "！",
  "？",
  "」",
  "』",
  "）",
  "】",
  "〕",
  "｝",
  "・",
  "…",
  "〉",
  "》",
]);

// 開き括弧 → 対応する閉じ括弧。バランス判定に使う。
const OPEN_TO_CLOSE: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
};

/**
 * マッチした URL 候補文字列の末尾から、URL に含めたくない文字を切り落とす。
 * 戻り値は「実際に URL とみなす部分」の文字列。切り落とした残りは呼び出し側で text に戻す。
 */
function trimUrlBoundary(raw: string): string {
  let url = raw;

  while (url.length > 0) {
    const last = url[url.length - 1];

    if (!TRAILING_CHARS.has(last)) break;

    // 閉じ括弧の場合、URL 内に対応する開き括弧が十分あれば URL の一部として残す
    // （例: Wikipedia の /wiki/Foo_(bar) ）。釣り合わない末尾の閉じ括弧のみ切る。
    if (last === ")" || last === "]" || last === "}") {
      const open = (Object.keys(OPEN_TO_CLOSE) as Array<keyof typeof OPEN_TO_CLOSE>).find(
        (o) => OPEN_TO_CLOSE[o] === last,
      )!;
      const opens = countChar(url, open);
      const closes = countChar(url, last);
      if (closes <= opens) break; // 釣り合っている → URL の一部として残す
    }

    url = url.slice(0, -1);
  }

  return url;
}

function countChar(str: string, ch: string): number {
  let n = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === ch) n++;
  }
  return n;
}

/**
 * プレーンテキストを text / link セグメントの配列へ分解する。
 * URL を含まない場合は text セグメント 1 つ（空文字なら空配列）を返す。
 */
export function linkifyText(text: string): LinkifySegment[] {
  if (!text) return [];

  const segments: LinkifySegment[] = [];
  let lastIndex = 0;

  // exec ループのため lastIndex を都度リセットして使う
  URL_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const rawMatch = match[0];
    const matchStart = match.index;

    const url = trimUrlBoundary(rawMatch);

    // trim の結果スキーマだけ等になり実体が無いケースの保険（通常起きない）
    if (url.length <= "https://".length) {
      // URL とみなせない → そのまま text 側で処理を続行させる
      continue;
    }

    // マッチ前の text
    if (matchStart > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, matchStart) });
    }

    segments.push({ type: "link", href: url, label: url });

    const consumedEnd = matchStart + url.length;
    lastIndex = consumedEnd;

    // trim で切り落とした末尾文字は次のマッチ探索対象に戻す
    URL_REGEX.lastIndex = consumedEnd;
  }

  // 残りの text
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  // URL が全く無かった場合は text 1 つ
  if (segments.length === 0) {
    segments.push({ type: "text", value: text });
  }

  return segments;
}
