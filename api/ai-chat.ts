import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// Sanityコンテンツ取得
// ============================================

async function fetchContext() {
  const [lessons, guides, roadmaps] = await Promise.all([
    // レッスン
    sanityClient.fetch(`*[_type == "lesson"] | order(_createdAt desc)[0...30] {
      _id,
      title,
      "slug": slug.current,
      description,
      "category": category->title,
      tags,
      isPremium,
      "questCount": count(quests)
    }`),

    // ガイド
    sanityClient.fetch(`*[_type == "guide"] | order(publishedAt desc)[0...30] {
      _id,
      title,
      "slug": slug.current,
      description,
      category,
      tags,
      isPremium
    }`),

    // ロードマップ
    sanityClient.fetch(`*[_type == "roadmap" && isPublished == true] | order(order asc)[0...20] {
      _id,
      title,
      "slug": slug.current,
      description,
      tags,
      estimatedDuration
    }`),
  ]);

  return { lessons, guides, roadmaps };
}

function buildContextText(lessons: any[], guides: any[], roadmaps: any[]): string {
  const lines: string[] = [];

  lines.push('## ロードマップ（学習パス）');
  for (const r of roadmaps) {
    lines.push(`- [${r.title}](/roadmaps/${r.slug}): ${r.description || ''}${r.estimatedDuration ? ` (目安: ${r.estimatedDuration})` : ''}`);
    if (r.tags?.length) lines.push(`  タグ: ${r.tags.join(', ')}`);
  }

  lines.push('\n## レッスン（コース）');
  for (const l of lessons) {
    const premium = l.isPremium ? ' 🔒有料' : '';
    lines.push(`- [${l.title}](/lessons/${l.slug})${premium}: ${l.description || ''}`);
    if (l.category) lines.push(`  カテゴリ: ${l.category}`);
    if (l.tags?.length) lines.push(`  タグ: ${l.tags.join(', ')}`);
  }

  lines.push('\n## ガイド（読み物）');
  for (const g of guides) {
    const premium = g.isPremium ? ' 🔒有料' : '';
    const categoryLabel: Record<string, string> = {
      career: 'キャリア', learning: '学習方法', industry: '業界動向', tools: 'ツール・技術',
    };
    lines.push(`- [${g.title}](/guide/${g.slug})${premium}: ${g.description || ''}`);
    if (g.category) lines.push(`  カテゴリ: ${categoryLabel[g.category] ?? g.category}`);
    if (g.tags?.length) lines.push(`  タグ: ${g.tags.join(', ')}`);
  }

  return lines.join('\n');
}

const SYSTEM_PROMPT = `あなたはBONO（UIUXデザイン学習サービス）のラーニングアシスタントです。
ユーザーの質問や悩みに対して、BONOのコンテンツを活用して具体的な学習アドバイスを提供します。

## あなたの役割
- ユーザーの現状と目標を理解する
- 学習ステップを飛ばしていそうな場合は、正しい順序を提案する
- BONOの具体的なコンテンツ（ロードマップ・レッスン・ガイド）を引用してアドバイスする
- リンクは必ずMarkdown形式 [タイトル](URL) で記述する

## 回答の構成
1. ユーザーの状況の整理（1〜2文）
2. まず取り組むべきことの提案（BONOコンテンツを引用）
3. 元の質問への具体的な回答

## 注意事項
- BONOにないコンテンツは「BONOには現在ありませんが〜」と正直に伝える
- 返答は簡潔に。長くなる場合は箇条書きを活用する
- 日本語で回答する`;

// ============================================
// メッセージ型
// ============================================

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ============================================
// ハンドラ
// ============================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body as { messages: ChatMessage[] };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages is required' });
  }

  try {
    // Sanityからコンテンツ取得
    const { lessons, guides, roadmaps } = await fetchContext();
    const contextText = buildContextText(lessons, guides, roadmaps);

    // system promptにコンテンツを注入
    const systemWithContext = `${SYSTEM_PROMPT}

## BONOで学べるコンテンツ一覧
${contextText}`;

    // ストリーミングレスポンス
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Vercelのプロキシバッファリングを無効化

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemWithContext,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('[ai-chat] Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
