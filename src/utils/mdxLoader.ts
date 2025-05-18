
import { supabase } from "@/integrations/supabase/client";

/**
 * MDXファイルのコンテンツ型定義
 */
export interface MdxContent {
  content: string;
  frontmatter: {
    title: string;
    order_index?: number;
    is_premium?: boolean;
    video_full?: string;
    video_preview?: string;
    preview_sec?: number;
    preview_marker?: string;
    [key: string]: any;
  };
  isFreePreview?: boolean;
}

/**
 * トレーニングのメタ情報（タスク一覧付き）の型定義
 */
export interface TrainingMeta {
  title: string;
  description?: string;
  type?: string;
  difficulty?: string;
  tags?: string[];
  slug: string;
  thumbnailImage?: string;
  tasks?: Array<{
    slug: string;
    title: string;
    is_premium: boolean;
    order_index: number;
    video_full?: string;
    video_preview?: string;
    preview_sec?: number;
    content?: string;
    next_task?: string | null;
    prev_task?: string | null;
  }>;
}

/**
 * MDXファイルを読み込む関数
 * @param trainingSlug トレーニングのスラッグ
 * @param taskSlug タスクのスラッグ 
 */
export const loadMdxContent = async (trainingSlug: string, taskSlug: string): Promise<MdxContent> => {
  try {
    // get-mdx-contentエッジ関数を呼び出す
    const { data, error } = await supabase.functions.invoke('get-mdx-content', {
      body: { trainingSlug, taskSlug }
    });
    
    if (error) {
      console.error('エッジ関数呼び出しエラー:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('コンテンツが取得できませんでした');
    }
    
    console.log(`コンテンツ取得成功: ${trainingSlug}/${taskSlug}`, {
      title: data.frontmatter?.title,
      isFreePreview: data.isFreePreview
    });

    return data as MdxContent;
  } catch (error) {
    console.error('MDXコンテンツ読み込みエラー:', error);
    
    // エラー時はフォールバックのダミーデータを返す
    return {
      content: `# ${taskSlug} タスク\n\n${trainingSlug}の基本的な概念を学びます。\n\nエラーが発生したため、デモコンテンツを表示しています。`,
      frontmatter: {
        title: `${taskSlug} タスク`,
        order_index: 1,
        is_premium: taskSlug.includes('premium'),
        video_full: taskSlug.includes('premium') ? "845235300" : "845235294",
        video_preview: "845235294",
        preview_sec: 30
      },
      isFreePreview: false
    };
  }
};

/**
 * トレーニングのメタデータを読み込む関数
 * @param trainingSlug トレーニングのスラッグ
 * @param withTasks タスク一覧も取得するかどうか
 */
export const loadTrainingMeta = async (trainingSlug: string, withTasks = false): Promise<TrainingMeta> => {
  try {
    // get-training-metaエッジ関数を呼び出す
    const { data, error } = await supabase.functions.invoke('get-training-meta', {
      body: { 
        slug: trainingSlug,
        tasks: withTasks ? 'true' : 'false'
      }
    });
    
    if (error) {
      console.error('エッジ関数呼び出しエラー:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('メタデータが取得できませんでした');
    }
    
    return data as TrainingMeta;
  } catch (error) {
    console.error('トレーニングメタデータ読み込みエラー:', error);
    
    // エラー時はフォールバックのダミーデータを返す
    return {
      title: `${trainingSlug} トレーニング`,
      description: `${trainingSlug}の基本的な概念と実践的な使い方を学びます。`,
      type: "skill",
      difficulty: "初級",
      tags: ["React", "JavaScript", "フロントエンド"],
      slug: trainingSlug,
      thumbnailImage: 'https://source.unsplash.com/random/200x100',
      tasks: withTasks ? [
        {
          slug: "introduction",
          title: "はじめに",
          is_premium: false,
          order_index: 1,
          next_task: "advanced",
          prev_task: null
        },
        {
          slug: "advanced",
          title: "応用編",
          is_premium: true,
          order_index: 2,
          next_task: null,
          prev_task: "introduction"
        }
      ] : []
    };
  }
};

/**
 * すべてのトレーニングのメタ情報を取得する
 */
export async function loadAllTrainingMeta(): Promise<TrainingMeta[]> {
  try {
    // get-training-metaエッジ関数を呼び出す
    const { data, error } = await supabase.functions.invoke('get-training-meta', {
      method: 'GET'
    });
    
    if (error) {
      console.error('エッジ関数呼び出しエラー:', error);
      throw error;
    }
    
    if (!data || !Array.isArray(data)) {
      throw new Error('トレーニング一覧が取得できませんでした');
    }
    
    return data as TrainingMeta[];
  } catch (error) {
    console.error('トレーニングメタデータの取得に失敗しました:', error);
    
    // エラー時はフォールバックのダミーデータを返す
    return [
      {
        slug: "react-basics",
        title: "React 基礎",
        description: "Reactの基本的な概念と実践的な使い方を学びます。",
        type: "skill",
        difficulty: "初級",
        tags: ["React", "JavaScript", "フロントエンド"],
        thumbnailImage: 'https://source.unsplash.com/random/200x100'
      }
    ];
  }
}
