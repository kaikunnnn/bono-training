/**
 * オンボーディングレッスン（bono-onboarding）の overview / purposes / quest titles を更新。
 *   npx tsx scripts/patch-onboarding-overview.ts --dry-run
 *   npx tsx scripts/patch-onboarding-overview.ts
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import crypto from "crypto";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
const DRY_RUN = process.argv.includes("--dry-run");
if (!process.env.SANITY_WRITE_TOKEN && !DRY_RUN) { console.error("⚠️ SANITY_WRITE_TOKEN 必要"); process.exit(1); }
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01", token: process.env.SANITY_WRITE_TOKEN, useCdn: false,
});

const randKey = () => crypto.randomBytes(6).toString("hex");
const para = (text: string) => ({
  _type: "block", _key: randKey(), style: "normal", markDefs: [],
  children: [{ _type: "span", _key: randKey(), marks: [], text }],
});

const OVERVIEW = [
  para("このレッスンは、BONOに登録したあなたが、最初の7ステップで「サービスの基本の使い方」「学習の進め方」「コミュニティでの動き方」を一気に整えるためのガイドです。"),
  para("まずはSlackコミュニティに参加し、これから取り組む最初のレッスンを決めます。次に、自己紹介・質問・Timesを通じて、コミュニティで最初のアクションを起こします。最後に、2週間単位の学習計画を立てて、続けられる仕組みをつくります。"),
  para("ここを一通り終えると、BONOを「なんとなく見る」状態から「自分で進められる」状態に切り替わります。順番どおりに進めれば迷いません。各記事の「完了」ボタンを押しながら、1つずつ進めていきましょう。"),
];

const PURPOSES = [
  "Slackコミュニティに参加し、質問・相談・交流の場を使えるようになる",
  "自分に合ったコンテンツを選び、最初に取り組む1つを決められる",
  "自己紹介・質問・Timesで、コミュニティで最初のアクションを起こせる",
  "2週間単位の学習計画を立て、続けられる仕組みをつくれる",
];

const QUEST_TITLES: { slug: string; title: string }[] = [
  { slug: "bono-onboarding-q1-start", title: "スキルアップの準備をしよう" },
  { slug: "bono-onboarding-q2-community", title: "コミュニティを使おう" },
  { slug: "bono-onboarding-q3-plan", title: "計画を立てよう" },
];

async function main() {
  console.log(`\n${DRY_RUN ? "🧪 DRY RUN" : "🚀 PRODUCTION"}\n`);
  // lesson
  const lesson = await client.fetch<{ _id: string } | null>(`*[_type=="lesson"&&slug.current=="bono-onboarding"][0]{_id}`);
  if (!lesson) { console.error("⛔ lesson なし"); process.exit(1); }
  console.log(`Lesson ${lesson._id}: overview(${OVERVIEW.length}block) + purposes(${PURPOSES.length})`);
  if (!DRY_RUN) await client.patch(lesson._id).set({ overview: OVERVIEW, purposes: PURPOSES }).commit();

  // quests
  for (const q of QUEST_TITLES) {
    const doc = await client.fetch<{ _id: string; title: string } | null>(`*[_type=="quest"&&slug.current==$s][0]{_id,title}`, { s: q.slug });
    if (!doc) { console.error(`⛔ quest なし: ${q.slug}`); process.exit(1); }
    console.log(`Quest ${q.slug}: "${doc.title}" → "${q.title}"`);
    if (!DRY_RUN) await client.patch(doc._id).set({ title: q.title }).commit();
  }
  console.log(`\n${DRY_RUN ? "ℹ️ DRY RUN" : "✨ 完了"}`);
}
main().catch((e) => { console.error("💥", e); process.exit(1); });
