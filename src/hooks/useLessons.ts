import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/sanity';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Sanity Lesson型（拡張版）
 */
interface SanityLesson {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  coverImage?: any;
  iconImage?: any;
  iconImageUrl?: string;
  category?: string;
  isPremium: boolean;
  webflowSource?: string; // 🆕 Webflow Series ID
}

/**
 * Webflow Quest型
 */
interface WebflowQuest {
  _id: string;
  _type: 'quest';
  questNumber: number;
  title: string;
  articles: any[];
  source: 'webflow';
}

/**
 * Webflow Lesson型
 */
interface WebflowLesson {
  _id: string;
  _type: 'lesson';
  title: string;
  slug: string;
  description?: string; // 🆕 説明文
  coverImage?: string; // 🆕 カバー画像URL
  iconImage?: string; // 🆕 アイコン画像URL
  category?: string; // 🆕 カテゴリ
  overview?: string; // 🆕 詳細説明（HTML）
  quests: WebflowQuest[];
  source: 'webflow';
  webflowId: string;
}

/**
 * 統合されたLesson型
 */
export interface IntegratedLesson extends SanityLesson {
  webflowData?: WebflowLesson; // Webflowからのデータ
  coverImageUrl?: string; // カバーURL（文字列）
  iconImage?: any; // Sanityアイコン画像
  iconImageUrl?: string; // アイコン画像URL（文字列）
}

/**
 * Webflow Series データを取得
 */
async function fetchWebflowSeries(seriesId: string): Promise<WebflowLesson | null> {
  try {
    const url = `${SUPABASE_URL}/functions/v1/webflow-series`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seriesId }),
    });

    if (!response.ok) {
      console.error(`[useLessons] Webflow fetch failed for ${seriesId}:`, response.status);
      return null;
    }

    const data = await response.json();
    return data.lesson;
  } catch (error) {
    console.error(`[useLessons] Error fetching Webflow series ${seriesId}:`, error);
    return null;
  }
}

/**
 * Sanity + Webflow 統合データ取得
 */
async function fetchIntegratedLessons(): Promise<IntegratedLesson[]> {
  // 1. Sanityからレッスン一覧を取得
  const query = `*[_type == "lesson"] {
    _id,
    title,
    slug,
    description,
    coverImage,
    iconImage,
    iconImageUrl,
    category,
    isPremium,
    webflowSource
  }`;

  const sanityLessons: SanityLesson[] = await client.fetch(query);

  // 2. Webflowソースがあるレッスンを並列でフェッチ
  const lessonsWithWebflow = await Promise.all(
    sanityLessons.map(async (lesson) => {
      if (!lesson.webflowSource) {
        // Webflowソースがない場合はSanityデータをそのまま返す
        return lesson;
      }

      // Webflowからデータ取得
      const webflowData = await fetchWebflowSeries(lesson.webflowSource);

      if (!webflowData) {
        // Webflowデータ取得失敗時はSanityデータを使用
        console.warn(`[useLessons] Failed to fetch Webflow data for ${lesson._id}, using Sanity data`);
        return lesson;
      }

      // Webflowデータで上書き（Webflowのデータを優先、なければSanityのデータ）
      return {
        ...lesson,
        title: webflowData.title, // 🔄 Webflowのタイトルで上書き
        slug: { current: webflowData.slug }, // 🔄 Webflowのスラッグで上書き
        description: webflowData.description || lesson.description || '', // 🔄 Webflowの説明を優先
        coverImage: webflowData.coverImage ? undefined : lesson.coverImage, // SanityのcoverImageはWebflowの場合undefined
        coverImageUrl: webflowData.coverImage, // 🆕 WebflowのカバーURL（文字列）
        iconImageUrl: webflowData.iconImage, // 🆕 WebflowのアイコンURL（文字列）
        category: webflowData.category || lesson.category, // 🔄 Webflowのカテゴリを優先
        webflowData, // Webflowの全データを保持（quests, iconImage, overview含む）
      };
    })
  );

  return lessonsWithWebflow;
}

/**
 * レッスン一覧取得フック（Sanity + Webflow統合）
 */
export function useLessons() {
  return useQuery({
    queryKey: ['lessons-integrated'],
    queryFn: fetchIntegratedLessons,
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 10 * 60 * 1000, // 10分
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
