/**
 * Webflow → Sanity レッスン概要更新スクリプト
 *
 * 目的: 既存のレッスンに purposes と overview を追加
 *
 * 使用方法:
 *   npx tsx scripts/webflow-import/update-lesson-overview.ts --preview  # プレビュー
 *   npx tsx scripts/webflow-import/update-lesson-overview.ts --execute  # 実行
 */

import * as dotenv from 'dotenv';
import { createClient } from '@sanity/client';
import { JSDOM } from 'jsdom';

// Load environment variables
dotenv.config({ path: 'sanity-studio/.env.local' });
dotenv.config({ path: '.env.local' });

// ============================================
// Configuration
// ============================================

const SANITY_PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_STUDIO_DATASET || process.env.VITE_SANITY_DATASET || 'production';
const SANITY_TOKEN = process.env.SANITY_AUTH_TOKEN;
const WEBFLOW_TOKEN = process.env.WEBFLOW_TOKEN || process.env.WEBFLOW_API_TOKEN;

const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';
const SERIES_COLLECTION_ID = '6029d01e01a7fb81007f8e4e';

if (!SANITY_PROJECT_ID || !SANITY_TOKEN) {
  console.error('❌ Missing Sanity configuration');
  process.exit(1);
}

if (!WEBFLOW_TOKEN) {
  console.error('❌ Missing WEBFLOW_API_TOKEN');
  process.exit(1);
}

const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
});

// ============================================
// Types
// ============================================

interface PortableTextBlock {
  _type: 'block';
  _key: string;
  style: string;
  children: PortableTextChild[];
  markDefs?: MarkDef[];
}

interface PortableTextChild {
  _type: 'span';
  _key: string;
  text: string;
  marks?: string[];
}

interface MarkDef {
  _key: string;
  _type: string;
  href?: string;
}

// ============================================
// HTML to Portable Text Converter
// ============================================

function generateKey(): string {
  return Math.random().toString(36).substring(2, 10);
}

function htmlToPortableText(html: string): PortableTextBlock[] {
  if (!html || html.trim() === '') return [];

  const dom = new JSDOM(`<div>${html}</div>`);
  const container = dom.window.document.querySelector('div');
  if (!container) return [];

  const blocks: PortableTextBlock[] = [];

  function processNode(node: Node): void {
    if (node.nodeType === 3) { // Text node
      const text = node.textContent?.trim();
      if (text) {
        blocks.push({
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [{ _type: 'span', _key: generateKey(), text }],
        });
      }
      return;
    }

    if (node.nodeType !== 1) return; // Not an element

    const element = node as Element;
    const tagName = element.tagName.toLowerCase();

    // Handle block-level elements
    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(tagName)) {
      const style = tagName.startsWith('h') ? tagName : 'normal';
      const children = extractInlineContent(element);

      if (children.length > 0) {
        blocks.push({
          _type: 'block',
          _key: generateKey(),
          style,
          children,
        });
      }
    } else if (tagName === 'br') {
      // Skip <br> at block level
    } else if (tagName === 'ul' || tagName === 'ol') {
      // Handle lists
      element.querySelectorAll('li').forEach(li => {
        const children = extractInlineContent(li);
        if (children.length > 0) {
          blocks.push({
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children,
            // Note: Sanity handles lists differently, simplified here
          });
        }
      });
    } else {
      // Process children for other elements
      element.childNodes.forEach(child => processNode(child));
    }
  }

  function extractInlineContent(element: Element): PortableTextChild[] {
    const children: PortableTextChild[] = [];

    function processInline(node: Node, marks: string[] = []): void {
      if (node.nodeType === 3) { // Text node
        const text = node.textContent || '';
        if (text) {
          children.push({
            _type: 'span',
            _key: generateKey(),
            text,
            marks: marks.length > 0 ? [...marks] : undefined,
          });
        }
        return;
      }

      if (node.nodeType !== 1) return;

      const el = node as Element;
      const tag = el.tagName.toLowerCase();

      let newMarks = [...marks];
      if (tag === 'strong' || tag === 'b') newMarks.push('strong');
      if (tag === 'em' || tag === 'i') newMarks.push('em');

      if (tag === 'br') {
        children.push({
          _type: 'span',
          _key: generateKey(),
          text: '\n',
          marks: marks.length > 0 ? [...marks] : undefined,
        });
        return;
      }

      el.childNodes.forEach(child => processInline(child, newMarks));
    }

    element.childNodes.forEach(child => processInline(child));
    return children;
  }

  container.childNodes.forEach(child => processNode(child));

  return blocks;
}

// ============================================
// Webflow API
// ============================================

interface WebflowSeries {
  id: string;
  fieldData?: {
    name?: string;
    slug?: string;
    seriesgoal?: string;
    aboutthisseries?: string;
  };
}

async function fetchAllSeries(): Promise<WebflowSeries[]> {
  const allSeries: WebflowSeries[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = `${WEBFLOW_API_BASE}/collections/${SERIES_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${WEBFLOW_TOKEN}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Webflow API error: ${response.status}`);
    }

    const data = await response.json() as { items: WebflowSeries[] };
    allSeries.push(...data.items);

    if (data.items.length < limit) break;
    offset += limit;
  }

  return allSeries;
}

// ============================================
// Main
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const isPreview = args.includes('--preview');
  const isExecute = args.includes('--execute');

  if (!isPreview && !isExecute) {
    console.log('使用方法:');
    console.log('  --preview  プレビュー（変更なし）');
    console.log('  --execute  実行（Sanityを更新）');
    process.exit(0);
  }

  console.log('🚀 レッスン概要更新スクリプト開始\n');
  console.log(`   モード: ${isPreview ? 'プレビュー' : '実行'}`);
  console.log(`   Project: ${SANITY_PROJECT_ID}`);
  console.log(`   Dataset: ${SANITY_DATASET}\n`);

  // 1. Sanityから webflowSource を持つレッスンを取得
  console.log('📥 Sanityからレッスン一覧を取得中...');
  const lessons = await sanityClient.fetch<Array<{
    _id: string;
    title: string;
    webflowSource: string;
    purposes?: string[];
    overview?: PortableTextBlock[];
  }>>(`*[_type == "lesson" && defined(webflowSource)] {
    _id,
    title,
    webflowSource,
    purposes,
    overview
  }`);
  console.log(`   → ${lessons.length}件のレッスン\n`);

  // 2. Webflowから全Seriesを取得
  console.log('📥 Webflowからシリーズデータを取得中...');
  const allSeries = await fetchAllSeries();
  console.log(`   → ${allSeries.length}件のシリーズ\n`);

  // 3. マッチング＆更新
  console.log('='.repeat(50));
  let updatedCount = 0;
  let skippedCount = 0;

  for (const lesson of lessons) {
    const series = allSeries.find(s => s.id === lesson.webflowSource);

    if (!series) {
      console.log(`⏭️  ${lesson.title}: Webflowデータなし`);
      skippedCount++;
      continue;
    }

    const seriesGoal = series.fieldData?.seriesgoal?.trim();
    const aboutThisSeries = series.fieldData?.aboutthisseries?.trim();

    // 更新データの準備
    const updateData: {
      purposes?: string[];
      overview?: PortableTextBlock[];
    } = {};

    // purposes: seriesgoal があれば配列の最初の要素として設定
    if (seriesGoal && (!lesson.purposes || lesson.purposes.length === 0)) {
      updateData.purposes = [seriesGoal];
    }

    // overview: aboutthisseries があればPortable Textに変換
    if (aboutThisSeries && (!lesson.overview || lesson.overview.length === 0)) {
      const portableText = htmlToPortableText(aboutThisSeries);
      if (portableText.length > 0) {
        updateData.overview = portableText;
      }
    }

    if (Object.keys(updateData).length === 0) {
      console.log(`⏭️  ${lesson.title}: 更新データなし（既にデータあり or Webflowにデータなし）`);
      skippedCount++;
      continue;
    }

    console.log(`\n📝 ${lesson.title}`);
    if (updateData.purposes) {
      console.log(`   purposes: "${updateData.purposes[0]}"`);
    }
    if (updateData.overview) {
      console.log(`   overview: ${updateData.overview.length}ブロック`);
    }

    if (isExecute) {
      await sanityClient.patch(lesson._id).set(updateData).commit();
      console.log(`   ✅ 更新完了`);
    } else {
      console.log(`   (プレビューモード - 実際には更新されません)`);
    }

    updatedCount++;
  }

  // 4. サマリー
  console.log('\n' + '='.repeat(50));
  console.log('📊 結果サマリー');
  console.log('='.repeat(50));
  console.log(`更新対象: ${updatedCount}件`);
  console.log(`スキップ: ${skippedCount}件`);

  if (isPreview && updatedCount > 0) {
    console.log('\n💡 実行するには --execute オプションを付けてください');
  }
}

main().catch(console.error);
