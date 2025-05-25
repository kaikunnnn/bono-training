
// import { supabase } from "@/integrations/supabase/client";

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
 * TODO: GitHub/ローカルファイルベースの実装に変更予定
 */
export const loadMdxContent = async (trainingSlug: string, taskSlug: string): Promise<MdxContent> => {
  console.log('TODO: GitHub/ローカルファイルベースの実装に変更予定');
  
  // フォールバックのダミーデータを返す
  return {
    content: `# ${taskSlug} タスク\n\n${trainingSlug}の基本的な概念を学びます。\n\n（GitHub移行準備中：サンプルコンテンツを表示しています）`,
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
};

/**
 * トレーニングのメタデータを読み込む関数
 * TODO: GitHub/ローカルファイルベースの実装に変更予定
 */
export const loadTrainingMeta = async (trainingSlug: string, withTasks = false): Promise<TrainingMeta> => {
  console.log('TODO: GitHub/ローカルファイルベースの実装に変更予定');
  
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
};

/**
 * すべてのトレーニングのメタ情報を取得する
 * TODO: GitHub/ローカルファイルベースの実装に変更予定
 */
export async function loadAllTrainingMeta(): Promise<TrainingMeta[]> {
  console.log('TODO: GitHub/ローカルファイルベースの実装に変更予定');
  
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
