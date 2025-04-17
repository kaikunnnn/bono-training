
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useContentItem } from '@/hooks/useContent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Lock } from 'lucide-react';
import { format } from 'date-fns';
import SubscriptionGuard from '@/components/subscription/SubscriptionGuard';

/**
 * コンテンツ詳細ページ
 */
const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { content, loading, error } = useContentItem(id || '');
  
  // ローディング状態の表示
  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-3/4 rounded bg-muted"></div>
            <div className="h-4 w-1/2 rounded bg-muted"></div>
            <div className="aspect-video rounded bg-muted"></div>
            <div className="h-4 rounded bg-muted"></div>
            <div className="h-4 w-3/4 rounded bg-muted"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // エラー状態の表示
  if (error || !content) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="rounded-lg border border-destructive p-6 text-center">
            <p className="text-destructive">{error?.message || 'コンテンツが見つかりませんでした'}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/content')}
            >
              コンテンツ一覧に戻る
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // 日付のフォーマット
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日');
    } catch (err) {
      return dateString;
    }
  };
  
  // 動画の長さを表示用にフォーマット
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '不明';
    
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}時間${remainingMinutes > 0 ? `${remainingMinutes}分` : ''}`;
    }
    
    return `${minutes}分`;
  };
  
  // 無料コンテンツかどうかを判定
  const isFreeContent = content.accessLevel === 'free';
  
  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/content')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>一覧に戻る</span>
          </Button>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                {content.categories.map((category) => (
                  <Badge key={category} variant="outline">
                    {category === 'figma' ? 'Figma' :
                    category === 'ui-design' ? 'UIデザイン' :
                    category === 'ux-design' ? 'UXデザイン' :
                    category === 'learning' ? '学習' :
                    category === 'member' ? 'メンバー' : category}
                  </Badge>
                ))}
                <Badge variant="secondary">
                  {content.type === 'video' ? '動画' :
                  content.type === 'article' ? '記事' :
                  content.type === 'tutorial' ? 'チュートリアル' :
                  content.type === 'course' ? 'コース' : content.type}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold">{content.title}</h1>
              <p className="text-lg text-muted-foreground">{content.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>更新日: {formatDate(content.updatedAt)}</span>
                </div>
                
                {content.videoDuration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>長さ: {formatDuration(content.videoDuration)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {/* コンテンツ本体 - サブスクリプション制御付き */}
            {isFreeContent ? (
              // 無料コンテンツの場合は直接表示
              <ContentBody content={content} />
            ) : (
              // 有料コンテンツの場合はサブスクリプションガードで囲む
              <SubscriptionGuard>
                <ContentBody content={content} />
              </SubscriptionGuard>
            )}
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">コンテンツ情報</h3>
                
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">種類</dt>
                    <dd className="mt-1">
                      {content.type === 'video' ? '動画' :
                      content.type === 'article' ? '記事' :
                      content.type === 'tutorial' ? 'チュートリアル' :
                      content.type === 'course' ? 'コース' : content.type}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">カテゴリ</dt>
                    <dd className="mt-1 flex flex-wrap gap-1">
                      {content.categories.map((category) => (
                        <Badge key={category} variant="outline">
                          {category === 'figma' ? 'Figma' :
                          category === 'ui-design' ? 'UIデザイン' :
                          category === 'ux-design' ? 'UXデザイン' :
                          category === 'learning' ? '学習' :
                          category === 'member' ? 'メンバー' : category}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">アクセスレベル</dt>
                    <dd className="mt-1 flex items-center gap-2">
                      {content.accessLevel !== 'free' && <Lock className="h-4 w-4" />}
                      <span>
                        {content.accessLevel === 'free' ? '無料' :
                        content.accessLevel === 'standard' ? 'スタンダード' :
                        content.accessLevel === 'growth' ? 'グロース' :
                        content.accessLevel === 'community' ? 'コミュニティ' : content.accessLevel}
                      </span>
                    </dd>
                  </div>
                  
                  {content.videoDuration && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">長さ</dt>
                      <dd className="mt-1">{formatDuration(content.videoDuration)}</dd>
                    </div>
                  )}
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">公開日</dt>
                    <dd className="mt-1">{formatDate(content.createdAt)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// コンテンツ本体コンポーネント
const ContentBody: React.FC<{ content: any }> = ({ content }) => {
  if (content.type === 'video' && content.videoUrl) {
    return (
      <div className="aspect-video overflow-hidden rounded-lg">
        {/* ここに実際の動画プレーヤーコンポーネントを追加 */}
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <div className="text-center">
            <h3 className="text-lg font-medium">動画コンテンツ</h3>
            <p className="mt-2 text-sm text-muted-foreground">URL: {content.videoUrl}</p>
            <div className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground">
              動画プレーヤー（サンプル）
            </div>
          </div>
        </div>
      </div>
    );
  } else if (content.content) {
    return (
      <div className="prose max-w-none dark:prose-invert">
        {/* ここでMarkdownなどのレンダリングを行う */}
        <p>{content.content}</p>
      </div>
    );
  } else if (content.type === 'course' && content.lessonIds) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">コース内容</h2>
        <div className="rounded-lg border">
          <div className="p-4">
            <p className="text-muted-foreground">このコースには {content.lessonIds.length} のレッスンが含まれています</p>
          </div>
          <div className="divide-y">
            {content.lessonIds.map((lessonId: string, index: number) => (
              <div key={lessonId} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">レッスン {index + 1}</div>
                    <div className="text-sm text-muted-foreground">ID: {lessonId}</div>
                  </div>
                  <Link to={`/content/${lessonId}`}>
                    <Button variant="outline" size="sm">
                      表示
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-lg border p-6 text-center">
      <p className="text-muted-foreground">このコンテンツの表示方法は現在準備中です</p>
    </div>
  );
};

export default ContentDetail;
