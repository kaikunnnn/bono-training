import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// ============================================
// Sanityコンテンツ取得
// ============================================

async function fetchContext() {
  const [lessons, guides, roadmaps] = await Promise.all([
    // Lesson + Quest + Article の階層を一括取得
    sanityClient.fetch(`*[_type == "lesson"] | order(_createdAt desc)[0...30] {
      _id,
      title,
      "slug": slug.current,
      description,
      "category": category->title,
      tags,
      isPremium,
      "quests": *[_type == "quest" && references(^._id)] | order(questNumber asc) {
        questNumber,
        title,
        goal,
        "articles": articles[]->{
          articleNumber,
          title,
          "slug": slug.current,
          excerpt,
          articleType,
          contentType,
          isPremium
        }
      }
    }`),
    sanityClient.fetch(`*[_type == "guide"] | order(publishedAt desc)[0...30] {
      _id,
      title,
      "slug": slug.current,
      description,
      category,
      tags,
      isPremium
    }`),
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

const ARTICLE_TYPE_LABEL: Record<string, string> = {
  explain: '知識',
  intro: 'イントロ',
  practice: '実践',
  challenge: 'チャレンジ',
  demo: '実演解説',
};

function buildContextText(lessons: any[], guides: any[], roadmaps: any[]): string {
  const lines: string[] = [];

  lines.push('## ロードマップ（学習パス）');
  for (const r of roadmaps) {
    lines.push(`- [${r.title}](/roadmaps/${r.slug}): ${r.description || ''}${r.estimatedDuration ? ` (目安: ${r.estimatedDuration})` : ''}`);
    if (r.tags?.length) lines.push(`  タグ: ${r.tags.join(', ')}`);
  }

  lines.push('\n## レッスン（コース）');
  for (const l of lessons) {
    const premium = l.isPremium ? ' [有料]' : '';
    lines.push(`### [${l.title}](/lessons/${l.slug})${premium}`);
    if (l.description) lines.push(`概要: ${l.description}`);
    if (l.tags?.length) lines.push(`タグ: ${l.tags.join(', ')}`);

    // Quest → Article の階層を展開
    if (l.quests?.length) {
      for (const q of l.quests) {
        lines.push(`  ▸ Quest${q.questNumber || ''} 「${q.title}」${q.goal ? ` — ${q.goal}` : ''}`);
        if (q.articles?.length) {
          for (const a of q.articles) {
            const aType = ARTICLE_TYPE_LABEL[a.articleType] || a.articleType || '';
            const aPremium = a.isPremium ? '[有料]' : '';
            const aExcerpt = a.excerpt ? ` — ${a.excerpt}` : '';
            lines.push(`    - [${a.title}](/lessons/${l.slug}?article=${a.slug}) [${aType}]${aPremium}${aExcerpt}`);
          }
        }
      }
    }
    lines.push('');
  }

  lines.push('\n## ガイド（読み物）');
  for (const g of guides) {
    const premium = g.isPremium ? ' [有料]' : '';
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
- URLは必ずコンテンツ一覧に記載された相対パス（/lessonsや/roadmaps で始まる形式）をそのまま使う。絶対URLや存在しないURLは絶対に作らない

## 回答の構成
1. ユーザーの状況の整理（1〜2文）
2. まず取り組むべきことの提案（BONOコンテンツを引用。Quest・記事レベルで具体的に）
3. 元の質問への具体的な回答

## 注意事項
- BONOにないコンテンツは「BONOには現在ありませんが〜」と正直に伝える
- レッスン内の特定のQuestや記事を推薦する場合は、コンテンツ一覧に記載されたリンクを使う
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
    const { lessons, guides, roadmaps } = await fetchContext();
    const contextText = buildContextText(lessons, guides, roadmaps);

    const systemWithContext = `${SYSTEM_PROMPT}\n\n## BONOで学べるコンテンツ一覧\n${contextText}`;

    // ストリーミングレスポンス
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Groq用にメッセージを変換
    const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemWithContext },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      stream: true,
      max_tokens: 1024,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
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
