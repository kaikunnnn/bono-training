"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FormattingTextarea } from "@/components/questions/FormattingTextarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
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

  // 文字入力が始まったらボタン行を表示する（focus だけでは出さない）
  const hasInput = content.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = content.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await addComment({ questionId, questionSlug, content: trimmed });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setContent("");
      // 返ってきたコメントを即座に一覧へ反映しつつ、裏でサーバー状態と同期する
      onAdded?.(result.comment);
      router.refresh();
    });
  };

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
          {/* Figma 20:2845: bg-surface / rounded-24 / px-21 py-17 / border #C0C0C0 / shadow 0 1 6 8% */}
          <FormattingTextarea
            ariaLabel="コメント"
            autoFocus={autoFocus}
            value={content}
            onChange={setContent}
            placeholder="コメントを投稿しよう"
            rows={3}
            maxLength={MAX_LENGTH}
            disabled={isPending}
            containerClassName="rounded-[24px] border border-[var(--border-input-strong)] bg-surface px-[21px] pb-[10px] pt-[17px] shadow-[var(--shadow-input)]"
            className="min-h-[48px] text-[16px]"
          />
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
                <span className="text-xs text-muted-foreground">
                  {content.length} / {MAX_LENGTH}
                </span>
                <Button type="submit" disabled={isPending || !content.trim()}>
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
