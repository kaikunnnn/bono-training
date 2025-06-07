
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import TrainingLayout from '@/components/training/TrainingLayout';
import TaskNavigation from './TaskNavigation';
import TaskVideo from '@/components/training/TaskVideo';
import LessonHeader from '@/components/training/LessonHeader';
import MdxPreview from '@/components/training/MdxPreview';
import { loadTaskContent, loadTrainingTasks } from '@/lib/markdown-loader';
import { MarkdownFile, TaskFrontmatter } from '@/types/training';
import TaskDetailError from './TaskDetailError';

const TaskDetailPage = () => {
  const { trainingSlug, taskSlug } = useParams<{ trainingSlug: string; taskSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSubscribed, hasMemberAccess } = useSubscriptionContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<MarkdownFile | null>(null);
  const [trainingTasks, setTrainingTasks] = useState<MarkdownFile[]>([]);

  const hasPremiumAccess = isSubscribed && hasMemberAccess;

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
  console.log('Premium access:', { isSubscribed, hasMemberAccess, hasPremiumAccess });

  // パラメータが存在しない場合のエラーハンドリング - 改善版
  if (!trainingSlug || !taskSlug) {
    console.error('=== PARAMETER ERROR ===');
    console.error('Missing parameters:', { trainingSlug, taskSlug });
    console.error('Expected format: /training/{trainingSlug}/{taskSlug}');
    console.error('Current path:', window.location.pathname);
    
    return (
      <TrainingLayout>
        <div className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-red-600 mb-2">URL エラー</h1>
              <p className="text-lg text-gray-700 mb-4">トレーニングまたはタスクが正しく指定されていません</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Debug info:</strong>
              </div>
              <div className="font-mono text-xs space-y-1">
                <div>trainingSlug: {trainingSlug || 'undefined'}</div>
                <div>taskSlug: {taskSlug || 'undefined'}</div>
                <div>Path: {window.location.pathname}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/training')}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                トレーニング一覧に戻る
              </button>
              <button 
                onClick={() => navigate('/training/debug')}
                className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                デバッグページで確認
              </button>
            </div>
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
          
          // より詳細なエラー情報を提供
          const allTasks = loadTrainingTasks(trainingSlug);
          console.error('Available tasks in this training:', allTasks.map(t => t.slug));
          
          if (allTasks.length === 0) {
            throw new Error(`トレーニング「${trainingSlug}」が見つかりませんでした`);
          } else {
            throw new Error(`タスク「${taskSlug}」が見つかりませんでした。利用可能なタスク: ${allTasks.map(t => t.slug).join(', ')}`);
          }
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
        
        // より親切なエラートースト
        toast({
          title: 'コンテンツ読み込みエラー',
          description: errorMessage,
          variant: 'destructive',
          duration: 5000,
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

  // エラー表示 - 改善版
  if (error) {
    return (
      <TrainingLayout>
        <div className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-red-600 mb-2">コンテンツエラー</h1>
              <p className="text-lg text-gray-700 mb-4">{error}</p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-red-700">
                <strong>要求されたコンテンツ:</strong> {trainingSlug}/{taskSlug}
              </div>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate(`/training/${trainingSlug}`)}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {trainingSlug} トレーニングに戻る
              </button>
              <button 
                onClick={() => navigate('/training')}
                className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                トレーニング一覧に戻る
              </button>
              <button 
                onClick={() => navigate('/training/debug')}
                className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                デバッグページで詳細確認
              </button>
            </div>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  // ローディング表示 - 改善版
  if (loading) {
    return (
      <TrainingLayout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <div className="text-lg font-medium text-gray-700">コンテンツを読み込み中...</div>
                <div className="text-sm text-gray-500 mt-2">{trainingSlug}/{taskSlug}</div>
              </div>
            </div>
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
  const hasValidVideo = (frontmatter.video_preview && frontmatter.video_preview.trim()) || 
                        (frontmatter.video_full && frontmatter.video_full.trim());

  // Step 3 統合テスト用のデバッグ情報
  console.log('=== Step 3 Integration Test Info ===');
  console.log('Content splitting test:', {
    isPremium: frontmatter.is_premium,
    hasPremiumAccess,
    contentLength: task.content.length,
    hasPremiumMarker: task.content.includes('<!-- PREMIUM_ONLY -->')
  });
  console.log('Video display test:', {
    hasValidVideo,
    videoPreview: frontmatter.video_preview,
    videoFull: frontmatter.video_full,
    shouldShowPreview: !hasPremiumAccess && frontmatter.is_premium
  });

  return (
    <TrainingLayout>
      <div className="container max-w-4xl mx-auto py-8">
        {/* Step 3 テスト用デバッグバナー */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-800 font-medium mb-2">Step 3 統合テストモード</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Premium:</strong> {frontmatter.is_premium ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Access:</strong> {hasPremiumAccess ? 'Full' : 'Limited'}
              </div>
              <div>
                <strong>Video:</strong> {hasValidVideo ? 'Available' : 'None'}
              </div>
              <div>
                <strong>Marker:</strong> {task.content.includes('<!-- PREMIUM_ONLY -->') ? 'Found' : 'None'}
              </div>
            </div>
          </div>
        )}

        {/* LessonHeader - builder.ioデザインを再現 */}
        <div className="mb-10">
          <LessonHeader frontmatter={frontmatter} />
        </div>

        {/* 動画プレーヤー */}
        {hasValidVideo && (
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

        {/* Markdownコンテンツ表示（MdxPreviewに変更してコンテンツ分割を有効化） */}
        <MdxPreview 
          content={task.content}
          isPremium={frontmatter.is_premium || false}
          className="mb-8"
        />

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
