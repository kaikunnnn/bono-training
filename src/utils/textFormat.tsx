/**
 * テキストフォーマット用ユーティリティ
 */
import React from "react";

/** 改行マーカー文字 */
const LINE_BREAK_MARKER = "|";

/**
 * 改行マーカーを <br> タグに変換して React 要素として返す
 * 表示用（RoadmapHero等）
 *
 * @example
 * formatTitleWithLineBreaks("UIデザインの見た目の|基本習得ロードマップ")
 * // => ["UIデザインの見た目の", <br />, "基本習得ロードマップ"]
 */
export function formatTitleWithLineBreaks(title: string): (string | JSX.Element)[] {
  if (!title.includes(LINE_BREAK_MARKER)) {
    return [title];
  }

  const parts = title.split(LINE_BREAK_MARKER);
  const result: (string | JSX.Element)[] = [];

  parts.forEach((part, index) => {
    if (index > 0) {
      result.push(<br key={`br-${index}`} />);
    }
    result.push(part);
  });

  return result;
}

/**
 * 改行マーカーを削除してプレーンテキストとして返す
 * SEO/OGP/パンくずリスト用
 *
 * @example
 * stripLineBreakMarker("UIデザインの見た目の|基本習得ロードマップ")
 * // => "UIデザインの見た目の基本習得ロードマップ"
 */
export function stripLineBreakMarker(title: string): string {
  return title.replace(new RegExp(`\\${LINE_BREAK_MARKER}`, "g"), "");
}
