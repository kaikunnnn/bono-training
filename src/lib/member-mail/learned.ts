/**
 * 会員メール（327-D）の「学んだ」の判定。純粋関数のみ。
 *
 * 分析側（rebono/99_analytics/health_check/engagement.py）の #274「始めた」と同じ数え方を写す:
 * - 活動ログ member_activity_events の行のうち、event_type が PROGRESS_KINDS のもの
 *   （完了ボタン article_complete・記事を読んだ article_read・動画 video_progress（meta.percent が75以上だけ）・video_complete）
 * - article_id が無い行は数えない（分析側の SQL も article_id IS NOT NULL）
 * - 入会日（日本時間の0時）以降の行だけ（分析側の since＝課金日）
 * - 学習用のレッスンの記事だけ（engagement._lesson_of と同じ判定）
 *   - 記録のレッスンが学習用でない5レッスン（はじめかた・フィードバック集・勉強会アーカイブ・ラジオ・コミュニティ）→ 数えない
 *   - 記録のレッスンが公開の学習用レッスンなら、その記事がそのレッスンにあるときだけ数える
 *   - 記録のレッスンが無い・公開でないときは、記事を含む学習用レッスンがあれば数える
 *     （分析側は2つ以上あると「どのレッスンか決められない」として外すが、ここでは「学んだか」だけを見るので数える。
 *      数える側に寄せると「学んだ人に送ってしまう」より「送らない」に倒れる）
 *   - どのレッスンにも入っていない単独の記事 → 数えない
 * 分析側の定義が変わったら、ここも合わせる（テスト: src/__tests__/lib/member-mail/standing.test.ts）。
 */
import type { ProgressEvent } from "./types";

export const PROGRESS_KINDS = ["article_complete", "article_read", "video_progress", "video_complete"] as const;
export const VIDEO_PROGRESS_PERCENT = 75;

/** 学習用でないレッスン（Sanity の lesson _id）。engagement.NON_LEARNING_LESSON_IDS の写し */
export const NON_LEARNING_LESSON_IDS: ReadonlySet<string> = new Set([
  "mf6C7BORqP3p9w1l7txBZ6", // bono-onboarding（BONOのはじめかた）
  "PGqGZxK4L4IsRU1CbFAtxE", // feedback（BONOフィードバック集）
  "g4rl1HmkpTXIsvYhaJgVID", // bono-session（BONO勉強会アーカイブ）
  "g4rl1HmkpTXIsvYhaJx4QT", // bonoradio（BONOラジオ）
  "g4rl1HmkpTXIsvYhaKUXos", // bonokomiyunitei（BONOコミュニティ）
]);

/** Sanity から読むレッスンと記事のつながり */
export interface LessonSource {
  lessonId: string;
  articleIds: (string | null)[];
}
/** 記事側から quest → lesson でつながる記事（分析側の lessons_with_article_quests と同じく両方見る） */
export interface ArticleLessonLink {
  articleId: string;
  lessonId: string | null;
}

export interface LessonIndex {
  /** 学習用レッスン → 記事ID */
  articlesByLesson: Map<string, Set<string>>;
  /** 記事ID → それを含む学習用レッスンの数 */
  learningOwners: Map<string, number>;
}

const DRAFTS = "drafts.";
function cleanId(value: string | null | undefined): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  return value.startsWith(DRAFTS) ? value.slice(DRAFTS.length) : value;
}

export function buildLessonIndex(lessons: readonly LessonSource[], links: readonly ArticleLessonLink[] = []): LessonIndex {
  const all = new Map<string, Set<string>>();
  for (const lesson of lessons) {
    const id = cleanId(lesson.lessonId);
    if (!id) continue;
    const set = all.get(id) ?? new Set<string>();
    for (const a of lesson.articleIds) {
      const article = cleanId(a);
      if (article) set.add(article);
    }
    all.set(id, set);
  }
  for (const link of links) {
    const lessonId = cleanId(link.lessonId);
    const article = cleanId(link.articleId);
    // 公開レッスン（lessons にあるもの）にだけ足す
    if (lessonId && article && all.has(lessonId)) all.get(lessonId)!.add(article);
  }
  const articlesByLesson = new Map<string, Set<string>>();
  const learningOwners = new Map<string, number>();
  for (const [lessonId, articles] of all) {
    if (NON_LEARNING_LESSON_IDS.has(lessonId)) continue;
    articlesByLesson.set(lessonId, articles);
    for (const a of articles) learningOwners.set(a, (learningOwners.get(a) ?? 0) + 1);
  }
  return { articlesByLesson, learningOwners };
}

function readPercent(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** 1行が「学んだ」に入るか（入会日などの期間は呼び出し側で見る） */
export function isLearningEvent(event: ProgressEvent, index: LessonIndex): boolean {
  if (!(PROGRESS_KINDS as readonly string[]).includes(event.eventType)) return false;
  if (event.eventType === "video_progress") {
    const percent = readPercent(event.percent);
    if (percent === null || percent < VIDEO_PROGRESS_PERCENT) return false;
  }
  const article = cleanId(event.articleId);
  if (!article) return false;
  const lesson = cleanId(event.lessonId);
  if (lesson && NON_LEARNING_LESSON_IDS.has(lesson)) return false;
  if (lesson && index.articlesByLesson.has(lesson)) return index.articlesByLesson.get(lesson)!.has(article);
  return (index.learningOwners.get(article) ?? 0) > 0;
}

/** 「学んだ」人（sinceByUser: 人ごとの数え始め。入っていない人の行は見ない） */
export function learnedUserIds(
  events: readonly ProgressEvent[],
  index: LessonIndex,
  sinceByUser: ReadonlyMap<string, Date>,
): Set<string> {
  const out = new Set<string>();
  for (const e of events) {
    const since = sinceByUser.get(e.userId);
    if (!since || e.occurredAt < since) continue;
    if (isLearningEvent(e, index)) out.add(e.userId);
  }
  return out;
}
