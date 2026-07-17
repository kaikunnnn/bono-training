"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FormattingTextarea } from "@/components/questions/FormattingTextarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ImagePlus, X } from "lucide-react";
import { validateImageFile, resizeImageToWebP } from "@/lib/image-utils";
import { uploadQuestionImage } from "@/app/questions/new/actions";
import { addComment, type QuestionComment } from "@/lib/services/questions";

/** サーバ側・DB と一致させる文字数上限（Figma の 2000 には合わせない） */
const MAX_LENGTH = 5000;

interface QuestionCommentFormProps {
  questionId: string;
  questionSlug: string;
  /** 投稿成功時に呼ばれる（一覧への楽観的追加用） */
  onAdded?: (comment: QuestionComment) => void;
  /** ログインユーザーのアバターURL（未設定はイニシャルfallback） */
  authorAvatarUrl?: string | null;
  /** ログインユーザーの表示名（イニシャルfallback用） */
  authorName?: string;
  /** マウント時にtextareaへフォーカスする（サブ→メイン展開時に使用） */
  autoFocus?: boolean;
}

export function QuestionCommentForm({
  questionId,
  questionSlug,
  onAdded,
  authorAvatarUrl,
  authorName = "",
  autoFocus = false,
}: QuestionCommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 添付画像（1枚固定・任意）。imageBlob: アップロード対象の縮小済み WebP。
  // imagePreviewUrl: その場プレビュー用 objectURL。
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // テキスト入力 or 画像選択のどちらかがあればボタン行を表示する
  const hasInput = content.length > 0 || imagePreviewUrl !== null;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const clearForm = () => {
    setContent("");
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageBlob(null);
    setImagePreviewUrl(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = content.trim();
    if (!trimmed) return;

    startTransition(async () => {
      // 画像があれば先にアップロードして公開URLを得る。失敗時は入力・画像を保持したまま中断。
      let imageUrl: string | undefined;
      if (imageBlob) {
        const formData = new FormData();
        formData.append("file", imageBlob, "attachment.webp");
        const uploadResult = await uploadQuestionImage(formData);
        if (uploadResult.error || !uploadResult.imageUrl) {
          setError(uploadResult.error || "画像の添付に失敗しました");
          return;
        }
        imageUrl = uploadResult.imageUrl;
      }

      const result = await addComment({
        questionId,
        questionSlug,
        content: trimmed,
        ...(imageUrl ? { imageUrl } : {}),
      });
      if (!result.ok) {
        // 失敗時は入力テキスト・画像プレビューを保持したままエラー表示
        setError(result.error);
        return;
      }
      // 成功時のみテキスト・画像 state をクリア
      clearForm();
      // 返ってきたコメントを即座に一覧へ反映しつつ、裏でサーバー状態と同期する
      onAdded?.(result.comment);
      router.refresh();
    });
  };

  // 二重送信・処理中はボタンを無効化する
  const isBusy = isPending || isProcessingImage;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Figma 20:2845: アバター40px + gap-[10px] */}
      <div className="flex items-start gap-[10px]">
        <Avatar className="h-10 w-10 shrink-0 border border-border bg-muted">
          {authorAvatarUrl && (
            <AvatarImage src={authorAvatarUrl} alt={authorName} />
          )}
          <AvatarFallback>{authorName.slice(0, 1) || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          {/* Figma 20:2845: bg-surface / rounded-24 / px-21 py-17 / shadow 0 1 6 8%。
              枠色は実測 #C0C0C0 だと濃いためユーザー指定で DS の border-border に変更 */}
          <FormattingTextarea
            ariaLabel="コメント"
            autoFocus={autoFocus}
            value={content}
            onChange={setContent}
            placeholder="コメントを投稿しよう"
            rows={3}
            maxLength={MAX_LENGTH}
            disabled={isPending}
            containerClassName="rounded-[24px] border border-border bg-surface px-[21px] pb-[10px] pt-[17px] shadow-[var(--shadow-input)]"
            className="min-h-[48px] text-[16px]"
          />

          {/* 画像入力（隠し要素・ref クリックで開く） */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageSelect}
          />

          {/* プレビュー（textarea 下・右上に削除ボタン） */}
          {imagePreviewUrl && (
            <div className="relative w-fit">
              {/* プレビューはローカル objectURL。next/image は blob: を扱えないため素の img */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreviewUrl}
                alt="添付画像プレビュー"
                className="max-h-[240px] max-w-full rounded-[16px] border border-border object-contain"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
                disabled={isPending}
                aria-label="画像を削除"
                className="absolute right-2 top-2 h-8 w-8 rounded-full bg-foreground/70 p-0 text-background hover:bg-foreground hover:text-background"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* 入力を始めたらカウンタ＋ボタン行がアニメーション付きで現れる */}
          <div
            className={`grid overflow-hidden transition-all duration-200 ease-out ${
              hasInput
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0">
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  {/* 画像未添付のときだけ追加ボタンを出す（1枚固定） */}
                  {!imagePreviewUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isBusy}
                      aria-label="画像を追加"
                    >
                      {isProcessingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {content.length} / {MAX_LENGTH}
                  </span>
                </div>
                <Button type="submit" disabled={isBusy || !content.trim()}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    "コメントする"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
