"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { IconButton } from "@/components/ui/button/IconButton";
import { IconCheck } from "@/components/ui/icon-check";
import { useToast } from "@/hooks/use-toast";
import {
  toggleArticleCompletion,
  getLessonStatus,
  removeLessonCompletion,
} from "@/lib/services/progress";
import { useArticleCompletionOptional } from "@/contexts/ArticleCompletionContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CompletionButtonProps {
  articleId: string;
  lessonId: string;
  initialIsCompleted: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  onCompletionChange?: (isCompleted: boolean) => void;
}

export function CompletionButton({
  articleId,
  lessonId,
  initialIsCompleted,
  showLabel = true,
  onCompletionChange,
}: CompletionButtonProps) {
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isPending, startTransition] = useTransition();
  const [showUndoConfirmDialog, setShowUndoConfirmDialog] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const prevCompletedRef = useRef(isCompleted);
  const completionCtx = useArticleCompletionOptional();

  // Context の sharedIsCompleted で他のボタンと同期
  useEffect(() => {
    if (completionCtx?.sharedIsCompleted !== null && completionCtx?.sharedIsCompleted !== undefined) {
      setIsCompleted(completionCtx.sharedIsCompleted);
    }
  }, [completionCtx?.sharedIsCompleted]);

  // false→true 切り替え時に burst を発火
  useEffect(() => {
    const prev = prevCompletedRef.current;
    prevCompletedRef.current = isCompleted;
    if (!prev && isCompleted) {
      setBurstKey((k) => k + 1);
    }
  }, [isCompleted]);

  const handleToggle = () => {
    startTransition(async () => {
      // 完了済みを取り消す場合、レッスン完了チェック
      if (isCompleted) {
        try {
          const lessonStatus = await getLessonStatus(lessonId);
          if (lessonStatus === "completed") {
            setShowUndoConfirmDialog(true);
            return;
          }
        } catch {
          // getLessonStatus失敗時はそのまま続行
        }
      }

      const result = await toggleArticleCompletion(articleId, lessonId);

      if (result.success) {
        setIsCompleted(result.isCompleted);
        onCompletionChange?.(result.isCompleted);
        // セレブレーションはContext経由（ArticleDetailClient）で発火
        completionCtx?.onCompletionChange(result.isCompleted);
        // Context外の場合のみフォールバックトースト
        if (!completionCtx) {
          toast({ title: result.message });
        }
      } else {
        toast({
          title: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleConfirmUndo = () => {
    setShowUndoConfirmDialog(false);
    startTransition(async () => {
      await removeLessonCompletion(lessonId);
      const result = await toggleArticleCompletion(articleId, lessonId);

      if (result.success) {
        setIsCompleted(result.isCompleted);
        onCompletionChange?.(result.isCompleted);
        completionCtx?.onCompletionChange(result.isCompleted);
        toast({ title: result.message });
      }
    });
  };

  if (isPending) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {showLabel && <span>処理中...</span>}
      </div>
    );
  }

  return (
    <>
      <IconButton
        icon={
          <IconCheck
            isCompleted={isCompleted}
            tone="strong"
            animateOnComplete
            popMs={120}
            drawMs={360}
          />
        }
        label={showLabel ? (isCompleted ? "完了済み" : "完了にする") : ""}
        onClick={handleToggle}
        burstKey={burstKey}
        burstSync="press-release-start"
        burstVariant="candy"
        burstDistanceScale={1.25}
        pressBounce
        pressBounceConfig={{
          downMs: 520,
          upMs: 700,
          downScale: 0.92,
          upScale: 1.08,
        }}
      />

      <AlertDialog open={showUndoConfirmDialog} onOpenChange={setShowUndoConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>レッスン完了を解除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このレッスンは完了済みです。記事の完了を解除すると、レッスンの完了も解除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUndo}>
              解除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
