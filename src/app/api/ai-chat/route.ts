import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { client } from "@/lib/sanity";

// Edge ではなく Node.js 環境で実行（Groq SDK の streaming に必要）
export const runtime = "nodejs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

// ============================================================
// Sanity コンテンツ取得（Vite 版の構造をそのまま踏襲）
// ============================================================

async function fetchContext() {
  const sanity = client();
  // Groq の payload 制限（413）回避のため取得を絞る
  // - lessons: 最新 20、Quest タイトルだけ（articles 展開なし、tags 省略）
  // - guides: 最新 20、description は省略してタイトル + カテゴリのみ
  // - roadmaps: 最新 15、description は短めに
  const [lessons, guides, roadmaps] = await Promise.all([
    sanity.fetch(`*[_type == "lesson"] | order(_createdAt desc)[0...20] {
      title,
      "slug": slug.current,
      description,
      "category": category->title,
      isPremium,
      "quests": *[_type == "quest" && references(^._id)] | order(questNumber asc) {
        questNumber,
        title,
        goal
      }
    }`),
    sanity.fetch(`*[_type == "guide"] | order(publishedAt desc)[0...20] {
      title,
      "slug": slug.current,
      description,
      category,
      isPremium
    }`),
    sanity.fetch(`*[_type == "roadmap" && isPublished == true] | order(order asc)[0...15] {
      title,
      "slug": slug.current,
      description,
      estimatedDuration
    }`),
  ]);

  return { lessons, guides, roadmaps };
}

interface SanityQuest {
  questNumber?: number;
  title: string;
  goal?: string;
}
interface SanityLesson {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  isPremium?: boolean;
  quests?: SanityQuest[];
}
interface SanityGuide {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  isPremium?: boolean;
}
interface SanityRoadmap {
  title: string;
  slug: string;
  description?: string;
  estimatedDuration?: string;
}

/** 文字列を最大 N 文字に切り詰め */
const truncate = (s: string | undefined, max: number): string =>
  s && s.length > max ? s.slice(0, max) + "…" : s || "";

function buildContextText(
  lessons: SanityLesson[],
  guides: SanityGuide[],
  roadmaps: SanityRoadmap[]
): string {
  const lines: string[] = [];

  lines.push("## ロードマップ（学習パス）");
  for (const r of roadmaps) {
    lines.push(
      `- [${r.title}](/roadmaps/${r.slug}): ${truncate(r.description, 80)}${
        r.estimatedDuration ? ` (目安: ${r.estimatedDuration})` : ""
      }`
    );
  }

  lines.push("\n## レッスン（コース）");
  for (const l of lessons) {
    const premium = l.isPremium ? " [有料]" : "";
    lines.push(`### [${l.title}](/lessons/${l.slug})${premium}`);
    if (l.description) lines.push(`概要: ${truncate(l.description, 120)}`);
    if (l.category) lines.push(`カテゴリ: ${l.category}`);

    // Quest はタイトルのみ簡潔に列挙（article 展開は payload 削減のためスキップ）
    if (l.quests?.length) {
      const questLine = l.quests
        .map((q) => `Q${q.questNumber || ""}:${q.title}`)
        .join(" / ");
      lines.push(`  Quests: ${questLine}`);
    }
    lines.push("");
  }

  lines.push("\n## ガイド（読み物）");
  const categoryLabel: Record<string, string> = {
    career: "キャリア",
    learning: "学習方法",
    industry: "業界動向",
    tools: "ツール・技術",
  };
  for (const g of guides) {
    const premium = g.isPremium ? " [有料]" : "";
    const cat = g.category ? ` [${categoryLabel[g.category] ?? g.category}]` : "";
    lines.push(
      `- [${g.title}](/guide/${g.slug})${premium}${cat}: ${truncate(g.description, 80)}`
    );
  }

  return lines.join("\n");
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

interface IncomingChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ============================================================
// POST ハンドラ
// ============================================================

export async function POST(req: NextRequest) {
  let messages: IncomingChatMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { lessons, guides, roadmaps } = await fetchContext();
    const contextText = buildContextText(
      lessons as SanityLesson[],
      guides as SanityGuide[],
      roadmaps as SanityRoadmap[]
    );

    const systemWithContext = `${SYSTEM_PROMPT}\n\n## BONOで学べるコンテンツ一覧\n${contextText}`;

    const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemWithContext },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      stream: true,
      max_tokens: 1024,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("[ai-chat stream]", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("[ai-chat] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
