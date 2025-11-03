import React, { useState } from 'react';
import { useWebflowSeries } from '@/hooks/useWebflowSeries';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Video, Clock } from 'lucide-react';

const WebflowTest: React.FC = () => {
  const [seriesInput, setSeriesInput] = useState('');
  const [activeSeriesId, setActiveSeriesId] = useState('');

  const { data, isLoading, error, refetch } = useWebflowSeries(activeSeriesId);

  const handleFetch = () => {
    if (seriesInput.trim()) {
      setActiveSeriesId(seriesInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetch();
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Webflow CMS統合テスト</h1>
          <p className="text-gray-600">
            Webflow SeriesをフェッチしてQuest構造を表示します
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Series ID または Slug を入力</CardTitle>
            <CardDescription>
              WebflowのSeries IDまたはSlugを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="例: 6029d01e01a7fb81007f8e4e または series-slug"
                value={seriesInput}
                onChange={(e) => setSeriesInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={handleFetch}
                disabled={!seriesInput.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    読み込み中
                  </>
                ) : (
                  'フェッチ'
                )}
              </Button>
            </div>
            
            {/* Sample IDs */}
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium mb-2">サンプルデータ:</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                    Videos Collection ID: 6029d027f6cb8852cbce8c75
                  </span>
                </p>
                <p>
                  <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                    Series Collection ID: 6029d01e01a7fb81007f8e4e
                  </span>
                </p>
                <p>
                  <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                    Sample Video: slug-three-structures-11
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <XCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'データの取得に失敗しました'}
            </AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {data && data.success && (
          <>
            {/* Metadata */}
            <Alert className="mb-8 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">取得成功</AlertTitle>
              <AlertDescription className="text-green-700">
                <div className="space-y-1 mt-2">
                  <p>キャッシュ: {data.cached ? 'ヒット ✓' : 'ミス (新規取得)'}</p>
                  <p>取得時刻: {new Date(data.timestamp).toLocaleString('ja-JP')}</p>
                  <p>Quest数: {data.lesson.quests.length}</p>
                  <p>
                    総記事数:{' '}
                    {data.lesson.quests.reduce((sum, q) => sum + q.articles.length, 0)}
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Lesson Info */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">{data.lesson.title}</CardTitle>
                <CardDescription>
                  Slug: {data.lesson.slug} | Source: {data.lesson.source} | ID:{' '}
                  {data.lesson.webflowId}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Quests */}
            <div className="space-y-6">
              {data.lesson.quests.map((quest) => (
                <Card key={quest._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-blue-600">Quest {quest.questNumber}:</span>
                      {quest.title}
                    </CardTitle>
                    <CardDescription>
                      {quest.articles.length} 記事
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quest.articles.map((article, index) => (
                        <div
                          key={article._id}
                          className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {article.title}
                            </h4>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  {article.slug}
                                </span>
                              </span>
                              {article.videoUrl && (
                                <span className="flex items-center gap-1">
                                  <Video className="h-3 w-3" />
                                  <a
                                    href={article.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    動画を見る
                                  </a>
                                </span>
                              )}
                              {article.videoDuration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {article.videoDuration}
                                </span>
                              )}
                            </div>
                            {article.content && (
                              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                                {article.content.length > 150 ? '...' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Refresh Button */}
            <div className="mt-8 flex justify-center">
              <Button onClick={() => refetch()} variant="outline">
                再取得
              </Button>
            </div>
          </>
        )}

        {/* Instructions */}
        {!activeSeriesId && (
          <Card>
            <CardHeader>
              <CardTitle>使い方</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>上の入力欄にWebflow Series IDまたはSlugを入力</li>
                <li>「フェッチ」ボタンをクリック（またはEnterキー）</li>
                <li>Quest構造が正しく再構築されているか確認</li>
                <li>動画リンクが正しく表示されているか確認</li>
                <li>キャッシュが機能しているか確認（2回目の取得）</li>
              </ol>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm font-medium text-yellow-800 mb-1">注意:</p>
                <p className="text-sm text-yellow-700">
                  このページはテスト用です。Webflow API トークンがSupabase Secretsに設定されている必要があります。
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default WebflowTest;
