"use client";

/**
 * バグ/問い合わせ分岐画面（#139 スライス4）
 *
 * 「BONOのバグ・質問」カテゴリ（kind: 'contact'）を選んだ場合に表示。
 * 投稿させず、外部のお問い合わせフォームへ誘導する。
 *
 * Figma仕様: 掲示板：投稿フロー修正_Figma仕様.md（BUG/問い合わせ分岐 95:932）
 * 色/角丸は DSトークン対応表のクラスのみ使用（生hex/rgb禁止）。
 * 本文・見出しの文言は Figma 原文ママ（閉じ括弧なしもそのまま）。
 */

import { ArrowLeft } from "lucide-react";
import { CONTACT_FORM_URL } from "@/lib/questions/categories";

interface StepContactProps {
  /** 戻る（category へ） */
  onBack: () => void;
}

export function StepContact({ onBack }: StepContactProps) {
  return (
    <div className="space-y-6">
      {/* 見出し（左寄せ） */}
      <h2 className="text-[18px] font-medium leading-7 text-foreground">
        BONOのバグ・質問について
      </h2>

      {/* 本文 + リンク */}
      <div className="space-y-4">
        <p className="whitespace-pre-line text-[14px] leading-[1.68] text-foreground">
          {"こちらのトピックはお問い合わせでお願いします🙏\n（掲示板コミュニティなので場づくりのために別でお願いします。"}
        </p>
        <a
          href={CONTACT_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[14px] text-text-link underline"
        >
          お問い合わせはこちら
        </a>
      </div>

      {/* フッター（カードの padding を貫通する full-bleed）。左に「戻る」のみ */}
      <div className="-mx-6 -mb-8 mt-2 flex items-center border-t border-muted px-6 py-5 sm:-mx-10 sm:px-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[14px] text-foreground"
        >
          <ArrowLeft size={16} />
          戻る
        </button>
      </div>
    </div>
  );
}
