/**
 * AIアシスタント 動作確認スクリプト
 * 実行: node scripts/test-ai-chat.mjs
 */

import { createClient } from '@sanity/client';
import Groq from 'groq-sdk';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local');
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=[\"']?(.+?)[\"']?$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    }
  } catch (e) {
    console.error('⚠️  .env.local が読めませんでした');
  }
}

loadEnv();

const SANITY_PROJECT_ID = process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ============================================
// Step 1: 環境変数チェック
// ============================================
console.log('\n=== Step 1: 環境変数チェック ===');
console.log(`SANITY_PROJECT_ID  : ${SANITY_PROJECT_ID ? '✅ ' + SANITY_PROJECT_ID : '❌ 未設定'}`);
console.log(`GROQ_API_KEY       : ${GROQ_API_KEY ? '✅ 設定済み' : '❌ 未設定'}`);

if (!SANITY_PROJECT_ID || !GROQ_API_KEY) {
  console.error('\n❌ 必要な環境変数が不足しています。テストを中断します。');
  if (!GROQ_API_KEY) {
    console.error('   GROQ_API_KEY は console.groq.com でアカウント作成後、API Keys から取得してください。');
  }
  process.exit(1);
}

// ============================================
// Step 2: Sanity接続テスト
// ============================================
console.log('\n=== Step 2: Sanityコンテンツ取得テスト ===');

const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

let lessons = [], guides = [], roadmaps = [];

try {
  [lessons, guides, roadmaps] = await Promise.all([
    sanityClient.fetch(`*[_type == "lesson"][0...5] {
      _id, title, "slug": slug.current, description, tags, isPremium,
      "quests": *[_type == "quest" && references(^._id)] | order(questNumber asc) {
        questNumber, title, goal,
        "articles": articles[]->{
          articleNumber, title, "slug": slug.current, excerpt, articleType, isPremium
        }
      }
    }`),
    sanityClient.fetch(`*[_type == "guide"][0...5] { _id, title, "slug": slug.current, description }`),
    sanityClient.fetch(`*[_type == "roadmap" && isPublished == true][0...5] { _id, title, "slug": slug.current, description }`),
  ]);

  console.log(`✅ レッスン    : ${lessons.length}件`);
  if (lessons[0]) console.log(`   例) 「${lessons[0].title}」→ /lessons/${lessons[0].slug}`);

  console.log(`${guides.length > 0 ? '✅' : '⚠️ '} ガイド      : ${guides.length}件${guides.length === 0 ? ' (Sanityにまだ記事なし・想定内)' : ''}`);
  if (guides[0]) console.log(`   例) 「${guides[0].title}」→ /guide/${guides[0].slug}`);

  console.log(`✅ ロードマップ: ${roadmaps.length}件`);
  if (roadmaps[0]) console.log(`   例) 「${roadmaps[0].title}」→ /roadmaps/${roadmaps[0].slug}`);

} catch (err) {
  console.error('❌ Sanity接続エラー:', err.message);
  process.exit(1);
}

// ============================================
// Step 3: Groq APIテスト（ストリーミング）
// ============================================
console.log('\n=== Step 3: Groq APIストリーミングテスト ===');

const ARTICLE_TYPE_LABEL = {
  explain: '知識', intro: 'イントロ', practice: '実践', challenge: 'チャレンジ', demo: '実演解説',
};

function buildTestContext(lessons, guides, roadmaps) {
  const lines = [];
  lines.push('## ロードマップ');
  for (const r of roadmaps) {
    lines.push(`- [${r.title}](/roadmaps/${r.slug}): ${r.description || ''}`);
  }
  lines.push('\n## レッスン');
  for (const l of lessons) {
    lines.push(`### [${l.title}](/lessons/${l.slug})`);
    if (l.description) lines.push(`概要: ${l.description}`);
    if (l.quests?.length) {
      for (const q of l.quests) {
        lines.push(`  ▸ Quest${q.questNumber || ''} 「${q.title}」${q.goal ? ` — ${q.goal}` : ''}`);
        for (const a of q.articles || []) {
          const aType = ARTICLE_TYPE_LABEL[a.articleType] || a.articleType || '';
          const aExcerpt = a.excerpt ? ` — ${a.excerpt}` : '';
          lines.push(`    - [${a.title}](/lessons/${l.slug}?article=${a.slug}) [${aType}]${aExcerpt}`);
        }
      }
    }
    lines.push('');
  }
  lines.push('\n## ガイド');
  if (guides.length > 0) {
    for (const g of guides) lines.push(`- [${g.title}](/guide/${g.slug}): ${g.description || ''}`);
  } else {
    lines.push('(まだ記事はありません)');
  }
  return lines.join('\n');
}

const SYSTEM_PROMPT = `あなたはBONO（UIUXデザイン学習サービス）のラーニングアシスタントです。
ユーザーの質問に対して、BONOのコンテンツを活用して具体的な学習アドバイスを提供します。
リンクは必ずMarkdown形式 [タイトル](URL) で記述してください。日本語で回答してください。

## BONOで学べるコンテンツ
${buildTestContext(lessons, guides, roadmaps)}`;

const TEST_CASES = [
  {
    id: 'T-03',
    label: '基本応答テスト',
    input: 'こんにちは',
  },
  {
    id: 'T-05',
    label: 'ロードマップ推薦テスト（核心）',
    input: 'Figmaの操作を一通り勉強し終えて、ポートフォリオに載せる作品を制作中です。これでいいですか？',
  },
  {
    id: 'T-06',
    label: '転職相談テスト',
    input: '未経験からUIUXデザイナーに転職したいです。何から始めればいいですか？',
  },
];

const groq = new Groq({ apiKey: GROQ_API_KEY });

let allPassed = true;

for (const tc of TEST_CASES) {
  console.log(`\n--- ${tc.id}: ${tc.label} ---`);
  console.log(`入力: 「${tc.input}」\n`);
  process.stdout.write('応答: ');

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: tc.input },
      ],
      stream: true,
      max_tokens: 512,
    });

    let fullText = '';
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      process.stdout.write(text);
      fullText += text;
    }
    console.log('\n');

    // チェック
    const hasContent = fullText.length > 30;
    const isJapanese = /[ぁ-ん]/.test(fullText);
    const hasLink = /\[.+\]\(\/.+\)/.test(fullText);

    console.log(`  応答長: ${hasContent ? '✅' : '❌'} ${fullText.length}文字`);
    console.log(`  日本語: ${isJapanese ? '✅' : '❌'}`);
    console.log(`  BONOリンク: ${hasLink ? '✅ あり' : '⚠️  なし（コンテンツ0件の場合は正常）'}`);

    if (!hasContent || !isJapanese) allPassed = false;

  } catch (err) {
    console.error(`\n  ❌ エラー: ${err.message}`);
    allPassed = false;
  }
}

// ============================================
// 最終結果
// ============================================
console.log('\n=== テスト完了 ===');
if (allPassed) {
  console.log('✅ 全テストパス。AIアシスタントは正常に動作しています。');
} else {
  console.log('❌ 一部テスト失敗。上記のエラーを確認してください。');
}
