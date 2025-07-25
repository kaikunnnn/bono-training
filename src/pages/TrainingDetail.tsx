
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import TrainingLayout from '@/components/training/TrainingLayout';
import TaskList from '@/components/training/TaskList';
import TrainingProgress from '@/components/training/TrainingProgress';
import SimpleMarkdownRenderer from '@/components/training/SimpleMarkdownRenderer';
import { useTrainingDetail } from '@/hooks/useTrainingCache';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorDisplay from '@/components/common/ErrorBoundary';
import { TrainingError } from '@/utils/errors';
import { TrainingFrontmatter } from '@/types/training';
import { useState, useEffect } from 'react';

/**
 * トレーニング詳細ページ（React Query対応版）
 */
const TrainingDetail = () => {
  const { trainingSlug } = useParams<{ trainingSlug: string }>();
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [frontmatter, setFrontmatter] = useState<TrainingFrontmatter | null>(null);
  
  if (!trainingSlug) {
    return <Navigate to="/training" replace />;
  }

  const { data: training, isLoading, error } = useTrainingDetail(trainingSlug);

  // index.mdコンテンツの取得（実際のAPIまたはローカルファイルから）
  useEffect(() => {
    // TODO: 実際のindex.mdコンテンツを取得する処理に置き換える
    // 現在はモックデータを使用
    const mockIndexContent = `---
icon: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20halo/3D/smiling_face_with_halo_3d.png"
title: "社内本質し出しレシステムをデザインしよう"
description: "デザインシステムの基本的な考え方から実装まで..."
thumbnail: "/thumbnails/task.jpg"
type: "portfolio"
category: "情報設計"
tags: ["ポートフォリオ", "情報設計"]
estimated_total_time: "2時間"
task_count: 2
---

### このチャレンジで伸ばせる力

トレーニングはそのままやってもいいです。基礎も合わせて学習して、実践をトレーニングで行うと土台を築けるでしょう。

<div class="skill-group">

### ■ "使いやすい UI"を要件とユーザーから設計する力

- 自分が良いと思うではなく、使う人目線の UI 作成スキル
- 参考リンク：『[デザイン基礎講座](https://example.com)』

![スキル解説画像](http://i.imgur.com/Jjwsc.jpg "サンプル")

### ■ 機能や状態を網羅して UI 設計する力

- 例外を考えて実装や検証や状況のパターンを UI で網羅
- より詳細な状態管理の考え方

### ■ ユーザーゴールから配慮するべきものを UI に落とす

- 自分が良いと思うではなく、使う人目線の UI 作成スキル
- 参考リンク：『デザイン基礎を学ぶ』
</div>

## 進め方ガイド

> デザイン基礎を身につけながらデザインするための
> やり方の流れを説明します。

#### レッスンで身につける

<div class="lesson">
![画像](http://i.imgur.com/Jjwsc.jpg "サンプル")
##### ゼロからはじめる情報設計
進め方の基礎はBONOで詳細に学習・実践できます
</div>

#### 進め方

<div class="step">

##### ステップ 1: 摸写したいアプリを選ぶ

- なんでも良いですが、なるべく単一機能を提供しているアプリが良いと思います。普段使っている iPhone/Android の純正アプリ、ホーム画面に入っていていつも使っているアプリ、ストアのランキング上位のアプリなどから気楽に探してください。

</div>

<div class="step">

##### ステップ 2: 📱 2.アプリを触りながら、気になったことをメモする(10 分)

- なんでも良いですが、なるべく単一機能を提供しているアプリが良いと思います。普段使っている iPhone/Android の純正アプリ、ホーム画面に入っていていつも使っているアプリ、ストアのランキング上位のアプリなどから気楽に探してください。

</div>`;

    // フロントマターとコンテンツを分離
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
    const match = mockIndexContent.match(frontmatterRegex);
    
    if (match) {
      const [, yamlString, content] = match;
      // TODO: 実際のYAMLパーサーを使用する
      const parsedFrontmatter: TrainingFrontmatter = {
        icon: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20halo/3D/smiling_face_with_halo_3d.png",
        title: "社内本質し出しレシステムをデザインしよう",
        description: "デザインシステムの基本的な考え方から実装まで...",
        thumbnail: "/thumbnails/task.jpg",
        type: "portfolio",
        category: "情報設計",
        tags: ["ポートフォリオ", "情報設計"],
        estimated_total_time: "2時間",
        task_count: 2
      };
      setFrontmatter(parsedFrontmatter);
      setMarkdownContent(content.trim());
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
      <div className="px-6 py-8">
        {/* アイコンとタイトル表示 */}
        {frontmatter && (
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-6">
              {frontmatter.icon && (
                <img 
                  src={frontmatter.icon} 
                  alt="Training icon" 
                  className="w-16 h-16 object-contain"
                />
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{frontmatter.title || training.title || 'タイトルなし'}</h1>
                <p className="text-gray-600">{frontmatter.description || training.description || ''}</p>
              </div>
            </div>

            {/* メタ情報 */}
            <div className="flex flex-wrap gap-4 mb-4">
              {frontmatter.type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {frontmatter.type}
                </span>
              )}
              {frontmatter.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {frontmatter.category}
                </span>
              )}
              {frontmatter.estimated_total_time && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  推定時間: {frontmatter.estimated_total_time}
                </span>
              )}
              {frontmatter.task_count && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  タスク数: {frontmatter.task_count}
                </span>
              )}
            </div>

            {/* タグ */}
            <div className="flex gap-2">
              {(frontmatter.tags || training.tags || []).map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* サムネイル表示 */}
        {frontmatter?.thumbnail && (
          <div className="mb-8">
            <img 
              src={frontmatter.thumbnail} 
              alt="Training thumbnail" 
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* 進捗バー */}
        <TrainingProgress 
          tasks={training.tasks || []}
          progressMap={{}}
          trainingSlug={trainingSlug}
          className="mb-8" 
        />

        {/* マークダウンコンテンツ */}
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

        {/* タスク一覧 */}
        <TaskList 
          tasks={training.tasks || []} 
          trainingSlug={trainingSlug}
          className="mt-8"
        />
      </div>
    </TrainingLayout>
  );
};

export default TrainingDetail;
