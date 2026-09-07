"use client";

import { useEffect, useState } from "react";

const HEX_PATTERN = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

function normalizeHex(input: string): string {
  const v = input.trim();
  return v.startsWith("#") ? v : `#${v}`;
}

interface ColorFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (hex: string) => void;
}

/**
 * カラーピッカー(丸スウォッチ)＋ hex テキスト入力をセットにして、
 * 「今何色を指定しているか」を数値として常に見える状態にする。
 */
export default function ColorField({ label, description, value, onChange }: ColorFieldProps) {
  const [draft, setDraft] = useState(value);

  // 外部(プリセット選択など)からの value 変更をテキスト欄にも反映する
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const isValid = HEX_PATTERN.test(normalizeHex(draft));

  function commitDraft(next: string) {
    const normalized = normalizeHex(next);
    setDraft(next);
    if (HEX_PATTERN.test(normalized)) {
      onChange(normalized.length === 4 ? expandShortHex(normalized) : normalized);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="relative flex-none">
        <span
          className="block w-9 h-9 rounded-full border border-border-default shadow-sm"
          style={{ backgroundColor: isValid ? normalizeHex(draft) : value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => commitDraft(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={`${label}を選択`}
        />
      </label>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold text-text-primary font-noto-sans-jp">{label}</div>
        {description && (
          <div className="text-[11px] text-text-muted font-noto-sans-jp mb-1">{description}</div>
        )}
        <input
          type="text"
          value={draft}
          onChange={(e) => commitDraft(e.target.value)}
          onBlur={() => setDraft(value)}
          spellCheck={false}
          className={`w-full text-xs font-mono px-2 py-1 rounded-[8px] border bg-base text-text-primary ${
            isValid ? "border-border-default" : "border-text-error"
          }`}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function expandShortHex(hex: string): string {
  const [, r, g, b] = hex;
  return `#${r}${r}${g}${g}${b}${b}`;
}
