"use client";

/**
 * 書式ボタン + 編集/プレビュー切替を備えた textarea カード（#146 T20・案1）。
 *
 * 構造: 1枚のカード（containerClassName で見た目を渡す）の中に
 *   上=入力エリア（またはプレビュー）/ 下=フッター（書式アクションエリア）
 * を持つ。書式ボタンはフォームの外に出さない（レビュー指摘: ツールバーを
 * カード上部に置くと投稿者名の行と混ざって見えるため、フッター内に置く）。
 *
 * - 書式ボタン: 見出し `## ` / 太字 `**...**` / 箇条書き `- `（カーソル位置に挿入）
 * - プレビューは FormattedText で実描画
 * - value/onChange/placeholder/maxLength 等は props で透過（呼び出し側の
 *   文字数カウント・バリデーション・ボタン出現条件は従来どおり動く）
 */

import { useId, useRef, useState } from "react";
import { Heading2, Bold, List } from "lucide-react";
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
  /** カード（外枠）の見た目。呼び出し側のデザイン（白カード/muted枠など）を渡す */
  containerClassName?: string;
  /** 内側 textarea への追加クラス（文字サイズ・min-height など） */
  className?: string;
  /** textarea の id（Label 連携用） */
  id?: string;
  /** アクセシビリティ用ラベル（ツールバーの説明） */
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
  containerClassName,
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
   * - 見出し/箇条書き: カーソル行の先頭にプレフィックスを挿入
   * - 太字: 選択範囲を `**` で囲む（選択が無ければプレースホルダを選択状態に）
   */
  const applyFormat = (kind: "heading" | "bold" | "list") => {
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
      nextSelStart = start + 2;
      nextSelEnd = start + 2 + inner.length;
    } else {
      const prefix = kind === "heading" ? "## " : "- ";
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      nextValue = value.slice(0, lineStart) + prefix + value.slice(lineStart);
      nextSelStart = start + prefix.length;
      nextSelEnd = end + prefix.length;
    }

    onChange(nextValue);
    requestAnimationFrame(() => {
      const node = textareaRef.current;
      if (!node) return;
      node.focus();
      node.setSelectionRange(nextSelStart, nextSelEnd);
    });
  };

  return (
    <div className={cn("flex flex-col", containerClassName)}>
      {/* 入力エリア / プレビュー */}
      {tab === "edit" ? (
        <textarea
          ref={textareaRef}
          id={textareaId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            "w-full flex-1 resize-none border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50",
            className,
          )}
        />
      ) : (
        <div className={cn("flex-1 text-sm", className)}>
          {value.trim() ? (
            <FormattedText text={value} />
          ) : (
            <p className="text-muted-foreground">プレビューする内容がありません</p>
          )}
        </div>
      )}

      {/* フッター: 書式アクションエリア（カードの中に置く） */}
      <div
        className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2"
        role="toolbar"
        aria-label={`${ariaLabel}の書式ツール`}
      >
        <div className="flex items-center gap-0.5">
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
          <TabButton active={tab === "preview"} onClick={() => setTab("preview")}>
            プレビュー
          </TabButton>
        </div>
      </div>
    </div>
  );
}

/** フッターの ghost アイコンボタン */
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
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
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
        "rounded-md px-2 py-0.5 transition-colors",
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
