"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { IconButton } from "@/components/ui/button/IconButton";
import { IconCheck } from "@/components/ui/icon-check";
import { useToast } from "@/hooks/use-toast";
import {
  setArticleCompletion,
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
  // useTransition は startTransition のためだけに使用（isPending はガードに使わない）
  const [, startTransition] = useTransition();
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
    // 完了 OFF 操作で、レッスンが手動完了済みなら確認ダイアログ
    if (isCompleted && completionCtx?.lessonStatus === "completed") {
      setShowUndoConfirmDialog(true);
      return;
    }

    // 楽観的に即時 UI 更新（連続クリックを許可、isPending ガードなし）
    const nextState = !isCompleted;
    applyState(nextState);

    startTransition(async () => {
      // setArticleCompletion は target state を明示的に指定 → race condition 回避
      const result = await setArticleCompletion(articleId, lessonId, nextState);

      if (!result.success) {
        // rollback
        applyState(!nextState);
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
      const result = await setArticleCompletion(articleId, lessonId, false);

      if (!result.success) {
        // rollback
        applyState(true);
        toast({ title: result.message, variant: "destructive" });
      } else {
        toast({ title: result.message });
      }
    });
  };

  // 楽観的 UI 化 + 連続クリック許可のため isPending スピナーや disabled は使わない
  // race 対策は setArticleCompletion(target=明示) で実現

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
