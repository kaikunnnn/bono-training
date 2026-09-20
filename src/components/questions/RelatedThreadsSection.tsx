import {
  getRelatedQuestions,
  getRecentQuestions,
  type QuestionListItem,
} from "@/lib/services/questions";
import { QuestionCard } from "@/components/questions/QuestionCard";

interface RelatedThreadsSectionProps {
  /** 現在表示中のスレッドの Sanity _id（両セクションから除外する） */
  currentQuestionId: string;
  /** 現在表示中のスレッドのカテゴリ slug（関連セクションの絞り込みに使う。未設定なら関連は非表示） */
  categorySlug?: string;
  /** エンゲージメント（コメント数・スタンプ数）を表示するか（一覧カードと同条件） */
  showEngagement: boolean;
}

/** セクション見出し（詳細ページの流儀：18-20px bold text-foreground） */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[19px] font-bold leading-7 text-foreground">
      {children}
    </h2>
  );
}

function CardList({
  items,
  showEngagement,
}: {
  items: QuestionListItem[];
  showEngagement: boolean;
}) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      {items.map((item) => (
        <QuestionCard
          key={item.question._id}
          item={item}
          showEngagement={showEngagement}
        />
      ))}
    </div>
  );
}

/**
 * 詳細ページ末尾の「関連するスレッド」「最近のスレッド」コーナー（#140 スライスD）。
 *
 * - 関連するスレッド: 同じカテゴリの他スレッド 最大2件（現在表示中を除外）。0件なら非表示。
 * - 最近のスレッド: 最新2件（現在表示中＋関連に出したものを除外）。0件なら非表示。
 * - カードは一覧と同じ QuestionCard を流用。
 *
 * この Server Component 自体を Suspense でラップして遅延ロードするため、
 * データ取得はここに閉じている（詳細ページ本体の初期表示を止めない）。
 */
export async function RelatedThreadsSection({
  currentQuestionId,
  categorySlug,
  showEngagement,
}: RelatedThreadsSectionProps) {
  // 関連と最近候補を並列取得する。最近は重複除去分を見込んで4件取得し、
  // 関連に出したIDをサーバー上で除いてから既存どおり最大2件にする。
  const [related, recentCandidates] = await Promise.all([
    categorySlug
      ? getRelatedQuestions({
          categorySlug,
          excludeIds: [currentQuestionId],
          limit: 2,
        })
      : Promise.resolve([]),
    getRecentQuestions({
      excludeIds: [currentQuestionId],
      limit: 4,
    }),
  ]);
  const relatedIds = new Set(related.map((item) => item.question._id));
  const recent = recentCandidates
    .filter((item) => !relatedIds.has(item.question._id))
    .slice(0, 2);

  // どちらも無ければコーナーごと非表示
  if (related.length === 0 && recent.length === 0) return null;

  return (
    <div className="mt-12 flex flex-col gap-10 border-t border-border pt-10">
      {related.length > 0 && (
        <section>
          <SectionHeading>関連するスレッド</SectionHeading>
          <CardList items={related} showEngagement={showEngagement} />
        </section>
      )}
      {recent.length > 0 && (
        <section>
          <SectionHeading>最近のスレッド</SectionHeading>
          <CardList items={recent} showEngagement={showEngagement} />
        </section>
      )}
    </div>
  );
}
