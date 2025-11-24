import { useQuery } from '@tanstack/react-query';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Article {
  _id: string;
  _type: 'article';
  title: string;
  slug: string;
  videoUrl?: string;
  videoDuration?: string;
  isPremium: boolean;  // 🆕 プレミアムフラグ（true=有料、false=無料）
  content?: string;
  source: 'webflow';
  webflowId: string;
}

interface Quest {
  _id: string;
  _type: 'quest';
  questNumber: number;
  title: string;
  articles: Article[];
  source: 'webflow';
}

interface Lesson {
  _id: string;
  _type: 'lesson';
  title: string;
  slug: string;
  quests: Quest[];
  source: 'webflow';
  webflowId: string;
}

interface WebflowSeriesResponse {
  lesson: Lesson;
  success: boolean;
  cached?: boolean;
  timestamp: string;
}

/**
 * Fetch Webflow Series data from Edge Function
 */
async function fetchWebflowSeries(seriesIdOrSlug: string): Promise<WebflowSeriesResponse> {
  const url = `${SUPABASE_URL}/functions/v1/webflow-series`;

  const response = await fetch(url, {
    method: 'POST',  // 🔄 POSTメソッドに変更
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ seriesId: seriesIdOrSlug }),  // 🔄 ボディでseriesIdを送信
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

/**
 * Hook to fetch Webflow Series data
 */
export function useWebflowSeries(seriesIdOrSlug: string) {
  return useQuery({
    queryKey: ['webflow-series', seriesIdOrSlug],
    queryFn: () => fetchWebflowSeries(seriesIdOrSlug),
    enabled: !!seriesIdOrSlug && seriesIdOrSlug.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
