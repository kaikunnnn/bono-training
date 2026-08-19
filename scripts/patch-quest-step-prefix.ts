/**
 * オンボーディングの3クエストのタイトルに「ステップN: 」を順番に付ける。
 *   npx tsx scripts/patch-quest-step-prefix.ts --dry-run
 *   npx tsx scripts/patch-quest-step-prefix.ts
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
const DRY_RUN = process.argv.includes("--dry-run");
if (!process.env.SANITY_WRITE_TOKEN && !DRY_RUN) { console.error("⚠️ SANITY_WRITE_TOKEN 必要"); process.exit(1); }
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01", token: process.env.SANITY_WRITE_TOKEN, useCdn: false,
});

const QUESTS: { slug: string; step: number; base: string }[] = [
  { slug: "bono-onboarding-q1-start", step: 1, base: "スキルアップの準備をしよう" },
  { slug: "bono-onboarding-q2-community", step: 2, base: "コミュニティを使おう" },
  { slug: "bono-onboarding-q3-plan", step: 3, base: "計画を立てよう" },
];

async function main() {
  console.log(`\n${DRY_RUN ? "🧪 DRY RUN" : "🚀 PRODUCTION"}\n`);
  for (const q of QUESTS) {
    const doc = await client.fetch<{ _id: string; title: string } | null>(
      `*[_type=="quest"&&slug.current==$s][0]{_id,title}`, { s: q.slug });
    if (!doc) { console.error(`⛔ quest なし: ${q.slug}`); process.exit(1); }
    const newTitle = `ステップ${q.step}: ${q.base}`;
    console.log(`${q.slug}: "${doc.title}" → "${newTitle}"`);
    if (!DRY_RUN) await client.patch(doc._id).set({ title: newTitle }).commit();
  }
  console.log(`\n${DRY_RUN ? "ℹ️ DRY RUN" : "✨ 完了"}`);
}
main().catch((e) => { console.error("💥", e); process.exit(1); });
