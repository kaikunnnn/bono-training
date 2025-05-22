import { supabase } from "@/integrations/supabase/client";
import { getTrainingMetaFromStorage, getMdxContentFromStorage } from "@/services/storage";

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
    // Storageからコンテンツを取得
    const mdxContent = await getMdxContentFromStorage(trainingSlug, taskSlug);
    
    if (!mdxContent) {
      throw new Error('コンテンツが取得できませんでした');
    }
    
    console.log(`コンテンツ取得成功: ${trainingSlug}/${taskSlug}`, {
      title: mdxContent.frontmatter?.title,
      isPremium: mdxContent.frontmatter?.is_premium
    });

    return mdxContent;
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
    // Storageからメタデータを取得
    const metaContent = await getTrainingMetaFromStorage(trainingSlug);
    
    if (!metaContent) {
      throw new Error('メタデータが取得できませんでした');
    }
    
    const meta: TrainingMeta = {
      title: metaContent.frontmatter.title,
      description: metaContent.frontmatter.description || metaContent.content.split('\n')[0],
      type: metaContent.frontmatter.type || "skill",
      difficulty: metaContent.frontmatter.difficulty || "初級",
      tags: metaContent.frontmatter.tags || [],
      slug: trainingSlug,
      thumbnailImage: metaContent.frontmatter.thumbnailImage || 'https://source.unsplash.com/random/200x100'
    };
    
    // タスク一覧も取得する場合
    if (withTasks) {
      // ここでタスク一覧を取得する処理を追加（STEP 3で実装予定）
      meta.tasks = [];
    }
    
    return meta;
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
    // Storageからすべてのトレーニングフォルダを取得
    const { data: folders, error } = await supabase
      .storage
      .from('content')
      .list('content/training', { sortBy: { column: 'name', order: 'asc' } });
    
    if (error) {
      console.error('フォルダ一覧取得エラー:', error);
      throw error;
    }
    
    if (!folders || folders.length === 0) {
      return [];
    }
    
    const trainings: TrainingMeta[] = [];
    
    // 各フォルダのmeta.mdファイルを読み込む
    for (const folder of folders) {
      if (!folder.id.endsWith('/')) continue; // フォルダのみ処理
      
      const slug = folder.name;
      try {
        const meta = await getTrainingMetaFromStorage(slug);
        if (meta) {
          trainings.push({
            slug,
            title: meta.frontmatter.title,
            description: meta.frontmatter.description || meta.content.split('\n')[0],
            type: meta.frontmatter.type || "skill",
            difficulty: meta.frontmatter.difficulty || "初級",
            tags: meta.frontmatter.tags || [],
            thumbnailImage: meta.frontmatter.thumbnailImage || 'https://source.unsplash.com/random/200x100'
          });
        }
      } catch (error) {
        console.warn(`トレーニング ${slug} のメタデータ取得エラー:`, error);
        // エラーが発生しても続行
      }
    }
    
    return trainings;
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