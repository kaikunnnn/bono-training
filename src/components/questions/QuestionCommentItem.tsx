"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FormattingTextarea } from "@/components/questions/FormattingTextarea";
import { FormattedText } from "@/components/questions/FormattedText";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Loader2 } from "lucide-react";
import {
  deleteComment,
  updateComment,
  type QuestionComment,
  type ReactionKey,
} from "@/lib/services/questions";
import { ReactionButtons } from "./ReactionButtons";

interface QuestionCommentItemProps {
  comment: QuestionComment;
  questionSlug: string;
  currentUserId: string | null;
  reactionCounts: Record<ReactionKey, number>;
  myReactions: ReactionKey[];
  /** 削除成功時に呼ばれる（一覧からの即時除去用） */
  onDeleted?: (commentId: string) => void;
}

// 月日+時刻で統一（元投稿の表記と揃える。ユーザー指定）
function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function QuestionCommentItem({
  comment,
  questionSlug,
  currentUserId,
  reactionCounts,
  myReactions,
  onDeleted,
}: QuestionCommentItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOwner = currentUserId === comment.userId;
  const wasEdited = comment.updatedAt !== comment.createdAt;

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === comment.content) {
      setIsEditing(false);
      setDraft(comment.content);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await updateComment({
        commentId: comment.id,
        questionSlug,
        content: trimmed,
      });
      if (!res.ok) {
        setError(res.error || "更新に失敗しました");
        return;
      }
      setIsEditing(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
    setError(null);
    startTransition(async () => {
      const res = await deleteComment({ commentId: comment.id, questionSlug });
      if (!res.ok) {
        setError(res.error || "削除に失敗しました");
        return;
      }
      onDeleted?.(comment.id);
      router.refresh();
    });
  };

  return (
    // Figma 135:4877: アバターはカード外・左（40px）、右カラムに名前行＋白カード
    <li className="flex items-start gap-[17px]">
      <Avatar className="h-10 w-10 shrink-0">
        {comment.authorAvatarUrl && (
          <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} />
        )}
        <AvatarFallback>{comment.authorName.slice(0, 1)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-[9px]">
        {/* 名前行（カード外・カード上）：左=投稿者名 / 右=本人メニュー */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[16px] font-medium leading-[22.5px] text-foreground">
            {comment.authorName}
          </span>
          {isOwner && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 shrink-0 p-0"
                  aria-label="メニュー"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setConfirmingDelete(true)}
                  className="text-destructive focus:text-destructive"
                >
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* 白カード：本文 + カード内フッター */}
        <div className="w-full rounded-[16px] bg-surface p-5 shadow-comment-card">
          {isEditing ? (
            <div className="space-y-2">
              <FormattingTextarea
                ariaLabel="コメント編集"
                value={draft}
                onChange={setDraft}
                rows={3}
                maxLength={5000}
                disabled={isPending}
                containerClassName="rounded-[16px] border border-input bg-surface p-3"
                className="min-h-[72px]"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setDraft(comment.content);
                    setError(null);
                  }}
                  disabled={isPending}
                >
                  キャンセル
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      保存中
                    </>
                  ) : (
                    "保存"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* 本文（元投稿と同じ 18px / leading-9） */}
              <FormattedText
                text={comment.content}
                className="text-[18px] leading-9 text-foreground"
              />
              {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

              {/* フッター：左=リアクション / 右=日付（Figma 135:4877） */}
              <div className="mt-5 flex items-start justify-between border-t border-border pt-6">
                <ReactionButtons
                  targetType="comment"
                  targetId={comment.id}
                  counts={reactionCounts}
                  myReactions={myReactions}
                  canReact={currentUserId !== null}
                  size="md"
                  keys={["thanks"]}
                />
                <span className="text-[14px] leading-5 text-muted-foreground">
                  {formatDate(comment.createdAt)}
                  {wasEdited && (
                    <span className="ml-1 text-[12px]">（編集済み）</span>
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>コメントを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              削除したコメントは元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
