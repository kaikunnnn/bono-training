import React from 'react';

/**
 * タイトルを「｜」または「|」で分割してspan要素の配列として返す
 */
export function renderTitleWithLineBreaks(title: string): React.ReactNode {
  // 全角「｜」または半角「|」で分割
  const parts = title.split(/[｜|]/);
  if (parts.length === 1) {
    return title;
  }
  return parts.map((part, index) => (
    <span key={index} className="block">
      {part}
    </span>
  ));
}
