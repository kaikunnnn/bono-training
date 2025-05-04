/**
 * トレーニングデータを取得する
 */
import { Training, TrainingDetailData, Task, TaskDetailData } from '@/types/training';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * トレーニング一覧を取得する
 */
export async function getTrainingList(): Promise<Training[]> {
  try {
    const { data, error } = await supabase
      .from('training')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('トレーニングデータ取得エラー:', error);
      throw error;
    }
    
    // データを型に合わせて変換
    return data.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description || '',
      type: (item.type as 'challenge' | 'skill') || 'challenge', // 型を明示的に変換
      difficulty: item.difficulty || '',
      tags: item.tags || [],
      backgroundImage: 'https://source.unsplash.com/random/800x400', // 固定値を設定
      thumbnailImage: 'https://source.unsplash.com/random/200x100', // 固定値を設定
      isFree: !item.tags?.includes('premium')
    }));
  } catch (error) {
    console.error('トレーニングデータ取得エラー:', error);
    // エラー時はダミーデータを返す（本番環境では適切なエラーハンドリングが必要）
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
}

/**
 * トレーニング詳細データを取得する
 */
export async function getTrainingDetail(slug: string): Promise<TrainingDetailData> {
  try {
    // トレーニング情報を取得
    const { data: trainingData, error: trainingError } = await supabase
      .from('training')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (trainingError) {
      console.error('トレーニング詳細データ取得エラー:', trainingError);
      throw trainingError;
    }
    
    // トレーニングに属するタスク一覧を取得
    const { data: tasksData, error: tasksError } = await supabase
      .from('task')
      .select('*')
      .eq('training_id', trainingData.id)
      .order('order_index', { ascending: true });
    
    if (tasksError) {
      console.error('タスクデータ取得エラー:', tasksError);
      throw tasksError;
    }
    
    // プレミアムコンテンツの有無を確認
    const hasPremiumContent = tasksData.some(task => task.is_premium);
    
    return {
      ...trainingData,
      tasks: tasksData,
      skills: trainingData.tags || [],
      prerequisites: ['HTML', 'CSS', 'JavaScript'], // 仮のデータ
      has_premium_content: hasPremiumContent
    };
  } catch (error) {
    console.error('トレーニング詳細データ取得エラー:', error);
    // エラー時はモックデータを返す（本番環境では適切なエラーハンドリングが必要）
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
}

/**
 * タスクの進捗状況を更新する
 */
export async function updateTaskProgress(userId: string, taskId: string, status: string) {
  try {
    // 現在の日時を取得（完了の場合のみ使用）
    const completed_at = status === 'done' ? new Date().toISOString() : null;
    
    // user_progressテーブルを更新
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        task_id: taskId,
        status,
        completed_at
      }, {
        onConflict: 'user_id,task_id'
      });
    
    if (error) {
      console.error('タスク進捗状況の更新に失敗しました:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('タスク進捗状況の更新に失敗しました:', error);
    return { data: null, error };
  }
}

/**
 * トレーニングタスクの詳細情報を取得する
 */
export async function getTrainingTaskDetail(
  trainingSlug: string,
  taskSlug: string
): Promise<TaskDetailData> {
  try {
    // まずトレーニング情報を取得
    const { data: trainingData, error: trainingError } = await supabase
      .from('training')
      .select('*')
      .eq('slug', trainingSlug)
      .single();
    
    if (trainingError) {
      console.error('トレーニングデータ取得エラー:', trainingError);
      throw trainingError;
    }
    
    // トレーニングIDを使ってタスクを取得
    const { data: taskData, error: taskError } = await supabase
      .from('task')
      .select('*')
      .eq('training_id', trainingData.id)
      .eq('slug', taskSlug)
      .single();
    
    if (taskError) {
      console.error('タスクデータ取得エラー:', taskError);
      throw taskError;
    }
    
    // 次のタスクを取得
    const { data: nextTaskData } = await supabase
      .from('task')
      .select('slug')
      .eq('training_id', trainingData.id)
      .gt('order_index', taskData.order_index)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();
    
    // content/trainingからMDXコンテンツを取得する予定（現段階ではモックコンテンツを使用）
    const content = `
# ${taskData.title}

これはサンプルコンテンツです。実際の内容はSupabaseから取得する予定です。

## 主要なポイント

- ポイント1: Reactコンポーネントの基本構造
- ポイント2: プロップスの受け渡し方法
- ポイント3: ステート管理の基本

詳細な説明はここに記載されます。

\`\`\`javascript
// サンプルコード
function ExampleComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        増やす
      </button>
    </div>
  );
}
\`\`\`
`;
    
    return {
      id: taskData.id,
      title: taskData.title,
      content: content,
      is_premium: taskData.is_premium,
      video_url: taskData.video_full || "https://example.com/videos/full.mp4",
      preview_video_url: taskData.video_preview || "https://example.com/videos/preview.mp4",
      next_task: nextTaskData ? nextTaskData.slug : null,
      // TaskDetailData型をTaskとの互換性を保つための追加プロパティ
      training_id: taskData.training_id,
      slug: taskData.slug,
      order_index: taskData.order_index,
      preview_sec: taskData.preview_sec,
      video_full: taskData.video_full || "https://example.com/videos/full.mp4", // 必ず文字列を返すようにデフォルト値を設定
      video_preview: taskData.video_preview || "https://example.com/videos/preview.mp4", // 必ず文字列を返すようにデフォルト値を設定
      created_at: taskData.created_at || new Date().toISOString() // 必ず文字列を返すようにする
    };
  } catch (error) {
    console.error("タスク詳細データの取得に失敗しました:", error);
    throw error;
  }
}

/**
 * ユーザーのタスク進捗状況を取得する
 */
export async function getUserTaskProgress(userId: string, trainingId: string) {
  try {
    // トレーニングに属するすべてのタスクIDを取得
    const { data: tasks, error: tasksError } = await supabase
      .from('task')
      .select('id')
      .eq('training_id', trainingId);
    
    if (tasksError) {
      console.error('タスク一覧の取得に失敗しました:', tasksError);
      throw tasksError;
    }
    
    // ユーザーの進捗状況を取得
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .in('task_id', tasks.map(task => task.id));
    
    if (progressError) {
      console.error('進捗状況の取得に失敗しました:', progressError);
      throw progressError;
    }
    
    // タスクIDをキーとした進捗状況のマップを作成
    const progressMap = progress.reduce((acc, item) => {
      acc[item.task_id] = item;
      return acc;
    }, {});
    
    return { data: progress, error: null, progressMap, completedCount: progress.filter(p => p.status === 'done').length };
  } catch (error) {
    console.error('タスク進捗状況の取得に失敗しました:', error);
    return { data: [], error, progressMap: {}, completedCount: 0 };
  }
}
