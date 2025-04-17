
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
  const { content, loading, error, getContentVisibility } = useContentItem(id || '');
  
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
  
  // コンテンツの可視状態を取得
  const { canViewFree, canViewPremium } = getContentVisibility();
  
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
            
            {/* コンテンツ本体 - アクセス権に基づいて表示 */}
            <ContentBody 
              content={content} 
              canViewFree={canViewFree} 
              canViewPremium={canViewPremium} 
            />
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
interface ContentBodyProps {
  content: any;
  canViewFree: boolean;
  canViewPremium: boolean;
}

const ContentBody: React.FC<ContentBodyProps> = ({ content, canViewFree, canViewPremium }) => {
  // 無料コンテンツまたは有料コンテンツを表示する権限があるかどうか
  const isFreeContent = content.accessLevel === 'free';

  // 動画コンテンツの場合
  if (content.type === 'video' && content.videoUrl) {
    // 無料のプレビュー動画と有料の完全版動画
    const freeVideoUrl = content.freeVideoUrl || content.videoUrl; // freeVideoUrlが設定されていなければvideoUrlを使用
    const premiumVideoUrl = content.videoUrl;
    
    // サブスクリプション加入者の場合は完全版のみ表示
    if (canViewPremium) {
      return (
        <div className="space-y-4">
          <div className="aspect-video overflow-hidden rounded-lg border-2 border-primary">
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <div className="text-center">
                <h3 className="text-lg font-medium">プレミアムコンテンツ</h3>
                <p className="mt-2 text-sm text-muted-foreground">URL: {premiumVideoUrl}</p>
                <div className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground">
                  フル動画プレーヤー（サンプル）
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // 非加入者は無料プレビューとサブスクリプション案内を表示
    return (
      <div className="space-y-6">
        {/* 無料プレビュー動画 */}
        {canViewFree && !isFreeContent && (
          <div className="aspect-video overflow-hidden rounded-lg">
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <div className="text-center">
                <h3 className="text-lg font-medium">無料プレビュー</h3>
                <p className="mt-2 text-sm text-muted-foreground">URL: {freeVideoUrl}</p>
                <div className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground">
                  無料プレビュー動画
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 無料コンテンツの場合はそのまま表示 */}
        {isFreeContent && (
          <div className="aspect-video overflow-hidden rounded-lg">
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <div className="text-center">
                <h3 className="text-lg font-medium">動画コンテンツ</h3>
                <p className="mt-2 text-sm text-muted-foreground">URL: {freeVideoUrl}</p>
                <div className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground">
                  動画プレーヤー（サンプル）
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 有料コンテンツの場合はサブスクリプション案内を表示 */}
        {!isFreeContent && <SubscriptionCTA />}
      </div>
    );
  } 
  // 記事コンテンツの場合
  else if (content.content) {
    // 無料部分のコンテンツと有料部分のコンテンツを分ける
    // freeContentがなければcontentを無料コンテンツとして扱う
    const freeContent = content.freeContent || (isFreeContent ? content.content : '');
    const premiumContent = isFreeContent ? '' : content.content;
    
    // サブスクリプション加入者の場合は完全版のみ表示
    if (canViewPremium && !isFreeContent) {
      return (
        <div className="space-y-6">
          <div className="prose max-w-none dark:prose-invert">
            <h2>プレミアムコンテンツ</h2>
            <p>{premiumContent}</p>
          </div>
        </div>
      );
    }
    
    // 無料コンテンツの場合はそのまま表示
    if (isFreeContent) {
      return (
        <div className="space-y-6">
          <div className="prose max-w-none dark:prose-invert">
            <h2>コンテンツ</h2>
            <p>{freeContent}</p>
          </div>
        </div>
      );
    }
    
    // 非加入者は無料プレビューとサブスクリプション案内を表示
    return (
      <div className="space-y-6">
        {/* 無料部分 */}
        {canViewFree && freeContent && (
          <div className="prose max-w-none dark:prose-invert">
            <h2>無料プレビュー</h2>
            <p>{freeContent}</p>
          </div>
        )}
        
        {/* サブスクリプション案内 */}
        <SubscriptionCTA />
      </div>
    );
  } 
  // コースコンテンツの場合
  else if (content.type === 'course' && content.lessonIds) {
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

// サブスクリプション購入誘導コンポーネント
const SubscriptionCTA: React.FC = () => {
  return (
    <div className="rounded-lg border-2 border-dashed border-primary/30 p-6">
      <div className="text-center">
        <h3 className="text-xl font-medium">プレミアムコンテンツ</h3>
        <p className="mt-2 text-muted-foreground">
          このコンテンツの続きを閲覧するには、プレミアムメンバーシップへの登録が必要です。
        </p>
        <div className="mt-6 space-y-4">
          <ul className="mx-auto max-w-xs space-y-2 text-left">
            <li className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              全てのプレミアムコンテンツへのアクセス
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              高品質な学習教材
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              コミュニティへの参加
            </li>
          </ul>
          <div className="flex justify-center">
            <Link to="/subscription">
              <Button>メンバーシップに登録する</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;
