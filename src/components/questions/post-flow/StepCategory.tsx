"use client";

/**
 * Step1 カテゴリ選択（#139 スライス2）
 *
 * グリッドは BOARD_CATEGORIES（order 昇順）で駆動する（唯一の正）。
 * - kind === 'contact'（BONOのバグ・質問）は Sanity に存在しないため、
 *   Sanity を引かずに contact 分岐へ。
 * - kind === 'post' は props の categories（Sanity）から
 *   slug.current === def.slug で _id を解決して選択ハンドラに渡す。
 * - Sanity に解決できない post カテゴリのボタンは非表示（A-2防御）＋ console.error。
 *
 * Figma仕様: 掲示板：投稿フロー修正_Figma仕様.md（STEP1 / カテゴリボタンの詳細スタイル）
 * 色/角丸は DSトークン対応表のクラスのみ使用（生hex/rgb禁止）。
 */

import { useMemo } from "react";
import type { QuestionCategory } from "@/types/sanity";
import { BOARD_CATEGORIES, type BoardCategoryDef } from "@/lib/questions/categories";

interface StepCategoryProps {
  /** Sanity の questionCategory 一覧（post カテゴリの _id 解決に使用） */
  categories: QuestionCategory[];
  /**
   * カテゴリ選択ハンドラ。
   * - post: def と解決済みの Sanity _id を渡す
   * - contact: def のみ渡す（categoryId は undefined）
   */
  onSelect: (def: BoardCategoryDef, categoryId?: string) => void;
}

/** グリッドに表示する 1 項目（解決済みの Sanity _id を含む） */
interface RenderableCategory {
  def: BoardCategoryDef;
  /** post のとき解決済み Sanity _id。contact のとき undefined */
  categoryId?: string;
}

export function StepCategory({ categories, onSelect }: StepCategoryProps) {
  // BOARD_CATEGORIES（order 昇順）を基に描画対象を構築。
  // post で Sanity に解決できないものは除外し、マウント時に console.error で検出する。
  const renderable = useMemo<RenderableCategory[]>(() => {
    const sorted = [...BOARD_CATEGORIES].sort((a, b) => a.order - b.order);
    const result: RenderableCategory[] = [];
    for (const def of sorted) {
      if (def.kind === "contact") {
        result.push({ def });
        continue;
      }
      const match = categories.find((c) => c.slug?.current === def.slug);
      if (!match) {
        // A-2防御: Sanity に解決できない post カテゴリは非表示にしてログを残す
        console.error(
          `[StepCategory] Sanity questionCategory が見つかりません: slug="${def.slug}"（"${def.label}"）。このカテゴリは非表示にします。`,
        );
        continue;
      }
      result.push({ def, categoryId: match._id });
    }
    return result;
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* 見出し + サブテキスト（左寄せ・既存の見出し+説明パターン） */}
      <div className="space-y-1">
        <h2 className="text-[18px] font-bold leading-7 text-foreground">
          1. 何について投稿する？
        </h2>
        <p className="text-[14px] text-foreground">
          質問でも、感想でも、迷いでもOK
        </p>
      </div>

      {/* カテゴリグリッド: sm未満は1列、sm以上で2列 gap-3(12px) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {renderable.map(({ def, categoryId }) => (
          <button
            key={def.slug}
            type="button"
            onClick={() => onSelect(def, categoryId)}
            className="flex flex-col items-start rounded-[12px] border-2 border-border p-[18px] text-left transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="text-[24px] leading-8" aria-hidden="true">
              {def.emoji}
            </span>
            <span className="mt-2 text-[16px] font-medium leading-6 text-foreground">
              {def.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
