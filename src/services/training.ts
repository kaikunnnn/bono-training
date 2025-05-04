/**
 * トレーニングデータを取得する
 */
export async function getTrainingList() {
  // TODO: Supabaseからデータを取得する
  return [
    {
      id: '1',
      slug: 'react-basic',
      title: 'Reactの基礎',
      description: 'Reactの基礎を学ぶ',
      type: 'skill',
      difficulty: '初級',
      tags: ['React', 'JavaScript'],
      backgroundImage: 'https://source.unsplash.com/random/800x400',
      thumbnailImage: 'https://source.unsplash.com/random/200x100',
      isFree: true,
    },
    {
      id: '2',
      slug: 'nextjs-basic',
      title: 'Next.jsの基礎',
      description: 'Next.jsの基礎を学ぶ',
      type: 'skill',
      difficulty: '初級',
      tags: ['Next.js', 'React', 'JavaScript'],
      backgroundImage: 'https://source.unsplash.com/random/800x400',
      thumbnailImage: 'https://source.unsplash.com/random/200x100',
      isFree: false,
    },
    {
      id: '3',
      slug: 'typescript-basic',
      title: 'TypeScriptの基礎',
      description: 'TypeScriptの基礎を学ぶ',
      type: 'skill',
      difficulty: '初級',
      tags: ['TypeScript', 'JavaScript'],
      backgroundImage: 'https://source.unsplash.com/random/800x400',
      thumbnailImage: 'https://source.unsplash.com/random/200x100',
      isFree: false,
    },
  ];
}

/**
 * トレーニング詳細データを取得する
 */
export async function getTrainingDetail(slug: string) {
  // TODO: Supabaseからデータを取得する
  return {
    id: '1',
    slug: 'react-basic',
    title: 'Reactの基礎',
    description: 'Reactの基礎を学ぶ',
    type: 'skill',
    difficulty: '初級',
    tags: ['React', 'JavaScript'],
    tasks: [
      {
        id: '1',
        training_id: '1',
        slug: 'react-basic-1',
        title: 'Reactの基礎1',
        order_index: 1,
        is_premium: false,
        preview_sec: 30,
      },
      {
        id: '2',
        training_id: '1',
        slug: 'react-basic-2',
        title: 'Reactの基礎2',
        order_index: 2,
        is_premium: true,
        preview_sec: 30,
      },
      {
        id: '3',
        training_id: '1',
        slug: 'react-basic-3',
        title: 'Reactの基礎3',
        order_index: 3,
        is_premium: true,
        preview_sec: 30,
      },
    ],
    skills: ['React', 'JavaScript', 'JSX'],
    prerequisites: ['HTML', 'CSS', 'JavaScript'],
    has_premium_content: true,
  };
}

/**
 * タスクの進捗状況を更新する
 */
export async function updateTaskProgress(userId: string, taskId: string, status: string) {
  // TODO: Supabaseにデータを保存する
  console.log(`userId: ${userId}, taskId: ${taskId}, status: ${status}`);
  return { data: { userId, taskId, status }, error: null };
}

/**
 * トレーニングタスクの詳細情報を取得する
 */
export async function getTrainingTaskDetail(
  trainingSlug: string,
  taskSlug: string
): Promise<TaskDetailData> {
  try {
    // 本来はAPIからデータを取得するが、現段階ではモックデータを返す
    // TODO: Supabase APIからデータを取得する実装に置き換える
    return {
      id: `task-${taskSlug}`,
      title: `${taskSlug}のタイトル`,
      content: `
# ${taskSlug}のコンテンツ

これはサンプルコンテンツです。実際のコンテンツはAPIから取得します。

## 主要なポイント

- ポイント1
- ポイント2
- ポイント3

詳細な説明はここに記載されます。`,
      is_premium: taskSlug.includes('premium'),
      video_url: "https://example.com/videos/full.mp4",
      preview_video_url: "https://example.com/videos/preview.mp4",
      next_task: null
    };
  } catch (error) {
    console.error("タスク詳細データの取得に失敗しました:", error);
    throw error;
  }
}
