
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import TrainingLayout from '@/components/training/TrainingLayout';
import TaskNavigation from './TaskNavigation';
import TaskVideo from '@/components/training/TaskVideo';
import { loadTaskContent, loadTrainingTasks } from '@/lib/markdown-loader';
import { MarkdownFile, TaskFrontmatter } from '@/types/training';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import TaskDetailError from './TaskDetailError';

const TaskDetailPage = () => {
  const { trainingSlug, taskSlug } = useParams<{ trainingSlug: string; taskSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSubscribed, planMembers } = useSubscriptionContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<MarkdownFile | null>(null);
  const [trainingTasks, setTrainingTasks] = useState<MarkdownFile[]>([]);

  const hasPremiumAccess = isSubscribed && planMembers;

  // デバッグ: URL パラメータの詳細ログ
  console.log('=== TaskDetailPage Debug Start ===');
  console.log('URL params raw:', { trainingSlug, taskSlug });
  console.log('URL params type check:', { 
    trainingSlugType: typeof trainingSlug, 
    taskSlugType: typeof taskSlug,
    trainingSlugExists: !!trainingSlug,
    taskSlugExists: !!taskSlug
  });
  console.log('Current location:', window.location.pathname);

  // パラメータが存在しない場合のエラーハンドリング
  if (!trainingSlug || !taskSlug) {
    console.error('=== PARAMETER ERROR ===');
    console.error('Missing parameters:', { trainingSlug, taskSlug });
    console.error('Expected format: /training/{trainingSlug}/{taskSlug}');
    console.error('Current path:', window.location.pathname);
    
    return (
      <TrainingLayout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">エラー</h1>
            <p className="mt-2">トレーニングまたはタスクが指定されていません</p>
            <div className="mt-4 text-sm text-gray-600">
              <p>Debug info:</p>
              <p>trainingSlug: {trainingSlug || 'undefined'}</p>
              <p>taskSlug: {taskSlug || 'undefined'}</p>
              <p>Path: {window.location.pathname}</p>
            </div>
            <button 
              onClick={() => navigate('/training')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              トレーニング一覧に戻る
            </button>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  // タスクデータを取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('=== Data Fetching Start ===');
        console.log('Fetching data for:', { trainingSlug, taskSlug });

        // タスクコンテンツを取得
        console.log('Calling loadTaskContent...');
        const taskData = loadTaskContent(trainingSlug, taskSlug);
        console.log('loadTaskContent result:', taskData);
        
        if (!taskData) {
          console.error('=== TASK NOT FOUND ===');
          console.error(`Task not found: ${trainingSlug}/${taskSlug}`);
          throw new Error(`タスク「${taskSlug}」が見つかりませんでした`);
        }
        
        setTask(taskData);
        console.log('Task data set successfully:', taskData.frontmatter);

        // フォールバック用にトレーニングのタスク一覧も取得
        console.log('Calling loadTrainingTasks...');
        const allTasks = loadTrainingTasks(trainingSlug);
        console.log('loadTrainingTasks result count:', allTasks.length);
        console.log('Available task slugs:', allTasks.map(t => t.slug));
        
        setTrainingTasks(allTasks);

        console.log('=== Data Fetching Success ===');

      } catch (err) {
        console.error('=== Data Fetching Error ===');
        console.error('Error details:', err);
        const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
        setError(errorMessage);
        toast({
          title: 'エラーが発生しました',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        console.log('=== Data Fetching End ===');
      }
    };

    fetchData();
  }, [trainingSlug, taskSlug, user, toast]);

  // 前後のタスクを決定（フロントマター優先 + フォールバック）
  const getPrevNextTasks = () => {
    if (!task) return { prevSlug: null, nextSlug: null };
    
    const frontmatter = task.frontmatter as TaskFrontmatter;
    
    // フロントマターに指定があればそれを使用
    let prevSlug = frontmatter.prev_task || null;
    let nextSlug = frontmatter.next_task || null;
    
    // フォールバック: タスクリスト順の自動推論
    if (!prevSlug || !nextSlug) {
      const currentIndex = trainingTasks.findIndex(t => t.slug === taskSlug);
      if (currentIndex >= 0) {
        if (!prevSlug && currentIndex > 0) {
          prevSlug = trainingTasks[currentIndex - 1].slug;
        }
        if (!nextSlug && currentIndex < trainingTasks.length - 1) {
          nextSlug = trainingTasks[currentIndex + 1].slug;
        }
      }
    }
    
    console.log('Navigation slugs:', { prevSlug, nextSlug, currentIndex: trainingTasks.findIndex(t => t.slug === taskSlug) });
    
    return { prevSlug, nextSlug };
  };

  // エラー表示
  if (error) {
    return <TaskDetailError />;
  }

  // ローディング表示
  if (loading) {
    return (
      <TrainingLayout>
        <div className="container py-8">
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-pulse">読み込み中...</div>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  // タスクが見つからない場合
  if (!task) {
    return <TaskDetailError />;
  }

  const frontmatter = task.frontmatter as TaskFrontmatter;
  const { prevSlug, nextSlug } = getPrevNextTasks();

  // 動画URLがある場合のみ動画プレーヤーを表示
  const hasVideo = frontmatter.video_preview || frontmatter.video_full;

  return (
    <TrainingLayout>
      <div className="container max-w-4xl mx-auto py-8">
        {/* 動画プレーヤー */}
        {hasVideo && (
          <div className="mb-8">
            <TaskVideo
              videoUrl={frontmatter.video_full}
              previewVideoUrl={frontmatter.video_preview}
              isPremium={frontmatter.is_premium || false}
              hasPremiumAccess={hasPremiumAccess}
              title={frontmatter.title}
              previewSeconds={frontmatter.preview_sec || 30}
              className="w-full"
            />
          </div>
        )}

        {/* Markdownコンテンツ表示 */}
        <article className="prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {task.content}
          </ReactMarkdown>
        </article>

        {/* ナビゲーション */}
        <TaskNavigation 
          training={{ title: `${trainingSlug} トレーニング` }}
          currentTaskSlug={taskSlug}
          trainingSlug={trainingSlug}
          nextTaskSlug={nextSlug}
          prevTaskSlug={prevSlug}
        />
      </div>
    </TrainingLayout>
  );
};

export default TaskDetailPage;
