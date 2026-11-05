/**
 * Read-only analysis of learning after a completed BONO lesson.
 *
 * Example:
 *   node --env-file=.env.local scripts/analyze-lesson-continuation.mjs \
 *     --since=2026-06-01 --as-of=2026-09-24
 *
 * Only aggregate numbers are printed. User IDs and individual activity stay in memory.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createSanityClient } from "@sanity/client";

const DAY = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 1000;

function option(name, fallback) {
  const arg = process.argv.find((value) => value.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3) : fallback;
}

function dateAtUtcMidnight(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Dates must use YYYY-MM-DD.");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date.valueOf();
}

async function readAll(table, columns) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase
      .from(table)
      .select(columns);
    for (const column of table === "user_subscriptions"
      ? ["user_id", "environment"]
      : ["user_id", table === "article_progress" ? "article_id" : "lesson_id"]) {
      query = query.order(column, { ascending: true });
    }
    const { data, error } = await query.range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE_SIZE) return rows;
  }
}

function pct(count, denominator) {
  return denominator ? Math.round((count / denominator) * 1000) / 10 : null;
}

function summarize(anchors, completionsByUser, lessonById, include30d) {
  let within24h = 0;
  let within7d = 0;
  let newLessonWithin7d = 0;
  let within30d = 0;
  const byLesson = new Map();

  for (const anchor of anchors) {
    const other = (completionsByUser.get(anchor.userId) ?? []).filter(
      (row) => row.lessonId !== anchor.lessonId && row.at > anchor.at
    );
    const first = other[0];
    const row = byLesson.get(anchor.lessonId) ?? { n: 0, within7d: 0 };
    row.n += 1;
    if (first && first.at - anchor.at <= 7 * DAY) {
      within7d += 1;
      row.within7d += 1;
      if (first.at - anchor.at <= DAY) within24h += 1;
      const hadPriorCompletion = (completionsByUser.get(anchor.userId) ?? []).some(
        (item) => item.lessonId === first.lessonId && item.at < anchor.at
      );
      if (!hadPriorCompletion) newLessonWithin7d += 1;
    }
    if (include30d && first && first.at - anchor.at <= 30 * DAY) within30d += 1;
    byLesson.set(anchor.lessonId, row);
  }

  return {
    completions: anchors.length,
    people: new Set(anchors.map((row) => row.userId)).size,
    anotherArticleWithin24h: within24h,
    anotherArticleWithin7d: within7d,
    anotherArticleWithin7dPct: pct(within7d, anchors.length),
    noAnotherArticleWithin7dPct: pct(anchors.length - within7d, anchors.length),
    noPriorArticleInNextLessonWithin7d: newLessonWithin7d,
    ...(include30d ? {
      anotherArticleWithin30d: within30d,
      anotherArticleWithin30dPct: pct(within30d, anchors.length),
    } : {}),
    byCompletedLesson: [...byLesson.entries()]
      .map(([lessonId, value]) => ({
        lesson: lessonById.get(lessonId)?.title ?? "[現行CMSにないレッスン]",
        people: value.n,
        anotherArticleWithin7d: value.within7d,
        pct: pct(value.within7d, value.n),
      }))
      .sort((a, b) => b.people - a.people),
  };
}

const since = dateAtUtcMidnight(option("since", "2026-06-01"));
const asOf = dateAtUtcMidnight(option("as-of", new Date().toISOString().slice(0, 10)));
const membership = option("membership", "active");
if (!["active", "ever"].includes(membership)) {
  throw new Error("--membership must be active or ever.");
}
const currentContentOnly = option("current-content-only", "true") === "true";
if (asOf - since <= 30 * DAY) throw new Error("The interval must exceed 30 days.");
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sanityProjectId = process.env.SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const sanityDataset = process.env.SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET;
if (!supabaseUrl || !serviceKey || !sanityProjectId || !sanityDataset) {
  throw new Error("Supabase and Sanity server configuration is required.");
}
const supabase = createSupabaseClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});
const sanity = createSanityClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: true,
});

const [subscriptions, articleRows, lessonRows, lessons] = await Promise.all([
  readAll("user_subscriptions", "user_id,environment,is_active,plan_type,created_at"),
  readAll("article_progress", "user_id,article_id,lesson_id,status,completed_at"),
  readAll("lesson_progress", "user_id,lesson_id,status,completed_at"),
  sanity.fetch(`*[_type == "lesson"]{
    _id, title, "slug": slug.current,
    "articleIds": array::unique(quests[]->articles[]->_id)
  }`),
]);

const memberSinceByUser = new Map(
  subscriptions
    .filter((row) =>
      row.environment === "live" &&
      ["standard", "feedback"].includes(row.plan_type) &&
      (membership === "ever" || row.is_active)
    )
    .map((row) => [row.user_id, Date.parse(row.created_at)])
);
const members = new Set(memberSinceByUser.keys());
const lessonById = new Map(lessons.map((lesson) => [lesson._id, lesson]));
const unknownLessonArticleCompletions = articleRows.filter(
  (row) => row.status === "completed" && !lessonById.has(row.lesson_id)
).length;
const articleCompletionsOutsideCurrentLesson = articleRows.filter((row) => {
  if (row.status !== "completed") return false;
  const lesson = lessonById.get(row.lesson_id);
  return lesson && !(lesson.articleIds ?? []).includes(row.article_id);
}).length;
const completionsByUser = new Map();
const completedArticleByUserLesson = new Map();
for (const row of articleRows) {
  if (!members.has(row.user_id) || row.status !== "completed" || !row.completed_at) continue;
  if (currentContentOnly && !(lessonById.get(row.lesson_id)?.articleIds ?? []).includes(row.article_id)) {
    continue;
  }
  const at = Date.parse(row.completed_at);
  if (Number.isNaN(at)) continue;
  const completion = { lessonId: row.lesson_id, articleId: row.article_id, at };
  const userRows = completionsByUser.get(row.user_id) ?? [];
  userRows.push(completion);
  completionsByUser.set(row.user_id, userRows);
  const key = `${row.user_id}:${row.lesson_id}`;
  const lessonArticles = completedArticleByUserLesson.get(key) ?? new Map();
  lessonArticles.set(row.article_id, at);
  completedArticleByUserLesson.set(key, lessonArticles);
}
for (const rows of completionsByUser.values()) rows.sort((a, b) => a.at - b.at);

const manualAnchors = lessonRows
  .filter((row) => members.has(row.user_id) && row.status === "completed" && row.completed_at)
  .map((row) => ({ userId: row.user_id, lessonId: row.lesson_id, at: Date.parse(row.completed_at) }))
  .filter((row) => Number.isFinite(row.at) && row.at >= memberSinceByUser.get(row.userId));
const articleAnchors = [];
for (const [key, articleDates] of completedArticleByUserLesson) {
  const split = key.indexOf(":");
  const userId = key.slice(0, split);
  const lessonId = key.slice(split + 1);
  const lesson = lessonById.get(lessonId);
  const articleIds = (lesson?.articleIds ?? []).filter(Boolean);
  if (articleIds.length === 0 || !articleIds.every((id) => articleDates.has(id))) continue;
  articleAnchors.push({
    userId,
    lessonId,
    at: Math.max(...articleIds.map((id) => articleDates.get(id))),
  });
}

function report(label, anchors, maxAgeDays) {
  const latestAnchor = asOf - maxAgeDays * DAY;
  const eligible = anchors.filter((row) =>
    row.at >= since && row.at < latestAnchor && row.at >= memberSinceByUser.get(row.userId)
  );
  const firstByUser = new Map();
  for (const anchor of eligible) {
    const previous = firstByUser.get(anchor.userId);
    if (!previous || anchor.at < previous.at) firstByUser.set(anchor.userId, anchor);
  }
  return {
    definition: label,
    perCompletion: summarize(eligible, completionsByUser, lessonById, maxAgeDays >= 30),
    perMemberFirstCompletion: summarize(
      [...firstByUser.values()], completionsByUser, lessonById, maxAgeDays >= 30
    ),
  };
}

console.log(JSON.stringify({
  asOf: new Date(asOf).toISOString().slice(0, 10),
  since: new Date(since).toISOString().slice(0, 10),
  membership,
  currentContentOnly,
  liveMembersInScope: members.size,
  source: {
    currentArticleCompletions: articleRows.filter((row) => row.status === "completed").length,
    articleCompletionsWithoutTimestamp: articleRows.filter(
      (row) => row.status === "completed" && !row.completed_at
    ).length,
    articleCompletionsForUnknownLesson: unknownLessonArticleCompletions,
    articleCompletionsOutsideCurrentLesson,
    currentManualLessonCompletions: lessonRows.filter((row) => row.status === "completed").length,
    manualLessonCompletionsWithoutTimestamp: lessonRows.filter(
      (row) => row.status === "completed" && !row.completed_at
    ).length,
    cmsLessons: lessons.length,
  },
  sevenDay: [
    report("manual lesson completion", manualAnchors, 7),
    report("all current lesson articles completed", articleAnchors, 7),
  ],
  thirtyDay: [
    report("manual lesson completion", manualAnchors, 30),
    report("all current lesson articles completed", articleAnchors, 30),
  ],
}, null, 2));
