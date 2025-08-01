
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import TrainingLayout from '@/components/training/TrainingLayout';
import TaskCollectionBlock from '@/components/training/TaskCollectionBlock';
import SimpleMarkdownRenderer from '@/components/training/SimpleMarkdownRenderer';
import { useTrainingDetail } from '@/hooks/useTrainingCache';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorDisplay from '@/components/common/ErrorBoundary';
import { TrainingError } from '@/utils/errors';
import { TrainingFrontmatter } from '@/types/training';
import { useState, useEffect } from 'react';
import { loadTrainingContent } from '@/utils/loadTrainingContent';
import { getSkillsFromFrontmatter, getGuideFromFrontmatter, convertGuideDataToGuideContent, convertSkillsToHtml } from '@/utils/simplifiedSkillGuideParser';
import ChallengeMeritSection from '@/components/training/ChallengeMeritSection';
import CategoryTag from '@/components/training/CategoryTag';
import TrainingGuideSection from '@/components/training/TrainingGuideSection';
import { HalfCircleBg } from '@/components/training/HalfCircleBg';
import IconBlock from '@/components/training/IconBlock';

/**
 * トレーニング詳細ページ（React Query対応版）
 */
const TrainingDetail = () => {
  const { trainingSlug } = useParams<{ trainingSlug: string }>();
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [frontmatter, setFrontmatter] = useState<TrainingFrontmatter | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [guideContent, setGuideContent] = useState<any>(null);
  const [guideError, setGuideError] = useState<string | null>(null);
  
  if (!trainingSlug) {
    return <Navigate to="/training" replace />;
  }

  const { data: training, isLoading, error } = useTrainingDetail(trainingSlug);

  // 動的インポートでindex.mdコンテンツを読み込み
  useEffect(() => {
    const loadContent = async () => {
      try {
        setContentError(null);
        setGuideError(null);
        
        const { frontmatter, content } = await loadTrainingContent(trainingSlug);
        setFrontmatter(frontmatter);
        setMarkdownContent(content);

        // ガイドコンテンツの抽出と解析（新しいシンプルなパーサー使用）
        try {
          const guideData = getGuideFromFrontmatter(frontmatter);
          if (guideData) {
            const convertedGuideContent = convertGuideDataToGuideContent(guideData);
            setGuideContent(convertedGuideContent);
            console.log('✅ YAMLからガイドコンテンツを正常に抽出しました:', convertedGuideContent);
          } else {
            console.warn('⚠️ フロントマターに進め方ガイド情報が見つかりませんでした');
            setGuideContent(null);
          }
        } catch (guideParseError) {
          console.error('❌ ガイドコンテンツの解析に失敗しました:', guideParseError);
          setGuideError(guideParseError instanceof Error ? guideParseError.message : 'ガイドの解析に失敗しました');
          setGuideContent(null);
        }
      } catch (error) {
        console.error('コンテンツ読み込みエラー:', error);
        setContentError(error instanceof Error ? error.message : 'コンテンツの読み込みに失敗しました');
        setFrontmatter(null);
        setMarkdownContent('');
        setGuideContent(null);
      }
    };

    if (trainingSlug) {
      loadContent();
    }
  }, [trainingSlug]);


  if (isLoading) {
    return (
      <TrainingLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  if (error) {
    return (
      <TrainingLayout>
        <div className="container mx-auto px-4 py-8">
          <ErrorDisplay 
            error={error instanceof Error ? new TrainingError(error.message, 'FETCH_ERROR') : new TrainingError('不明なエラー', 'UNKNOWN_ERROR')}
            onRetry={() => window.location.reload()}
            onReset={() => window.location.href = '/training'}
          />
        </div>
      </TrainingLayout>
    );
  }

  if (!training) {
    return (
      <TrainingLayout>
        <div className="container mx-auto px-4 py-8">
          <ErrorDisplay 
            error={new TrainingError('トレーニングが見つかりませんでした', 'NOT_FOUND', 404)}
            onReset={() => window.location.href = '/training'}
          />
        </div>
      </TrainingLayout>
    );
  }

  return (
    <TrainingLayout>
      <div>
        {/* Figmaデザインベースのeyecatchセクション */}
        {frontmatter && (
          <div
            className="box-border content-stretch flex flex-col items-center justify-start pb-[120px] pt-24 px-0 relative size-full mb-8 border-b border-slate-200"
            data-name="training-overview"
          >
            
            {/* 背景 */}
            <div
              className="absolute h-[289px] left-0 overflow-clip top-0 w-full"
              data-name="bg"
            >
              <div
                className="absolute h-[399px] left-[-10%] overflow-clip top-[-10px] w-[120%]"
                data-name="表紙"
              >
                <div 
                  className={`relative size-full ${
                    frontmatter.background_svg 
                      ? `bg-[url('${frontmatter.background_svg}')] bg-cover bg-center bg-no-repeat` 
                      : frontmatter.fallback_gradient 
                        ? `bg-gradient-to-r from-[${frontmatter.fallback_gradient.from}] via-[${frontmatter.fallback_gradient.via}] to-[${frontmatter.fallback_gradient.to}]`
                        : "bg-gradient-to-r from-[#fdf3ff] via-[#f3e8ff] to-[#e9d5ff]"
                  }`} 
                  data-name="Property 1=Variant2"
                >
                  <div
                    className="absolute h-3.5 left-[-5%] top-[308px] w-[110%]"
                    data-name="line-wave"
                  >
                    <svg
                      className="block size-full"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 1695 14"
                    >
                      <g clipPath="url(#clip0_3_4644)" id="line-wave" opacity="0.14">
                        <path
                          d="M0 7C0 7 100 0 200 7C300 14 400 0 500 7C600 14 700 0 800 7C900 14 1000 0 1100 7C1200 14 1300 0 1400 7C1500 14 1600 0 1700 7"
                          id="Vector"
                          stroke="var(--stroke-0, #3B0764)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="0.75"
                        />
                        <path
                          d="M0 7C0 7 100 14 200 7C300 0 400 14 500 7C600 0 700 14 800 7C900 0 1000 14 1100 7C1200 0 1300 14 1400 7C1500 0 1600 14 1700 7"
                          id="Vector_2"
                          stroke="var(--stroke-0, #3B0764)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="0.75"
                        />
                        <path
                          d="M0 7C0 7 100 0 200 7C300 14 400 0 500 7C600 14 700 0 800 7C900 14 1000 0 1100 7C1200 14 1300 0 1400 7C1500 14 1600 0 1700 7"
                          id="Vector_3"
                          stroke="var(--stroke-0, #3B0764)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="0.75"
                        />
                        <path
                          d="M0 7C0 7 100 14 200 7C300 0 400 14 500 7C600 0 700 14 800 7C900 0 1000 14 1100 7C1200 0 1300 14 1400 7C1500 0 1600 14 1700 7"
                          id="Vector_4"
                          stroke="var(--stroke-0, #3B0764)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="0.75"
                        />
                        <path
                          d="M0 7C0 7 100 0 200 7C300 14 400 0 500 7C600 14 700 0 800 7C900 14 1000 0 1100 7C1200 14 1300 0 1400 7C1500 14 1600 0 1700 7"
                          id="Vector_5"
                          stroke="var(--stroke-0, #3B0764)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="0.75"
                        />
                        <path
                          d="M0 7C0 7 100 14 200 7C300 0 400 14 500 7C600 0 700 14 800 7C900 0 1000 14 1100 7C1200 0 1300 14 1400 7C1500 0 1600 14 1700 7"
                          id="Vector_6"
                          stroke="var(--stroke-0, #3B0764)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="0.75"
                        />
                        <path
                          d="M0 7C0 7 100 0 200 7C300 14 400 0 500 7C600 14 700 0 800 7C900 14 1000 0 1100 7C1200 14 1300 0 1400 7C1500 14 1600 0 1700 7"
                          id="Vector_7"
                          stroke="var(--stroke-0, #3B0764)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="0.75"
                        />
                        <path
                          d="M0 7C0 7 100 14 200 7C300 0 400 14 500 7C600 0 700 14 800 7C900 0 1000 14 1100 7C1200 0 1300 14 1400 7C1500 0 1600 14 1700 7"
                          id="Vector_8"
                          stroke="var(--stroke-0, #3B0764)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="0.75"
                        />
                        <path
                          d="M0 7C0 7 100 0 200 7C300 14 400 0 500 7C600 14 700 0 800 7C900 14 1000 0 1100 7C1200 14 1300 0 1400 7C1500 14 1600 0 1700 7"
                          id="Vector_9"
                          stroke="var(--stroke-0, #3B0764)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="0.75"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_3_4644">
                          <rect fill="white" height="14" width="1695" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 半円オブジェクト（インラインSVG） */}
            <div
              className="absolute left-0 top-[140px] w-full"
              style={{ height: '160px' }}
              data-name="img_half_circle_object"
            >
              <HalfCircleBg />
            </div>

            {/* メインコンテンツ */}
            <div
              className="box-border content-stretch flex flex-col gap-5 items-center justify-start mb-[-120px] pb-6 pt-2 px-4 relative shrink-0 w-full max-w-[768px] mx-auto"
              data-name="wrapper-content"
            >
              {/* アイコンフレーム */}
              <IconBlock
                iconSrc={frontmatter.icon}
                iconAlt={`${frontmatter.title || 'トレーニング'}のアイコン`}
                size="lg"
                className="sm:!size-[80px] md:!size-[100px] lg:!size-[120px]"
              />

              {/* テキストセクション */}
              <div
                className="box-border content-stretch flex flex-col gap-3 items-center justify-start p-0 relative shrink-0 w-full"
                data-name="text-section"
              >
                {/* カテゴリとタイプ */}
                <div
                  className="box-border content-stretch flex flex-row gap-3 sm:gap-5 items-center justify-center flex-wrap p-0 relative shrink-0"
                  data-name="section_category_and_tags"
                >
                  {/* タイプ */}
                  {frontmatter.type && (
                    <CategoryTag type={frontmatter.type} displayMode="type" />
                  )}
                  
                  {/* カテゴリ */}
                  {frontmatter.category && (
                    <CategoryTag category={frontmatter.category} displayMode="category" />
                  )}
                </div>

                {/* タイトル */}
                <div
                  className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] w-full not-italic relative shrink-0 text-[#0d221d] text-[24px] sm:text-[28px] md:text-[32px] text-center tracking-[0.75px] px-4"
                >
                  <p className="block leading-[1.49]">
                    {frontmatter.title || training.title || 'タイトルなし'}
                  </p>
                </div>

                {/* 説明文 */}
                <div
                  className="font-['Rounded_Mplus_1c:Regular',_sans-serif] leading-[0] w-full not-italic relative shrink-0 text-[#0d221d] text-[14px] sm:text-[15px] md:text-[16px] text-center tracking-[1px] px-4"
                >
                  <p className="block leading-[1.6]">
                    {frontmatter.description || training.description || ''}
                  </p>
                </div>
              </div>

              {/* ボタンコンテナ */}
              <div
                className="box-border content-stretch flex flex-row gap-4 items-center justify-center p-0 relative shrink-0 w-full max-w-[800px]"
                data-name="Button Container"
              >
                {/* はじめるボタン */}
                <button
                  className="bg-[#0d221d] box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0 hover:bg-opacity-90 transition-all duration-200"
                  data-name="button"
                  onClick={() => {
                    // 最初のタスクに移動
                    if (training.tasks && training.tasks.length > 0) {
                      const firstTask = training.tasks.sort((a, b) => a.order_index - b.order_index)[0];
                      window.location.href = `/training/${trainingSlug}/${firstTask.slug}`;
                    }
                  }}
                >
                  <div className="absolute border border-[rgba(13,15,24,0.81)] border-solid inset-0 pointer-events-none rounded-[1000px]" />
                  <div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[14px] text-center text-nowrap tracking-[0.75px]">
                    <p className="adjustLetterSpacing block leading-none whitespace-pre">
                      はじめる
                    </p>
                  </div>
                </button>

                {/* 進め方をみるボタン */}
                <button
                  className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0 hover:bg-gray-100 transition-all duration-200"
                  data-name="button"
                  onClick={() => {
                    // 進め方ガイドセクションへスクロールまたはページ下部へ
                    const guideSection = document.querySelector('[data-name="section-progress-guide"]');
                    if (guideSection) {
                      guideSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }
                  }}
                >
                  <div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[1000px]" />
                  <div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap tracking-[0.75px]">
                    <p className="adjustLetterSpacing block leading-none whitespace-pre">
                      進め方をみる
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}



        {/* セクション・オーバービュー */}
        <div className="max-w-3xl mx-auto" data-name="section-overview">
          {/* チャレンジで身につくことセクション */}
          {frontmatter && (() => {
            const skills = getSkillsFromFrontmatter(frontmatter);
            const skillTitles = skills.map(skill => skill.title);
            return skillTitles.length > 0 ? (
              <ChallengeMeritSection skillTitles={skillTitles} />
            ) : null;
          })()}

          {/* タスク一覧 */}
          <div data-name="task-collection-block">
            <TaskCollectionBlock 
              tasks={training.tasks || []} 
              trainingSlug={trainingSlug}
              className="mt-8"
            />
          </div>
        </div>

        {/* このチャレンジで伸ばせる力セクション（進め方ガイドの上） */}
        {frontmatter && (() => {
          const skills = getSkillsFromFrontmatter(frontmatter);
          if (skills.length === 0) return null;
          
          const skillsHtml = convertSkillsToHtml(skills);
          return (
            <div className="mt-12">
              <SimpleMarkdownRenderer 
                content={skillsHtml}
                className="prose prose-lg max-w-none"
                options={{
                  isPremium: frontmatter?.is_premium || false,
                  hasMemberAccess: true
                }}
              />
            </div>
          );
        })()}

        {/* 進め方ガイドセクション */}
        {guideContent && (
          <div data-name="section-progress-guide">
            <TrainingGuideSection guideContent={guideContent} />
          </div>
        )}

        {/* マークダウンコンテンツ（残りのコンテンツ） */}
        {markdownContent && (
          <SimpleMarkdownRenderer 
            content={markdownContent}
            className="prose prose-lg max-w-none"
            options={{
              isPremium: frontmatter?.is_premium || false,
              hasMemberAccess: true // TODO: 実際のユーザー権限を確認
            }}
          />
        )}
      </div>
    </TrainingLayout>
  );
};

export default TrainingDetail;
