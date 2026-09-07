import {
  getCommentsByQuestion,
  getReactionCountsMap,
  getMyReactions,
  type ReactionKey,
} from "@/lib/services/questions";
import { QuestionCommentsSection } from "@/components/questions/QuestionCommentsSection";

interface QuestionCommentsBoundaryProps {
  questionId: string;
  questionSlug: string;
  currentUserId: string | null;
  currentUserAvatarUrl?: string | null;
  currentUserName?: string;
  profileIncomplete?: boolean;
}

/**
 * コメント欄のデータ取得（ステージA + B）を内包した非同期 Server Component（#160 S2）。
 *
 * 質問本文カードの初期表示をブロックしないよう、この Component を詳細ページ側で
 * <Suspense> でラップしてストリーミングする。データ取得（コメント一覧・コメント
 * リアクション集計・自分のコメントリアクション）はここに閉じているため、
 * 「本文が先に出て、コメント欄だけ後から出る」体験になる。
 *
 * ※ 呼び出し側で hasFullAccess を確認済みであること（メンバー限定）。
 */
export async function QuestionCommentsBoundary({
  questionId,
  questionSlug,
  currentUserId,
  currentUserAvatarUrl,
  currentUserName,
  profileIncomplete,
}: QuestionCommentsBoundaryProps) {
  // ステージA: コメント取得（コメントIDが後段のステージBで必要）
  const comments = await getCommentsByQuestion(questionId);

  // ステージB: コメントのIDが確定してから、コメントに対するリアクション集計と
  // 自分のリアクションを並列で取得する（コメントが存在する場合のみ）。
  let commentReactionCountsMap: Record<string, Record<ReactionKey, number>> = {};
  const myCommentReactionsByCommentId: Record<string, ReactionKey[]> = {};

  if (comments.length > 0) {
    const commentIds = comments.map((c) => c.id);
    const [cReactionMap, cMine] = await Promise.all([
      getReactionCountsMap({
        targetType: "comment",
        targetIds: commentIds,
      }),
      currentUserId
        ? getMyReactions({
            targetType: "comment",
            targetIds: commentIds,
          })
        : Promise.resolve([]),
    ]);
    commentReactionCountsMap = cReactionMap;
    cMine.forEach((r) => {
      if (!myCommentReactionsByCommentId[r.targetId]) {
        myCommentReactionsByCommentId[r.targetId] = [];
      }
      myCommentReactionsByCommentId[r.targetId].push(r.reaction);
    });
  }

  return (
    <QuestionCommentsSection
      questionId={questionId}
      questionSlug={questionSlug}
      initialComments={comments}
      commentReactionCounts={commentReactionCountsMap}
      myCommentReactions={myCommentReactionsByCommentId}
      currentUserId={currentUserId}
      currentUserAvatarUrl={currentUserAvatarUrl}
      currentUserName={currentUserName}
      profileIncomplete={profileIncomplete}
    />
  );
}

/**
 * コメント欄の Suspense フォールバック用スケルトン。
 * 高さを確保して本文→コメント欄の差し替え時にレイアウトシフト（CLS）を抑える。
 * QuestionCommentsSection の外枠（mt-8 pt-8 pb-6 / gap-8）に構造を合わせる。
 */
export function QuestionCommentsSkeleton() {
  return (
    <section
      className="mt-8 flex flex-col gap-8 pt-8 pb-6"
      aria-hidden="true"
    >
      {/* 見出し「コメント N件」相当（アイコン+テキスト行） */}
      <div className="h-7 w-32 animate-pulse rounded-md bg-gray-200" />
      {/* 入力フォーム相当（アバター + 入力欄の高さ確保） */}
      <div className="flex gap-4">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
        <div className="h-24 flex-1 animate-pulse rounded-md bg-gray-200" />
      </div>
      {/* コメント2件分のプレースホルダ */}
      <div className="space-y-6">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
