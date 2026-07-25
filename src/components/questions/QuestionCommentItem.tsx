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
  /** 編集保存成功時に呼ばれる（一覧への即時反映用。router.refresh を待たない） */
  onUpdated?: (commentId: string, content: string) => void;
}

// 「7月14日 18:00」形式（年なし・スラッシュ不可。元投稿の表記と揃える。ユーザー指定）
// toLocaleString は年なしだと「7/14」になるため手組みする
function formatDate(iso: string): string {
  const d = new Date(iso);
  const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${d.getMonth() + 1}月${d.getDate()}日 ${time}`;
}

export function QuestionCommentItem({
  comment,
  questionSlug,
  currentUserId,
  reactionCounts,
  myReactions,
  onDeleted,
  onUpdated,
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
      // 一覧 state に即時反映（本文の差し替え +（編集済み）表示）。裏で refresh して再同期
      onUpdated?.(comment.id, trimmed);
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
        {/* 960px以上ではユーザー指定の余白（左右32px / 上8px。下は20pxのまま） */}
        <div className="w-full rounded-[16px] bg-surface p-5 shadow-comment-card min-[960px]:px-8 min-[960px]:pt-2">
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
              {/* 編集はテキストのみ。画像は変更UIなしでそのまま表示し続ける（スコープ外） */}
              {comment.imageUrl && (
                <div>
                  {/* 添付画像。Supabase Storage で縮小済みのため素の img で表示 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={comment.imageUrl}
                    alt="添付画像"
                    loading="lazy"
                    className="max-w-full rounded-[16px] border border-border"
                  />
                </div>
              )}
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
              {/* 本文 16px（元投稿18pxより一段小さく。ユーザー指定） */}
              <FormattedText
                text={comment.content}
                className="text-[16px] leading-8 text-foreground"
              />
              {comment.imageUrl && (
                <div className="mt-3">
                  {/* 添付画像。Supabase Storage で縮小済みのため素の img で表示 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={comment.imageUrl}
                    alt="添付画像"
                    loading="lazy"
                    className="max-w-full rounded-[16px] border border-border"
                  />
                </div>
              )}
              {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

              {/* フッター：左=リアクション / 右=日付。divider無し（ユーザー指定でFigma 135:4877から変更） */}
              <div className="mt-4 flex items-center justify-between">
                <ReactionButtons
                  targetType="comment"
                  targetId={comment.id}
                  counts={reactionCounts}
                  myReactions={myReactions}
                  canReact={currentUserId !== null}
                  size="md"
                  keys={["thanks"]}
                />
                <span className="text-[12px] leading-[18px] text-muted-foreground">
                  {formatDate(comment.updatedAt)}
                  {wasEdited && <span className="ml-1">（編集済み）</span>}
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
