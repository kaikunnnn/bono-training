"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import type { QuestionComment, ReactionKey } from "@/lib/services/questions";
import { emptyReactionCounts } from "@/lib/services/questions-utils";
import { QuestionCommentForm } from "./QuestionCommentForm";
import { QuestionCommentItem } from "./QuestionCommentItem";
import { ProfileSetupPromptModal } from "./ProfileSetupPromptModal";
import { shouldShowProfilePrompt } from "@/lib/profile-utils";

interface QuestionCommentsSectionProps {
  questionId: string;
  questionSlug: string;
  initialComments: QuestionComment[];
  commentReactionCounts: Record<string, Record<ReactionKey, number>>;
  myCommentReactions: Record<string, ReactionKey[]>;
  currentUserId: string | null;
  /** ログインユーザーのアバターURL（入力フォームのアバター表示用） */
  currentUserAvatarUrl?: string | null;
  /** ログインユーザーの表示名（入力フォームのイニシャルfallback用） */
  currentUserName?: string;
  /** 表示名・アイコンが未設定か。コメント完了後に設定を促す（#142） */
  profileIncomplete?: boolean;
}

/**
 * コメント一覧 + 投稿フォーム。
 * サーバーから受けた initialComments を state に持ち、投稿/削除を待たずに
 * 画面へ即時反映する（裏で router.refresh によりサーバー状態と再同期）。
 */
export function QuestionCommentsSection({
  questionId,
  questionSlug,
  initialComments,
  commentReactionCounts,
  myCommentReactions,
  currentUserId,
  currentUserAvatarUrl,
  currentUserName = "",
  profileIncomplete = false,
}: QuestionCommentsSectionProps) {
  const [comments, setComments] = useState(initialComments);
  // サブ導線（一覧下部の枠線ボタン）を押すとメインと同じ入力フォームへ展開する。
  // 一方向の切り替えでよい（リロードするまで戻せなくてOK）。
  const [subFormOpen, setSubFormOpen] = useState(false);
  // プロフィール設定促しモーダルの開閉（#142）
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  // このマウント中に一度でも促したか。2回目以降のコメントで連続表示しないためのガード
  const promptedRef = useRef(false);

  // 通知（#comment-<id>）から遷移してきたときに一時ハイライトする対象コメントID（#160）
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(
    null,
  );
  // 処理済みの hash。comments 更新（router.refresh）のたびに再スクロールしないためのガード
  const handledHashRef = useRef<string | null>(null);
  // ハイライト解除タイマー。effect の cleanup で消すと、ハイライト中に comments が
  // 更新された場合にタイマーが消えて二度と再セットされず（handledHashRef ガードで早期 return）、
  // ハイライトが消えなくなる。そのため ref で持ち、アンマウント時のみ破棄する。
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // アンマウント時にハイライト解除タイマーを破棄する
  useEffect(
    () => () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    },
    [],
  );

  // router.refresh() 後に届く最新のサーバー状態で上書きする
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // 通知アンカーへのスクロール + ハイライト（#160）。
  // コメントはストリーミングで後から描画されるため、ブラウザ標準の #comment-x ジャンプは
  // 要素が存在する前に発火して失敗する。そこで JS で「コメントが描画された後に」
  // scrollIntoView する。対象が見つからない間は comments 更新のたびに再試行する。
  useEffect(() => {
    const hash = window.location.hash; // 例: "#comment-<uuid>"
    const match = hash.match(/^#comment-(.+)$/);
    if (!match) return;
    // 既にこの hash を処理済みなら何もしない（refresh で comments が変わっても再スクロールしない）
    if (handledHashRef.current === hash) return;

    const targetId = match[1];
    const el = document.getElementById(`comment-${targetId}`);
    if (!el) {
      // まだ描画されていない or 一覧に存在しない（削除・別ページ等）。
      // 描画待ちなら次の comments 更新で再試行される。存在しないなら握って何もしない。
      console.debug(
        "[QuestionCommentsSection] target comment not yet in list:",
        targetId,
      );
      return;
    }

    handledHashRef.current = hash;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "center",
    });
    setHighlightedCommentId(targetId);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(
      () => setHighlightedCommentId(null),
      2500,
    );
  }, [comments]);

  const handleAdded = (comment: QuestionComment) => {
    setComments((prev) =>
      prev.some((c) => c.id === comment.id) ? prev : [...prev, comment],
    );
    // コメント完了後、表示名・アイコンが未設定なら設定を促す（#142）。
    // 30日抑制中や、このマウント中に一度promptした後は出さない。
    if (
      profileIncomplete &&
      !promptedRef.current &&
      shouldShowProfilePrompt()
    ) {
      promptedRef.current = true;
      setShowProfilePrompt(true);
    }
  };

  const handleDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  // 編集保存の即時反映。updatedAt も進めて「（編集済み）+ 編集時刻」が保存直後から見えるようにする
  const handleUpdated = (commentId: string, content: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, content, updatedAt: new Date().toISOString() }
          : c,
      ),
    );
  };

  return (
    // Figma 135:4406: divider（border-t）なしのフラットセクション / pt-8 pb-6 / gap-8。
    <section className="mt-8 flex flex-col gap-8 pt-8 pb-6">
      {/* 見出しブロック：アイコン16px + 「コメント N件」 Rounded Mplus Bold 14px。
          0件時のメッセージはこのブロック内（見出し直下・gap-9px）に表示する */}
      <div className="flex flex-col gap-[9px]">
        <h2 className="flex items-center gap-[5px] font-rounded-mplus text-[14px] font-bold leading-7 text-foreground">
          <MessageSquare className="h-4 w-4" />
          コメント {comments.length}件
        </h2>
        {comments.length === 0 && (
          <p className="text-[14px] leading-5 text-foreground">
            まだコメントがありません。最初のコメントを書きましょう。
          </p>
        )}
      </div>

      {/* メイン入力：コメント一覧の先頭（元の投稿のすぐ下） */}
      <QuestionCommentForm
        questionId={questionId}
        questionSlug={questionSlug}
        onAdded={handleAdded}
        authorAvatarUrl={currentUserAvatarUrl}
        authorName={currentUserName}
      />

      {comments.length > 0 && (
        <ul className="space-y-6">
          {comments.map((c) => (
            <QuestionCommentItem
              key={c.id}
              comment={c}
              questionSlug={questionSlug}
              currentUserId={currentUserId}
              reactionCounts={
                commentReactionCounts[c.id] ?? emptyReactionCounts()
              }
              myReactions={myCommentReactions[c.id] ?? []}
              onDeleted={handleDeleted}
              onUpdated={handleUpdated}
              highlighted={c.id === highlightedCommentId}
            />
          ))}
        </ul>
      )}

      {/* サブ導線：一覧下部の枠線ボタン → 押すとメインと同じ入力フォームに展開（一方向）。
          コメント0件のときはメイン入力だけで十分なので非表示。 */}
      {comments.length > 0 &&
        (subFormOpen ? (
          <QuestionCommentForm
            questionId={questionId}
            questionSlug={questionSlug}
            onAdded={handleAdded}
            authorAvatarUrl={currentUserAvatarUrl}
            authorName={currentUserName}
            autoFocus
          />
        ) : (
          // コメントカードと左端・横幅を揃える（アバター40px + gap17px = 57px）
          <div className="pl-[57px]">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setSubFormOpen(true)}
            >
              <MessageSquare className="h-4 w-4" />
              コメントする
            </Button>
          </div>
        ))}

      <ProfileSetupPromptModal
        open={showProfilePrompt}
        onOpenChange={setShowProfilePrompt}
      />
    </section>
  );
}
