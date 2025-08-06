
import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import TrainingLayout from '@/components/training/TrainingLayout';
import TaskNavigation from './TaskNavigation';
import TaskVideo from '@/components/training/TaskVideo';
import LessonHeader from '@/components/training/LessonHeader';
import MarkdownRenderer from '@/components/training/MarkdownRenderer';
import ErrorDisplay from '@/components/common/ErrorBoundary';
import { useTaskDetail } from '@/hooks/useTrainingCache';
import { TaskFrontmatter } from '@/types/training';
import { Skeleton } from '@/components/ui/skeleton';
import { parseContentSections, extractSubSections, type ContentSectionData, type StructuredSection } from '@/utils/parseContentSections';
import ContentSection from '@/components/training/ContentSection';
import DesignSolutionSection from '@/components/training/DesignSolutionSection';
import NavigationHeader from '@/components/training/NavigationHeader';

/**
 * 安全にbooleanを変換するヘルパー関数
 */
const safeBooleanConvert = (value: any, defaultValue: boolean = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 1) return true;
  if (value === 0) return false;
  return defaultValue;
};

/**
 * 安全に文字列を変換するヘルパー関数
 */
const safeStringConvert = (value: any): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return undefined;
};

/**
 * 安全に数値を変換するヘルパー関数
 */
const safeNumberConvert = (value: any): number | undefined => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return undefined;
};

/**
 * タスク詳細ページ（React Query対応版）
 */
const TaskDetailPage = () => {
  const { trainingSlug, taskSlug } = useParams<{ trainingSlug: string; taskSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed, hasMemberAccess } = useSubscriptionContext();
  
  const { data: task, isLoading, error } = useTaskDetail(
    trainingSlug || '', 
    taskSlug || ''
  );
  
  if (!trainingSlug || !taskSlug) {
    return <Navigate to="/training" replace />;
  }
  const hasPremiumAccess = isSubscribed && hasMemberAccess;

  // デバッグログを強化
  console.log('TaskDetailPage - アクセス権情報:', { 
    isSubscribed,
    hasMemberAccess,
    hasPremiumAccess,
    taskIsPremium: task?.is_premium,
    trainingSlug,
    taskSlug,
    userAuthenticated: !!user,
    taskDataExists: !!task,
    taskTitle: task?.title,
    taskContentLength: task?.content?.length || 0
  });

  // フェーズ2: 有料コンテンツテスト用ログ追加
  if (task?.is_premium) {
    console.log('TaskDetailPage - 有料コンテンツ検出:', {
      taskTitle: task.title,
      userCanAccess: hasPremiumAccess,
      needsUpgrade: !hasPremiumAccess
    });
  }

  if (isLoading) {
    return (
      <TrainingLayout>
        <div className="container max-w-4xl mx-auto py-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  if (error) {
    // エラータイプの判定
    const isNotFoundError = error.name === 'NotFoundError' || 
                           error.message?.includes('コンテンツが見つかりませんでした') ||
                           error.message?.includes('404');
    
    const isAuthError = error.name === 'AuthError' || 
                       error.message?.includes('ログインが必要');
    
    const isForbiddenError = error.name === 'ForbiddenError' || 
                            error.message?.includes('権限がありません');

    console.log('TaskDetailPage - エラー詳細:', {
      errorName: error.name,
      errorMessage: error.message,
      isNotFoundError,
      isAuthError,
      isForbiddenError
    });

    return (
      <TrainingLayout>
        <div className="container max-w-4xl mx-auto py-8">
          <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative size-full">
            {/* Navigation Section */}
            <NavigationHeader 
              trainingSlug={trainingSlug} 
              orderIndex={1} 
            />

            {/* Error Content */}
            <div className="relative rounded-[66px] shrink-0 w-full">
              <div className="flex flex-col items-center relative size-full">
                <div className="box-border content-stretch flex flex-col gap-8 items-center justify-start pb-24 pt-0 px-24 relative w-full">
                  <div className="box-border content-stretch flex flex-col gap-5 items-center justify-start pb-4 pt-5 px-0 relative shrink-0 w-[741px]">
                    
                    {isNotFoundError ? (
                      // 404エラー専用表示（フォールバック処理の案内付き）
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 text-center w-full">
                        <div className="text-orange-600 text-6xl mb-4">⚠️</div>
                        <div className="text-orange-800 font-bold text-xl mb-2">
                          一時的な読み込み問題
                        </div>
                        <div className="text-orange-600 text-sm mb-4">
                          タスク「{taskSlug}」の読み込みで問題が発生しました。<br/>
                          Edge Functionでの取得に失敗しましたが、ローカルフォールバック処理が実行されています。
                        </div>
                        <div className="text-orange-500 text-xs mb-4 p-3 bg-orange-100 rounded">
                          <strong>開発者向け情報:</strong><br/>
                          • Edge Function: 404エラー<br/>
                          • ローカルファイル: /content/training/{trainingSlug}/tasks/ui-layout-basic01/content.md<br/>
                          • slug マッピング: "{taskSlug}" → "ui-layout-basic01"
                        </div>
                        <button
                          onClick={() => window.location.reload()}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors mr-4"
                        >
                          再読み込み
                        </button>
                        <button
                          onClick={() => navigate(`/training/${trainingSlug}`)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          トレーニング一覧に戻る
                        </button>
                      </div>
                    ) : isAuthError ? (
                      // 認証エラー専用表示
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center w-full">
                        <div className="text-blue-600 text-6xl mb-4">🔐</div>
                        <div className="text-blue-800 font-bold text-xl mb-2">
                          ログインが必要です
                        </div>
                        <div className="text-blue-600 text-sm mb-4">
                          このコンテンツを表示するにはログインしてください。
                        </div>
                        <button
                          onClick={() => navigate('/training/login')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors mr-4"
                        >
                          ログイン
                        </button>
                        <button
                          onClick={() => navigate(`/training/${trainingSlug}`)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          戻る
                        </button>
                      </div>
                    ) : isForbiddenError ? (
                      // 権限エラー専用表示
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center w-full">
                        <div className="text-yellow-600 text-6xl mb-4">⛔</div>
                        <div className="text-yellow-800 font-bold text-xl mb-2">
                          アクセス権限がありません
                        </div>
                        <div className="text-yellow-600 text-sm mb-4">
                          このコンテンツを表示する権限がありません。プランをアップグレードしてください。
                        </div>
                        <button
                          onClick={() => navigate('/training/plan')}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors mr-4"
                        >
                          プランを確認
                        </button>
                        <button
                          onClick={() => navigate(`/training/${trainingSlug}`)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          戻る
                        </button>
                      </div>
                    ) : (
                      // 一般的なエラー表示
                      <ErrorDisplay 
                        error={error}
                        onRetry={() => window.location.reload()}
                        onReset={() => navigate(`/training/${trainingSlug}`)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  if (!task) {
    return (
      <TrainingLayout>
        <div className="container py-8">
          <ErrorDisplay 
            error={new Error('タスクが見つかりませんでした')}
            onReset={() => navigate(`/training/${trainingSlug}`)}
          />
        </div>
      </TrainingLayout>
    );
  }

  // TaskDetailData を TaskFrontmatter 型に変換（エラーハンドリング強化版）
  let frontmatter: TaskFrontmatter;
  
  try {
    frontmatter = {
      title: task.title || 'タイトル未設定',
      slug: task.slug || taskSlug,
      order_index: safeNumberConvert(task.order_index) || 1,
      is_premium: safeBooleanConvert(task.is_premium, false),
      video_preview: safeStringConvert(task.video_preview),
      video_full: safeStringConvert(task.video_full),
      preview_sec: safeNumberConvert(task.preview_sec),
      next_task: safeStringConvert(task.next_task),
      prev_task: safeStringConvert(task.prev_task),
      // Storage front-matterから取得したフィールドを追加（安全な変換）
      estimated_time: safeStringConvert(task.estimated_time),
      difficulty: safeStringConvert(task.difficulty),
      description: safeStringConvert(task.description),
    };

    console.log('TaskDetailPage - フロントマター変換完了:', {
      originalData: {
        is_premium: task.is_premium,
        order_index: task.order_index,
        preview_sec: task.preview_sec
      },
      convertedData: {
        is_premium: frontmatter.is_premium,
        order_index: frontmatter.order_index,
        preview_sec: frontmatter.preview_sec
      }
    });
  } catch (conversionError) {
    console.error('TaskDetailPage - フロントマター変換エラー:', conversionError);
    // エラー時のフォールバック値
    frontmatter = {
      title: task.title || 'タイトル未設定',
      slug: task.slug || taskSlug,
      order_index: 1,
      is_premium: false,
      video_preview: undefined,
      video_full: undefined,
      preview_sec: undefined,
      next_task: undefined,
      prev_task: undefined,
      estimated_time: undefined,
      difficulty: undefined,
      description: undefined,
    };
  }

  // 動画URLがある場合のみ動画プレーヤーを表示
  const hasValidVideo = (frontmatter.video_preview && frontmatter.video_preview.trim()) || 
                        (frontmatter.video_full && frontmatter.video_full.trim());

  // フェーズ2: 動画とコンテンツアクセスログ
  console.log('TaskDetailPage - コンテンツアクセス詳細:', {
    hasValidVideo,
    videoFull: !!frontmatter.video_full,
    videoPreview: !!frontmatter.video_preview,
    contentLength: task.content?.length || 0,
    renderMarkdown: true
  });

  // Step 6: 最終統合 - 構造化コンテンツ対応版
  let contentSections: ContentSectionData[] = [];
  const hasValidContent = task && task.content && typeof task.content === 'string' && task.content.trim();
  
  // 構造化セクションデータの確認（将来的にフロントマターから取得）
  const structuredSections: StructuredSection[] | undefined = (task as any)?.sections;
  
  if (hasValidContent) {
    // 構造化データを優先的に使用し、フォールバックでマークダウン解析
    contentSections = parseContentSections(task.content, structuredSections);
    console.log('✅ 最終統合 - 解析されたセクション数:', contentSections.length);
    console.log('✅ 最終統合 - セクション構成:', contentSections.map(s => ({ title: s.title, type: s.type })));
    console.log('✅ 最終統合 - 構造化データ使用:', !!structuredSections?.length);
  } else {
    console.warn('⚠️ 最終統合 - コンテンツが無効またはない:', { 
      hasTask: !!task, 
      hasContent: !!(task?.content), 
      contentType: typeof task?.content,
      contentLength: task?.content?.length || 0,
      hasStructuredSections: !!structuredSections?.length
    });
  }

  return (
    <TrainingLayout>
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative size-full">
        {/* Navigation Section */}
        <NavigationHeader 
          trainingSlug={trainingSlug} 
          orderIndex={frontmatter.order_index} 
        />
        
        {/* Main Content Section */}
        <div className="relative rounded-[66px] shrink-0 w-full">
          <div className="flex flex-col items-center relative size-full">
            <div className="box-border content-stretch flex flex-col gap-8 items-center justify-start pb-24 pt-0 px-4 md:px-8 lg:px-24 relative w-full">
              
              {/* Eyecatch Section */}
              <div className="box-border content-stretch flex flex-col gap-5 items-center justify-start pb-4 pt-5 px-0 relative shrink-0 w-full max-w-[741px]">
                <div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-0 relative shrink-0 w-full">
                  {/* Block - カテゴリとタグ */}
                  <div className="box-border content-stretch flex flex-row gap-4 items-start justify-center p-0 relative shrink-0 w-full">
                    <div className="bg-[rgba(184,163,4,0.12)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0">
                      <div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#5e4700] text-[12px] text-center text-nowrap">
                        <p className="block leading-[16px] whitespace-pre">説明</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Heading - タイトルと説明 */}
                  <div className="box-border content-stretch flex flex-col gap-4 items-center justify-start p-0 relative shrink-0 w-full max-w-[640px]">
                    <div className="box-border content-stretch flex flex-row gap-2.5 items-end justify-center p-0 relative shrink-0 w-full">
                      <div className="basis-0 font-['Rounded_Mplus_1c:Medium',_sans-serif] grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1d382f] text-[28px] md:text-[28px] lg:text-[40px] text-center">
                        <h1 className="block leading-[1.28] font-rounded-mplus font-bold">{frontmatter.title}</h1>
                      </div>
                    </div>
                    {frontmatter.description && (
                      <div className="font-['Rounded_Mplus_1c:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-base md:text-lg lg:text-[20px] text-[#475569] text-center w-full max-w-[477px]">
                        <p className="block leading-[1.69]">{frontmatter.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full max-w-[740px]">
                {/* 動画プレーヤー */}
                {hasValidVideo && (
                  <div className="mb-8">
                    <TaskVideo
                      videoUrl={frontmatter.video_full}
                      previewVideoUrl={frontmatter.video_preview}
                      isPremium={frontmatter.is_premium}
                      hasPremiumAccess={hasPremiumAccess}
                      title={frontmatter.title}
                      previewSeconds={frontmatter.preview_sec || 30}
                      className="w-full"
                    />
                  </div>
                )}

                 {/* Step 4-5: 構造化コンテンツセクション表示（プレミアムコンテンツ対応） */}
                 <div className="mb-8">
                   {hasValidContent && contentSections.length > 0 ? (
                     contentSections.map((section, index) => (
                       <div key={index} className="mb-6">
                         {section.type === 'design-solution' ? (
                           <DesignSolutionSection 
                             content={section.content}
                           />
                         ) : section.type === 'premium-only' ? (
                           hasPremiumAccess ? (
                             <ContentSection 
                               title={section.title}
                               content={section.content}
                             />
                           ) : (
                             <div className="border-2 border-orange-200 rounded-lg p-6 bg-orange-50">
                               <div className="flex items-center gap-3 mb-3">
                                 <span className="text-2xl">🔒</span>
                                 <h3 className="text-lg font-bold text-orange-800">{section.title}</h3>
                               </div>
                               <div className="text-orange-600 text-sm mb-4">
                                 このセクションはメンバー限定コンテンツです。
                               </div>
                               <button
                                 onClick={() => navigate('/training/plan')}
                                 className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                               >
                                 プランを確認
                               </button>
                             </div>
                           )
                         ) : (
                           <ContentSection 
                             title={section.title}
                             content={section.content}
                           />
                         )}
                       </div>
                     ))
                   ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <div className="text-yellow-800 font-medium mb-2">
                        📄 コンテンツが利用できません
                      </div>
                      <div className="text-yellow-600 text-sm">
                        {task ? 'このタスクにはまだコンテンツが設定されていません。' : 'タスクデータの取得に失敗しました。'}
                      </div>
                    </div>
                  )}
                </div>

                {/* ナビゲーション */}
                <TaskNavigation 
                  training={{ title: task.trainingTitle || 'トレーニング' }}
                  currentTaskSlug={taskSlug}
                  trainingSlug={trainingSlug}
                  nextTaskSlug={frontmatter.next_task}
                  prevTaskSlug={frontmatter.prev_task}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TaskDetailPage;
