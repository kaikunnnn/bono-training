"use client";

/**
 * 書式ボタン + 編集/プレビュー切替を備えた textarea ラッパー（#146 T20・案1）。
 *
 * - 上部に書式ボタン 3 つ（見出し `## ` / 太字 `**...**` / 箇条書き `- `）と
 *   「編集 / プレビュー」タブを配置する
 * - 書式ボタンはカーソル位置に記法を挿入。選択範囲があれば太字は `**選択**` で囲む
 * - プレビューは FormattedText で実描画する
 * - 既存 textarea の value/onChange/placeholder/maxLength などの挙動は props で透過する
 *   （呼び出し側の文字数カウント・バリデーション・ボタン出現条件は従来どおり動く）
 */

import { useId, useRef, useState } from "react";
import { Heading2, Bold, List } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FormattedText } from "./FormattedText";

interface FormattingTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  /** textarea 本体へ渡す追加クラス（既存の見た目を維持するため） */
  className?: string;
  /** textarea の id（Label 連携用） */
  id?: string;
  /** アクセシビリティ用ラベル（タブ・ボタン群の説明） */
  ariaLabel?: string;
}

type Tab = "edit" | "preview";

export function FormattingTextarea({
  value,
  onChange,
  placeholder,
  rows,
  maxLength,
  disabled,
  autoFocus,
  className,
  id,
  ariaLabel = "本文",
}: FormattingTextareaProps) {
  const [tab, setTab] = useState<Tab>("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  /**
   * カーソル位置 / 選択範囲へ記法を挿入する。
   * - block: 行頭に付与するプレフィックス（`## ` / `- `）
   * - wrap: 選択範囲を囲む記号（`**`）。選択が無ければ記号内へカーソルを置く
   */
  const applyFormat = (
    kind: "heading" | "bold" | "list",
  ) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);

    let nextValue: string;
    let nextSelStart: number;
    let nextSelEnd: number;

    if (kind === "bold") {
      const inner = selected || "太字";
      const inserted = `**${inner}**`;
      nextValue = value.slice(0, start) + inserted + value.slice(end);
      // 選択が無ければ中身（プレースホルダ）を選択状態にして上書きしやすくする
      nextSelStart = start + 2;
      nextSelEnd = start + 2 + inner.length;
    } else {
      // 行頭プレフィックス（見出し / 箇条書き）。カーソル行の先頭に挿入する。
      const prefix = kind === "heading" ? "## " : "- ";
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      nextValue =
        value.slice(0, lineStart) + prefix + value.slice(lineStart);
      nextSelStart = start + prefix.length;
      nextSelEnd = end + prefix.length;
    }

    onChange(nextValue);
    // 値反映後にカーソル位置を復元
    requestAnimationFrame(() => {
      const node = textareaRef.current;
      if (!node) return;
      node.focus();
      node.setSelectionRange(nextSelStart, nextSelEnd);
    });
  };

  return (
    <div className="space-y-2">
      {/* ツールバー: 左=書式ボタン / 右=編集・プレビュータブ */}
      <div
        className="flex items-center justify-between gap-2"
        role="toolbar"
        aria-label={`${ariaLabel}の書式ツール`}
      >
        <div className="flex items-center gap-1">
          <ToolbarButton
            label="見出し"
            onClick={() => applyFormat("heading")}
            disabled={disabled || tab === "preview"}
          >
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton
            label="太字"
            onClick={() => applyFormat("bold")}
            disabled={disabled || tab === "preview"}
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            label="箇条書き"
            onClick={() => applyFormat("list")}
            disabled={disabled || tab === "preview"}
          >
            <List size={16} />
          </ToolbarButton>
        </div>
        <div className="flex items-center gap-1 text-[12px]">
          <TabButton active={tab === "edit"} onClick={() => setTab("edit")}>
            編集
          </TabButton>
          <TabButton
            active={tab === "preview"}
            onClick={() => setTab("preview")}
          >
            プレビュー
          </TabButton>
        </div>
      </div>

      {tab === "edit" ? (
        <Textarea
          ref={textareaRef}
          id={textareaId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          autoFocus={autoFocus}
          className={className}
        />
      ) : (
        <div
          className={cn(
            "min-h-[80px] rounded-md border border-input bg-muted/30 px-3 py-2 text-sm",
            className,
          )}
        >
          {value.trim() ? (
            <FormattedText text={value} />
          ) : (
            <p className="text-muted-foreground">
              プレビューする内容がありません
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** ツールバーの ghost アイコンボタン */
function ToolbarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/** 編集 / プレビューのタブボタン（小さめ） */
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md px-2.5 py-1 transition-colors",
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
