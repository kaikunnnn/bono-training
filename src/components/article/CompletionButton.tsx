"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { IconButton } from "@/components/ui/button/IconButton";
import { IconCheck } from "@/components/ui/icon-check";
import { useToast } from "@/hooks/use-toast";
import {
  toggleArticleCompletion,
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

  // 状態を楽観的に更新する共通処理（成功時/rollback時の両方で使う）
  const applyState = (next: boolean) => {
    setIsCompleted(next);
    onCompletionChange?.(next);
    completionCtx?.onCompletionChange(next);
  };

  const handleToggle = () => {
    if (isPending) return; // 多重クリック防止

    // 完了済みを取り消す場合
    if (isCompleted) {
      // レッスンが手動完了済みなら確認ダイアログ（Server Action なし、Context の値を参照）
      if (completionCtx?.lessonStatus === "completed") {
        setShowUndoConfirmDialog(true);
        return;
      }

      // 楽観的更新: 即時 UI を OFF に
      applyState(false);

      startTransition(async () => {
        const result = await toggleArticleCompletion(articleId, lessonId);

        if (!result.success) {
          // rollback
          applyState(true);
          toast({ title: result.message, variant: "destructive" });
        } else if (!completionCtx) {
          toast({ title: result.message });
        }
      });
      return;
    }

    // 完了 ON にする場合: 楽観的に即時更新
    applyState(true);

    startTransition(async () => {
      const result = await toggleArticleCompletion(articleId, lessonId);

      if (!result.success) {
        // rollback
        applyState(false);
        toast({ title: result.message, variant: "destructive" });
      } else if (!completionCtx) {
        toast({ title: result.message });
      }
    });
  };

  const handleConfirmUndo = () => {
    setShowUndoConfirmDialog(false);

    // 楽観的更新: 即時 UI を OFF に
    applyState(false);

    startTransition(async () => {
      await removeLessonCompletion(lessonId);
      const result = await toggleArticleCompletion(articleId, lessonId);

      if (!result.success) {
        // rollback
        applyState(true);
        toast({ title: result.message, variant: "destructive" });
      } else {
        toast({ title: result.message });
      }
    });
  };

  // 楽観的 UI 化したため isPending スピナーは表示しない（UI を即時切り替え）
  // 多重クリック防止は handleToggle 内 `if (isPending) return;` でガード

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
