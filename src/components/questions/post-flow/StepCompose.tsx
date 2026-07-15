"use client";

/**
 * Step2 投稿作成フォーム（#139 スライス3）
 *
 * タイトル + 本文を1画面に統合し、「投稿する」＝送信を担う中核ステップ。
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

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  ImagePlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormattingTextarea } from "@/components/questions/FormattingTextarea";
import { createClient } from "@/lib/supabase/client";
import { validateImageFile, resizeImageToWebP } from "@/lib/image-utils";
import { uploadQuestionImage } from "@/app/questions/new/actions";

// サーバー側（/api/questions/submit）と一致させる。ズレると UX とサーバー拒否が食い違う。
const VALIDATION_RULES = {
  title: { minLength: 5, maxLength: 100 },
  content: { minLength: 20, maxLength: 5000 },
};

const CONTENT_PLACEHOLDER = `話したいことや聞きたいことを詳しく書き込みましょう。
・「理由」や「背景」が明確なほど答えやすいです。
・リンクがあるならリンクも貼るとよいでしょう
（## 見出し・**太字**・- 箇条書き が使えます）`;

/** 送信成功時に返す最小限の結果 */
export interface ComposeResult {
  questionId: string;
  slug: string;
  /** 初投稿（このユーザーの post_count が 0→1）なら true。完了画面のお祝い切替に使う（#149） */
  isFirstPost?: boolean;
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

  // 添付画像（1枚固定）。StepCompose 内ローカル state で保持する。
  // 戻る→再入場で消える点は許容（親 state に持たせていない）。
  // imageBlob: アップロード対象の縮小済み WebP。imagePreviewUrl: その場プレビュー用 objectURL。
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    // 同じファイルを選び直せるよう input をリセット
    e.target.value = "";
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error ?? "画像を選択し直してください");
      return;
    }

    setError(null);
    setIsProcessingImage(true);
    try {
      const blob = await resizeImageToWebP(file);
      // 既存プレビューがあれば objectURL を解放してから差し替え
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImageBlob(blob);
      setImagePreviewUrl(URL.createObjectURL(blob));
    } catch {
      setError("画像の処理に失敗しました。別の画像でお試しください");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageBlob(null);
    setImagePreviewUrl(null);
  };

  const titleTrimmedLen = title.trim().length;
  const contentTrimmedLen = content.trim().length;

  // 「投稿する」有効条件（サーバー値と一致）。空白のみは無効にする。
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

      // 画像があれば先にアップロードして公開URLを得る。失敗時は送信中断。
      let imageUrl: string | undefined;
      if (imageBlob) {
        const formData = new FormData();
        formData.append("file", imageBlob, "attachment.webp");
        const uploadResult = await uploadQuestionImage(formData);
        if (uploadResult.error || !uploadResult.imageUrl) {
          setError(
            uploadResult.error ||
              "画像のアップロードに失敗しました。もう一度お試しください",
          );
          setIsSubmitting(false);
          return;
        }
        imageUrl = uploadResult.imageUrl;
      }

      const payload = {
        title,
        categoryId,
        questionContent: content,
        ...(imageUrl ? { imageUrl } : {}),
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
      let data: {
        questionId?: string;
        slug?: string;
        error?: string;
        isFirstPost?: boolean;
      } = {};
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

      onSuccess({
        questionId: data.questionId,
        slug: data.slug,
        isFirstPost: data.isFirstPost === true,
      });
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
        <Label htmlFor="compose-title" className="text-[14px]">
          タイトル
        </Label>
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
        <Label htmlFor="compose-content" className="text-[14px]">
          内容
        </Label>
        <FormattingTextarea
          id="compose-content"
          ariaLabel="内容"
          value={content}
          onChange={(next) => {
            onContentChange(next);
            if (error) setError(null);
          }}
          placeholder={CONTENT_PLACEHOLDER}
          maxLength={VALIDATION_RULES.content.maxLength}
          containerClassName="rounded-[16px] border border-input bg-muted/50 p-4"
          className="min-h-[240px] text-base sm:min-h-[320px]"
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

      {/* 画像添付（1枚固定・任意） */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageSelect}
        />
        {imagePreviewUrl ? (
          <div className="relative w-fit">
            {/* プレビューはローカル objectURL。next/image は blob: を扱えないため素の img */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreviewUrl}
              alt="添付画像プレビュー"
              className="max-h-[240px] max-w-full rounded-[16px] border border-border object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={isSubmitting}
              aria-label="画像を削除"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/70 text-background transition-opacity hover:bg-foreground disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingImage || isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-input bg-transparent px-3 py-2 text-[14px] text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {isProcessingImage ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                画像を処理中
              </>
            ) : (
              <>
                <ImagePlus size={16} />
                画像を追加
              </>
            )}
          </button>
        )}
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
        {/* 共通Buttonコンポーネント（スタイルは全サイズ統一・defaultサイズ） */}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="mr-1.5 animate-spin" />
              送信中
            </>
          ) : (
            <>
              投稿する
              <ArrowRight size={16} className="ml-1.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
