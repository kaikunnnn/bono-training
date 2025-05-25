
import { supabase } from "@/integrations/supabase/client";
import { loadTrainingMeta, loadMdxContent, loadAllTrainingMeta } from "@/utils/mdxLoader";
import { loadTrainingTasks } from "@/lib/markdown-loader";
import { TrainingDetailData, TaskDetailData } from "@/types/training";
import { TaskFrontmatter } from "@/types/training";

/**
 * トレーニング一覧を取得
 * Phase-1: GitHub/ローカルファイルベースの実装
 */
export const getTrainings = async () => {
  console.log('Phase-1: GitHub/ローカルファイルベースの実装を使用');
  
  try {
    // ローカルファイルからトレーニング一覧を取得
    const trainingMetas = await loadAllTrainingMeta();
    
    return trainingMetas.map(meta => ({
      id: `${meta.slug}-1`,
      slug: meta.slug,
      title: meta.title,
      description: meta.description || '',
      type: meta.type || 'challenge',
      difficulty: meta.difficulty || 'normal',
      tags: meta.tags || [],
      thumbnailImage: meta.thumbnailImage || 'https://source.unsplash.com/random/200x100'
    }));
  } catch (error) {
    console.error('Error loading trainings:', error);
    
    // フォールバックのダミーデータを返す
    return [
      {
        id: "todo-app-1",
        slug: "todo-app",
        title: "Todo アプリ UI 制作",
        description: "実践的な Todo アプリの UI デザインを学ぶ",
        type: "challenge",
        difficulty: "normal",
        tags: ["ui", "todo", "実践"],
        thumbnailImage: 'https://source.unsplash.com/random/200x100'
      },
      {
        id: "react-basics-1", 
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
};

/**
 * トレーニング詳細情報を取得
 * Phase-1: GitHub/ローカルファイルベースの実装
 */
export const getTrainingDetail = async (slug: string): Promise<TrainingDetailData> => {
  console.log('Phase-1: GitHub/ローカルファイルベースの実装を使用');
  
  try {
    // ローカルファイルからトレーニング詳細を取得
    const trainingMeta = await loadTrainingMeta(slug, true);
    const taskFiles = await loadTrainingTasks(slug);
    
    const tasks = taskFiles.map((taskFile, index) => {
      const taskFrontmatter = taskFile.frontmatter as TaskFrontmatter;
      return {
        id: `${slug}-task-${index + 1}`,
        slug: taskFile.slug,
        title: taskFrontmatter.title,
        is_premium: taskFrontmatter.is_premium || false,
        order_index: taskFrontmatter.order_index,
        training_id: `${slug}-1`,
        created_at: null,
        video_full: taskFrontmatter.video_full || null,
        video_preview: taskFrontmatter.video_preview || null,
        preview_sec: taskFrontmatter.preview_sec || 30,
        next_task: index < taskFiles.length - 1 ? taskFiles[index + 1].slug : null,
        prev_task: index > 0 ? taskFiles[index - 1].slug : null
      };
    });
    
    const trainingDetailData: TrainingDetailData = {
      id: `${slug}-1`,
      slug: slug,
      title: trainingMeta.title,
      description: trainingMeta.description || '',
      type: trainingMeta.type as 'challenge' | 'skill' || 'challenge',
      difficulty: trainingMeta.difficulty || '初級',
      tags: trainingMeta.tags || [],
      tasks: tasks,
      skills: [],
      prerequisites: [],
      has_premium_content: tasks.some(task => task.is_premium),
      thumbnailImage: trainingMeta.thumbnailImage || 'https://source.unsplash.com/random/200x100'
    };

    return trainingDetailData;
  } catch (error) {
    console.error(`Error loading training detail for ${slug}:`, error);
    
    // フォールバックのダミーデータを返す
    const trainingDetailData: TrainingDetailData = {
      id: `${slug}-1`,
      slug: slug,
      title: `${slug} トレーニング`,
      description: `${slug}の基本的な概念と実践的な使い方を学びます。`,
      type: "skill",
      difficulty: "初級",
      tags: ["React", "JavaScript", "フロントエンド"],
      tasks: [
        {
          id: `${slug}-task-1`,
          slug: "introduction",
          title: "はじめに",
          is_premium: false,
          order_index: 1,
          training_id: `${slug}-1`,
          created_at: null,
          video_full: "845235294",
          video_preview: "845235294",
          preview_sec: 30,
          next_task: "advanced",
          prev_task: null
        },
        {
          id: `${slug}-task-2`,
          slug: "advanced", 
          title: "応用編",
          is_premium: true,
          order_index: 2,
          training_id: `${slug}-1`,
          created_at: null,
          video_full: "845235300",
          video_preview: "845235294", 
          preview_sec: 30,
          next_task: null,
          prev_task: "introduction"
        }
      ],
      skills: [],
      prerequisites: [],
      has_premium_content: true,
      thumbnailImage: 'https://source.unsplash.com/random/200x100'
    };

    return trainingDetailData;
  }
};

/**
 * トレーニングのタスク一覧を取得
 * Phase-1: GitHub/ローカルファイルベースの実装
 */
export const getTrainingTasks = async (trainingId: string) => {
  console.log('Phase-1: GitHub/ローカルファイルベースの実装を使用');
  
  try {
    // trainingIdからslugを抽出（format: "todo-app-1" -> "todo-app"）
    const slug = trainingId.replace(/-\d+$/, '');
    const taskFiles = await loadTrainingTasks(slug);
    
    return taskFiles.map((taskFile, index) => {
      const taskFrontmatter = taskFile.frontmatter as TaskFrontmatter;
      return {
        id: `${trainingId}-task-${index + 1}`,
        slug: taskFile.slug,
        title: taskFrontmatter.title,
        is_premium: taskFrontmatter.is_premium || false,
        order_index: taskFrontmatter.order_index,
        training_id: trainingId
      };
    });
  } catch (error) {
    console.error(`Error loading tasks for training ${trainingId}:`, error);
    
    // フォールバックのダミーデータを返す
    return [
      {
        id: `${trainingId}-task-1`,
        slug: "introduction",
        title: "はじめに",
        is_premium: false,
        order_index: 1,
        training_id: trainingId
      },
      {
        id: `${trainingId}-task-2`,
        slug: "advanced",
        title: "応用編", 
        is_premium: true,
        order_index: 2,
        training_id: trainingId
      }
    ];
  }
};

/**
 * タスク詳細を取得
 * Phase-1: GitHub/ローカルファイルベースの実装
 */
export const getTrainingTaskDetail = async (trainingSlug: string, taskSlug: string): Promise<TaskDetailData> => {
  console.log('Phase-1: GitHub/ローカルファイルベースの実装を使用');
  
  try {
    // MDXコンテンツを取得
    const mdxData = await loadMdxContent(trainingSlug, taskSlug);
    
    const taskDetailData: TaskDetailData = {
      id: `${trainingSlug}-${taskSlug}`,
      slug: taskSlug,
      title: mdxData.frontmatter.title,
      content: mdxData.content,
      is_premium: mdxData.frontmatter.is_premium || false,
      order_index: mdxData.frontmatter.order_index || 1,
      training_id: `${trainingSlug}-1`,
      created_at: null,
      video_full: mdxData.frontmatter.video_full || null,
      video_preview: mdxData.frontmatter.video_preview || null,
      preview_sec: mdxData.frontmatter.preview_sec || 30,
      trainingTitle: `${trainingSlug} トレーニング`,
      trainingSlug: trainingSlug,
      next_task: taskSlug === "introduction" ? "advanced" : null,
      prev_task: taskSlug === "advanced" ? "introduction" : null
    };
    
    return taskDetailData;
  } catch (error) {
    console.error('タスク詳細取得エラー:', error);
    throw error;
  }
};

/**
 * ユーザーの進捗状況を取得
 */
export const getUserTaskProgress = async (userId: string, trainingId: string) => {
  try {
    // Supabase DBからユーザーの進捗状況を取得
    const { data, error } = await supabase
      .from('user_progress')
      .select('task_id, status, completed_at')
      .eq('user_id', userId);

    if (error) throw error;
    
    // タスクIDごとの進捗状況をマッピング
    const progressMap: Record<string, any> = {};
    data?.forEach(item => {
      progressMap[item.task_id] = {
        status: item.status,
        completed_at: item.completed_at
      };
    });
    
    return { progressMap, userId, trainingId };
  } catch (error) {
    console.error('進捗状況取得エラー:', error);
    return { error: (error as Error).message, userId, trainingId };
  }
};

/**
 * ユーザーの進捗状況を更新
 */
export const updateTaskProgress = async (userId: string, taskId: string, status: 'done' | 'todo' | 'in-progress') => {
  try {
    const completed_at = status === 'done' ? new Date().toISOString() : null;
    
    // upsert操作で進捗状況を更新/挿入
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        task_id: taskId,
        status,
        completed_at
      }, { onConflict: 'user_id,task_id' });

    if (error) throw error;
    return { success: true, status };
  } catch (error) {
    console.error('進捗状況更新エラー:', error);
    return { error: (error as Error).message, success: false };
  }
};
