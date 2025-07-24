/**
 * StyleComparison - 旧デザインと新デザインの比較ページ
 * Phase 6: StyleComparisonテストページの作成
 * 
 * 旧システム（MarkdownRenderer）と新システム（SimpleMarkdownRenderer + YamlMetaDisplay）を
 * 横並びで比較表示
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import TrainingLayout from '@/components/training/TrainingLayout';
import MarkdownRenderer from '@/components/training/MarkdownRenderer'; // 旧システム
import SimpleMarkdownRenderer from '@/components/training/SimpleMarkdownRenderer'; // 新システム
import YamlMetaDisplay from '@/components/training/YamlMetaDisplay'; // 新システム
import { getTrainingDetail } from '@/services/training/training-detail'; // 旧API
import { getTrainingDetailV2 } from '@/services/training/training-detail-v2'; // 新API
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ErrorDisplay from '@/components/common/ErrorBoundary';
import { TrainingError } from '@/utils/errors';

const StyleComparison: React.FC = () => {
  const { trainingSlug } = useParams<{ trainingSlug: string }>();
  const [viewMode, setViewMode] = useState<'split' | 'legacy' | 'new'>('split');
  
  // デフォルトのテスト用スラッグ
  const slug = trainingSlug || 'info-odai-book-rental';

  // 旧システムのデータ取得
  const { data: legacyData, isLoading: legacyLoading, error: legacyError } = useQuery({
    queryKey: ['training-legacy', slug],
    queryFn: () => getTrainingDetail(slug),
    retry: 1,
  });

  // 新システムのデータ取得
  const { data: newData, isLoading: newLoading, error: newError } = useQuery({
    queryKey: ['training-v2', slug],
    queryFn: () => getTrainingDetailV2(slug),
    retry: 1,
  });

  const isLoading = legacyLoading || newLoading;
  const hasError = legacyError || newError;

  // ローディング状態
  if (isLoading) {
    return (
      <TrainingLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  // エラー状態
  if (hasError) {
    return (
      <TrainingLayout>
        <div className="container mx-auto px-4 py-8">
          <ErrorDisplay 
            error={new TrainingError('データの取得に失敗しました', 'FETCH_ERROR')}
            onRetry={() => window.location.reload()}
          />
        </div>
      </TrainingLayout>
    );
  }

  // テスト用マークダウンコンテンツ（実際のファイルから読み込まれるまでのフォールバック）
  const testContent = `
### このチャレンジで伸ばせる力

<div class="skill-group">

### ■ "使いやすい UI"を要件とユーザーから設計する力

- 自分が良いと思うではなく、使う人目線の UI 作成スキル
- 参考リンク：『[デザイン基礎講座](https://example.com)』

![スキル解説画像](http://i.imgur.com/Jjwsc.jpg "サンプル")

### ■ 機能や状態を網羅して UI 設計する力

- 例外を考えて実装や検証や状況のパターンを UI で網羅
- より詳細な状態管理の考え方

</div>

## 進め方ガイド

> デザイン基礎を身につけながらデザインするための
> やり方の流れを説明します。

<div class="lesson">
![画像](http://i.imgur.com/Jjwsc.jpg "サンプル")
##### ゼロからはじめる情報設計
進め方の基礎はBONOで詳細に学習・実践できます
</div>

<div class="step">

##### ステップ 1: 摸写したいアプリを選ぶ

- なんでも良いですが、なるべく単一機能を提供しているアプリが良いと思います。

</div>

<div class="step">

##### ステップ 2: 📱 2.アプリを触りながら、気になったことをメモする(10 分)

- なんでも良いですが、なるべく単一機能を提供しているアプリが良いと思います。

</div>
`;

  return (
    <TrainingLayout>
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            スタイル比較ページ
          </h1>
          <p className="text-gray-600 mb-6">
            旧デザインシステムと新デザインシステム（Figmaベース）の比較表示
          </p>
          
          {/* 表示モード切替 */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={viewMode === 'split' ? 'default' : 'outline'}
              onClick={() => setViewMode('split')}
              size="sm"
            >
              横並び比較
            </Button>
            <Button
              variant={viewMode === 'legacy' ? 'default' : 'outline'}
              onClick={() => setViewMode('legacy')}
              size="sm"
            >
              旧デザインのみ
            </Button>
            <Button
              variant={viewMode === 'new' ? 'default' : 'outline'}
              onClick={() => setViewMode('new')}
              size="sm"
            >
              新デザインのみ
            </Button>
          </div>

          {/* テスト情報 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">テスト情報</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div>テスト対象: {slug}</div>
              <div>旧システム: {legacyData ? '✅ 読み込み成功' : '❌ 読み込み失敗'}</div>
              <div>新システム: {newData ? '✅ 読み込み成功' : '❌ 読み込み失敗'}</div>
            </div>
          </div>
        </div>

        {/* 比較表示 */}
        <div className={`grid gap-8 ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}>
          
          {/* 旧デザイン */}
          {(viewMode === 'split' || viewMode === 'legacy') && (
            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">旧デザイン（Legacy）</h2>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  複雑なパーサー
                </span>
              </div>
              
              {/* 旧システムの基本情報表示 */}
              {legacyData && (
                <div className="mb-6 p-4 bg-white rounded border">
                  <h3 className="text-lg font-semibold mb-2">{legacyData.title}</h3>
                  <p className="text-gray-600 mb-4">{legacyData.description}</p>
                  <div className="flex gap-2">
                    {legacyData.tags?.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 旧MarkdownRenderer */}
              <div className="bg-white rounded border p-4">
                <MarkdownRenderer 
                  content={testContent}
                  isPremium={false}
                  hasMemberAccess={true}
                />
              </div>
            </div>
          )}

          {/* 新デザイン */}
          {(viewMode === 'split' || viewMode === 'new') && (
            <div className="border border-green-300 rounded-lg p-6 bg-green-50">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">新デザイン（Figmaベース）</h2>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  ReactMarkdown
                </span>
              </div>
              
              {/* 新YamlMetaDisplay */}
              {newData?.frontmatter && (
                <div className="mb-6">
                  <YamlMetaDisplay frontmatter={newData.frontmatter} />
                </div>
              )}
              
              {/* 新SimpleMarkdownRenderer */}
              <div className="bg-white rounded border p-4">
                <SimpleMarkdownRenderer 
                  content={newData?.content || testContent}
                  isPremium={false}
                  hasMemberAccess={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* 比較チェックリスト */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">動作確認チェックリスト</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">📋 基本機能</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>skill-group クラスが正しく表示される</span>
                </li>
                <li className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>lesson クラスが正しく表示される</span>
                </li>
                <li className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>step クラスが正しく表示される</span>
                </li>
                <li className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>■マークが適切に表示される</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">🎨 デザイン</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>色合いが適切である</span>
                </li>
                <li className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>スペーシングが適切である</span>
                </li>
                <li className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>レスポンシブ対応している</span>
                </li>
                <li className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>全体的な見栄えが良い</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default StyleComparison;