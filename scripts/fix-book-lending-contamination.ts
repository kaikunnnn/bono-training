/**
 * 本貸出（book-lending-system）コンテンツ汚染の修正スクリプト
 *
 * 背景:
 *   training タスクの import 時に、book-lending-system の sections（お題説明）が
 *   他トレーニングの content.md frontmatter `sections:` に丸ごとコピペされ、
 *   それが Sanity の trainingTask.sections[] にも取り込まれてしまった。
 *   各お題の「正しい本文」は body markdown（= Sanity の "本文" セクション）に存在する。
 *
 * このスクリプトが直すもの:
 *   (A) Sanity: 汚染された trainingTask ドキュメントの sections[] を、
 *       既存の "本文" セクション1つ（正しい body の Portable Text）に置き換える。
 *       → markdown→PT 変換は行わず、既に正しい PT を再利用するので安全。
 *   (B) Storage: kintai-kyuka-shinsei の content.md frontmatter `title:` が
 *       本貸出のままなので、正しいお題タイトルに修正する。
 *
 * このスクリプトが触らないもの:
 *   - Storage frontmatter の `sections:` 汚染（現状コードでは描画に未使用＝潜在的）。
 *     hygiene 目的の別フェーズとして扱う。
 *   - book-lending-system 自身（正規データ）。
 *
 * 実行:
 *   npx tsx scripts/fix-book-lending-contamination.ts            # dry-run（既定・変更なし）
 *   npx tsx scripts/fix-book-lending-contamination.ts --apply    # 実適用
 *
 * 適用前に各 Sanity ドキュメントの現 sections を scripts/.backups/ に保存する。
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";
import { mkdirSync, writeFileSync } from "fs";

config({ path: resolve(__dirname, "..", ".env.local") });

const APPLY = process.argv.includes("--apply");
const MODE = APPLY ? "APPLY" : "DRY-RUN";

// 本貸出セクションの識別文字列（汚染の指紋）
const BOOK_MARKER = "社内で必要な本を、確実に借りて返せるようにしたい";
// 汚染の出どころ（これは正規データなので除外）
const SOURCE_SLUG = "book-lending-system";

// (B) kintai title 修正
const KINTAI_PATH = "kintai-kyuka-shinsei/tasks/explain/content.md";
const KINTAI_WRONG_TITLE = "お題について：社内本貸し出しシステム";
const KINTAI_CORRECT_TITLE = "お題について：休暇申請システム";

const SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || "production";
const SANITY_API_VERSION =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN;

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "training-content";

if (APPLY && !SANITY_WRITE_TOKEN) {
  console.error("⚠️  --apply には SANITY_WRITE_TOKEN が必要です");
  process.exit(1);
}
if (APPLY && (!SUPABASE_URL || !SERVICE_ROLE)) {
  console.error("⚠️  --apply には SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が必要です");
  process.exit(1);
}

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  token: SANITY_WRITE_TOKEN,
  useCdn: false,
});

interface Section {
  _key: string;
  sectionTitle?: string;
  sectionType?: string;
  content?: unknown[];
}
interface TaskDoc {
  _id: string;
  title?: string;
  tslug?: string;
  sections?: Section[];
}

const firstHeading = (content: unknown[] | undefined): string => {
  for (const b of content || []) {
    const blk = b as { _type?: string; style?: string; children?: { text?: string }[] };
    if (blk._type === "block" && /^h[1-3]$/.test(blk.style || "")) {
      return (blk.children || []).map((c) => c.text || "").join("").trim();
    }
  }
  // 見出しが無ければ最初の非空テキスト
  for (const b of content || []) {
    const blk = b as { _type?: string; children?: { text?: string }[] };
    const t = (blk.children || []).map((c) => c.text || "").join("").trim();
    if (t) return t;
  }
  return "(本文に見出しなし)";
};

async function fixSanity() {
  console.log("\n========== (A) Sanity sections 汚染修正 ==========");

  // 汚染ドキュメントを自動検出: 先頭セクションが本貸出 marker かつ出どころ以外
  const docs: TaskDoc[] = await sanity.fetch(
    `*[_type=="trainingTask"
        && training->slug.current != $src
        && sections[0].sectionTitle match $marker
      ]{ _id, title, "tslug": training->slug.current, sections }`,
    { src: SOURCE_SLUG, marker: BOOK_MARKER + "*" }
  );

  if (!docs.length) {
    console.log("汚染ドキュメントは検出されませんでした（既に修正済みの可能性）。");
    return;
  }

  console.log(`検出: ${docs.length} 件\n`);
  const backupDir = resolve(__dirname, ".backups");
  if (APPLY) mkdirSync(backupDir, { recursive: true });

  for (const doc of docs) {
    const secs = doc.sections || [];
    const hon = secs.find((s) => s.sectionTitle === "本文");

    console.log(`■ ${doc._id}`);
    console.log(`   training : ${doc.tslug}`);
    console.log(`   title    : ${doc.title}`);
    console.log(`   現 sections: ${secs.length} 個（先頭 = "${secs[0]?.sectionTitle?.slice(0, 30)}…" ← 本貸出）`);

    if (!hon) {
      console.log(`   ⚠️  "本文" セクションが見つからないためスキップ（要手動確認）\n`);
      continue;
    }
    const honHeading = firstHeading(hon.content);
    console.log(`   "本文" 先頭見出し: 「${honHeading}」 ← この内容で1セクションに置き換え`);
    console.log(`   → 新 sections: 1 個（sectionTitle="" / content=本文の ${hon.content?.length ?? 0} ブロック）`);

    // 安全弁: 本文がまだ本貸出のままなら触らない
    if (honHeading.includes("社内で必要な本") && doc.tslug !== SOURCE_SLUG) {
      console.log(`   ⚠️  "本文" も本貸出に見えるためスキップ（要手動確認）\n`);
      continue;
    }

    const newSection: Section = {
      ...hon,
      sectionTitle: "", // 余計な見出しを出さない（本文内部の h2 が先頭になる）
    };

    if (APPLY) {
      writeFileSync(
        resolve(backupDir, `${doc._id}.sections.json`),
        JSON.stringify(secs, null, 2)
      );
      await sanity.patch(doc._id).set({ sections: [newSection] }).commit();
      console.log(`   ✅ 適用済み（バックアップ: scripts/.backups/${doc._id}.sections.json）\n`);
    } else {
      console.log(`   (dry-run: 変更なし)\n`);
    }
  }
}

async function fixKintaiTitle() {
  console.log("\n========== (B) kintai Storage title 修正 ==========");
  const headers = {
    Authorization: `Bearer ${SERVICE_ROLE}`,
    apikey: SERVICE_ROLE as string,
  };
  const getUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${KINTAI_PATH}`;
  const res = await fetch(getUrl, { headers });
  if (!res.ok) {
    console.log(`   ⚠️  取得失敗 (${res.status})。スキップ。`);
    return;
  }
  const md = await res.text();

  const hasWrong = md.includes(`title: "${KINTAI_WRONG_TITLE}"`);
  console.log(`   path        : ${KINTAI_PATH}`);
  console.log(`   現 title    : ${hasWrong ? KINTAI_WRONG_TITLE + " ← 誤り" : "(誤りタイトル未検出)"}`);
  console.log(`   修正後 title: ${KINTAI_CORRECT_TITLE}`);

  if (!hasWrong) {
    console.log(`   (既に修正済み or タイトル形が想定外。スキップ)\n`);
    return;
  }

  const fixed = md.replace(
    `title: "${KINTAI_WRONG_TITLE}"`,
    `title: "${KINTAI_CORRECT_TITLE}"`
  );

  if (APPLY) {
    const putRes = await fetch(getUrl, {
      method: "PUT",
      headers: { ...headers, "x-upsert": "true", "Content-Type": "text/markdown" },
      body: fixed,
    });
    if (!putRes.ok) {
      console.log(`   ⚠️  アップロード失敗 (${putRes.status}: ${await putRes.text()})\n`);
      return;
    }
    console.log(`   ✅ 適用済み\n`);
  } else {
    console.log(`   (dry-run: 変更なし)\n`);
  }
}

async function main() {
  console.log(`\n##### 本貸出汚染 修正スクリプト [${MODE}] #####`);
  console.log(`Sanity: ${SANITY_PROJECT_ID}/${SANITY_DATASET}`);
  await fixSanity();
  await fixKintaiTitle();
  console.log("##### 完了 #####");
  if (!APPLY) {
    console.log("\n→ 内容を確認後、適用するには: npx tsx scripts/fix-book-lending-contamination.ts --apply");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
