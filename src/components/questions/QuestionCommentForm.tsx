"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { addComment, type QuestionComment } from "@/lib/services/questions";

interface QuestionCommentFormProps {
  questionId: string;
  questionSlug: string;
  /** 投稿成功時に呼ばれる（一覧への楽観的追加用） */
  onAdded?: (comment: QuestionComment) => void;
}

export function QuestionCommentForm({
  questionId,
  questionSlug,
  onAdded,
}: QuestionCommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="コメントを書く..."
        rows={3}
        maxLength={5000}
        disabled={isPending}
      />
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-muted-foreground">
          {content.length} / 5000
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
    </form>
  );
}
