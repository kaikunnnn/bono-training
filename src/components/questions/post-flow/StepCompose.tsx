"use client";

/**
 * Step2 投稿作成フォーム（#139 スライス3）
 *
 * タイトル + 本文を1画面に統合し、「次へ」＝送信を担う中核ステップ。
 * - 送信は Supabase セッション → Bearer → POST /api/questions/submit
 * - ペイロードは { title, categoryId, questionContent } のみ（figmaUrl / referenceUrls は廃止・送らない）
 * - 失敗時は compose に留まり入力を保持したままカード上部にエラーバナーを出す（A-3）
 * - previewMode では実送信せずモック成功
 *
 * バリデーション値は /api/questions/submit/route.ts と一致させること（title 5〜100 / 本文 20〜5000）。
 *
 * Figma仕様: 掲示板：投稿フロー修正_Figma仕様.md（STEP2 投稿作成 95:351）
 * 色/角丸は DSトークン対応表のクラスのみ使用（生hex/rgb禁止）。
 */

import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

// サーバー側（/api/questions/submit）と一致させる。ズレると UX とサーバー拒否が食い違う。
const VALIDATION_RULES = {
  title: { minLength: 5, maxLength: 100 },
  content: { minLength: 20, maxLength: 5000 },
};

const CONTENT_PLACEHOLDER = `話したいことや聞きたいことを詳しく書き込みましょう。
・「理由」や「背景」が明確なほど答えやすいです。
・リンクがあるならリンクも貼るとよいでしょう`;

/** 送信成功時に返す最小限の結果 */
export interface ComposeResult {
  questionId: string;
  slug: string;
}

interface StepComposeProps {
  /** 選択済み Sanity カテゴリ _id（post カテゴリで必ず解決済み） */
  categoryId?: string;
  /** タイトル（PostFlowClient が保持。戻る→再入場で消えないように親state） */
  title: string;
  onTitleChange: (value: string) => void;
  /** 本文（同上） */
  content: string;
  onContentChange: (value: string) => void;
  /** 戻る（category へ）。入力は保持する */
  onBack: () => void;
  /** 送信成功。questionId / slug を親へ渡して done へ */
  onSuccess: (result: ComposeResult) => void;
  /** プレビュー: 実送信せずモック成功 */
  isPreview?: boolean;
}

export function StepCompose({
  categoryId,
  title,
  onTitleChange,
  content,
  onContentChange,
  onBack,
  onSuccess,
  isPreview,
}: StepComposeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleTrimmedLen = title.trim().length;
  const contentTrimmedLen = content.trim().length;

  // 「次へ」有効条件（サーバー値と一致）。空白のみは無効にする。
  const canSubmit =
    titleTrimmedLen >= VALIDATION_RULES.title.minLength &&
    title.length <= VALIDATION_RULES.title.maxLength &&
    contentTrimmedLen >= VALIDATION_RULES.content.minLength &&
    content.length <= VALIDATION_RULES.content.maxLength;

  // フィールド下エラー（不足時のみ・軽い誘導）
  const titleFieldError =
    title.length > 0 && titleTrimmedLen < VALIDATION_RULES.title.minLength
      ? `タイトルは${VALIDATION_RULES.title.minLength}文字以上で入力してください`
      : null;
  const contentFieldError =
    content.length > 0 && contentTrimmedLen < VALIDATION_RULES.content.minLength
      ? `内容は${VALIDATION_RULES.content.minLength}文字以上で入力してください`
      : null;

  const handleSubmit = async () => {
    if (isSubmitting || !canSubmit) return;
    setError(null);

    // プレビュー: モック成功
    if (isPreview) {
      onSuccess({
        questionId: "preview-question-id",
        slug: "preview-question-slug",
      });
      return;
    }

    if (!categoryId) {
      setError("カテゴリが選択されていません。最初からやり直してください");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("ログインが必要です");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        title,
        categoryId,
        questionContent: content,
      };

      const response = await fetch("/api/questions/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      // 空ボディでの "Unexpected end of JSON input" を防ぐため text → 安全に parse
      const text = await response.text();
      let data: { questionId?: string; slug?: string; error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`サーバーから不正な応答 (HTTP ${response.status})`);
      }

      // レート制限（429 or サーバーのレート文言）は専用文言に置き換える
      if (response.status === 429) {
        throw new Error(
          "投稿は1時間に5件までです。少し時間を置いてお試しください",
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || `投稿に失敗しました (HTTP ${response.status})`,
        );
      }

      if (!data.questionId || !data.slug) {
        throw new Error("投稿レスポンスが不正です");
      }

      onSuccess({ questionId: data.questionId, slug: data.slug });
    } catch (err) {
      // ネットワーク例外もここで捕捉して汎用文言に
      setError(
        err instanceof Error
          ? err.message
          : "投稿に失敗しました。通信環境を確認して再度お試しください",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 送信失敗バナー（カード上部・入力は保持したまま） */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[12px] border border-destructive/40 bg-error-feedback px-4 py-3 text-[14px] text-text-error"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 見出し + サブ（左寄せ） */}
      <div className="space-y-1">
        <h2 className="text-[18px] font-medium leading-7 text-foreground">
          2. 詳しく教えて!
        </h2>
        <p className="text-[14px] text-muted-foreground">
          背景や具体的な内容をみんなに伝えよう
        </p>
      </div>

      {/* タイトル */}
      <div className="space-y-2">
        <label htmlFor="compose-title" className="block text-[14px] text-foreground">
          タイトル
        </label>
        <Input
          id="compose-title"
          value={title}
          onChange={(e) => {
            onTitleChange(e.target.value);
            if (error) setError(null);
          }}
          placeholder="パッとわかりそうな1文を書く"
          maxLength={VALIDATION_RULES.title.maxLength}
          className="h-auto rounded-[16px] border border-input bg-muted/50 p-4 text-base"
        />
        {titleFieldError && (
          <p className="text-[12px] text-text-error">{titleFieldError}</p>
        )}
      </div>

      {/* 内容 */}
      <div className="space-y-2">
        <label htmlFor="compose-content" className="block text-[14px] text-foreground">
          内容
        </label>
        <Textarea
          id="compose-content"
          value={content}
          onChange={(e) => {
            onContentChange(e.target.value);
            if (error) setError(null);
          }}
          placeholder={CONTENT_PLACEHOLDER}
          maxLength={VALIDATION_RULES.content.maxLength}
          className="min-h-[240px] resize-y rounded-[16px] border border-input bg-muted/50 p-4 text-base sm:min-h-[320px]"
        />
        <div className="flex items-center justify-between gap-2">
          {contentFieldError ? (
            <p className="text-[12px] text-text-error">{contentFieldError}</p>
          ) : (
            <span />
          )}
          <span className="text-[12px] text-muted-foreground">
            {content.length} / {VALIDATION_RULES.content.maxLength} 文字
          </span>
        </div>
      </div>

      {/* フッター（カードの padding を貫通する full-bleed） */}
      <div className="-mx-6 -mb-8 mt-2 flex items-center justify-between border-t border-muted px-6 py-5 sm:-mx-10 sm:px-10">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 text-[14px] text-foreground disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          戻る
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="inline-flex h-10 items-center gap-1.5 rounded-[6px] bg-primary px-4 text-[14px] text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              送信中
            </>
          ) : (
            <>
              次へ
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
