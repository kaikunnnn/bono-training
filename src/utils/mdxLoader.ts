
import { loadAllTrainingMeta, loadTrainingTasks, loadTaskContent } from '@/lib/markdown-loader';
import { TrainingFrontmatter, TaskFrontmatter } from '@/types/training';

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
 * Phase-1: GitHub/ローカルファイルベースの実装
 */
export const loadMdxContent = async (trainingSlug: string, taskSlug: string): Promise<MdxContent> => {
  console.log(`Loading MDX content for ${trainingSlug}/${taskSlug}`);
  
  try {
    const taskFile = await loadTaskContent(trainingSlug, taskSlug);
    
    if (!taskFile) {
      throw new Error(`Task content not found for ${trainingSlug}/${taskSlug}`);
    }
    
    const frontmatter = taskFile.frontmatter as TaskFrontmatter;
    
    return {
      content: taskFile.content,
      frontmatter: {
        title: frontmatter.title,
        order_index: frontmatter.order_index,
        is_premium: frontmatter.is_premium || false,
        video_full: frontmatter.video_full,
        video_preview: frontmatter.video_preview,
        preview_sec: frontmatter.preview_sec || 30,
        preview_marker: frontmatter.preview_marker
      },
      isFreePreview: false
    };
  } catch (error) {
    console.error(`Error loading MDX content for ${trainingSlug}/${taskSlug}:`, error);
    
    // フォールバックのダミーデータを返す
    return {
      content: `# ${taskSlug} タスク\n\n${trainingSlug}の基本的な概念を学びます。\n\n（コンテンツの読み込みでエラーが発生しました）`,
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
 * Phase-1: GitHub/ローカルファイルベースの実装
 */
export const loadTrainingMeta = async (trainingSlug: string, withTasks = false): Promise<TrainingMeta> => {
  console.log(`Loading training meta for ${trainingSlug}, withTasks: ${withTasks}`);
  
  try {
    const trainingFiles = await loadAllTrainingMeta();
    const trainingFile = trainingFiles.find(file => file.slug === trainingSlug);
    
    if (!trainingFile) {
      throw new Error(`Training not found: ${trainingSlug}`);
    }
    
    const frontmatter = trainingFile.frontmatter as TrainingFrontmatter;
    
    let tasks: TrainingMeta['tasks'] = [];
    
    if (withTasks) {
      const taskFiles = await loadTrainingTasks(trainingSlug);
      tasks = taskFiles.map((taskFile, index) => {
        const taskFrontmatter = taskFile.frontmatter as TaskFrontmatter;
        return {
          slug: taskFile.slug,
          title: taskFrontmatter.title,
          is_premium: taskFrontmatter.is_premium || false,
          order_index: taskFrontmatter.order_index,
          video_full: taskFrontmatter.video_full,
          video_preview: taskFrontmatter.video_preview,
          preview_sec: taskFrontmatter.preview_sec || 30,
          content: taskFile.content,
          next_task: index < taskFiles.length - 1 ? taskFiles[index + 1].slug : null,
          prev_task: index > 0 ? taskFiles[index - 1].slug : null
        };
      });
    }
    
    return {
      title: frontmatter.title,
      description: frontmatter.description,
      type: frontmatter.type,
      difficulty: frontmatter.difficulty,
      tags: frontmatter.tags || [],
      slug: trainingSlug,
      thumbnailImage: 'https://source.unsplash.com/random/200x100',
      tasks
    };
  } catch (error) {
    console.error(`Error loading training meta for ${trainingSlug}:`, error);
    
    // フォールバックのダミーデータを返す
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
 * Phase-1: GitHub/ローカルファイルベースの実装
 */
export async function loadAllTrainingMeta(): Promise<TrainingMeta[]> {
  console.log('Loading all training meta');
  
  try {
    const trainingFiles = await loadAllTrainingMeta();
    
    return trainingFiles.map(file => {
      const frontmatter = file.frontmatter as TrainingFrontmatter;
      return {
        slug: file.slug,
        title: frontmatter.title,
        description: frontmatter.description,
        type: frontmatter.type,
        difficulty: frontmatter.difficulty,
        tags: frontmatter.tags || [],
        thumbnailImage: 'https://source.unsplash.com/random/200x100'
      };
    });
  } catch (error) {
    console.error('Error loading all training meta:', error);
    
    // フォールバックのダミーデータを返す
    return [
      {
        slug: "todo-app",
        title: "Todo アプリ UI 制作",
        description: "実践的な Todo アプリの UI デザインを学ぶ",
        type: "challenge",
        difficulty: "normal",
        tags: ["ui", "todo", "実践"],
        thumbnailImage: 'https://source.unsplash.com/random/200x100'
      },
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
