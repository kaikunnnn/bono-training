import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useContentItem } from '@/hooks/useContent';
import { getContentById as getMockContentById } from '@/data/mockContent';
import { ContentItem } from '@/types/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Lock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import VimeoPlayer from '@/components/content/VimeoPlayer';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { CONTENT_PERMISSIONS } from '@/utils/subscriptionPlans';
import { toast } from 'sonner';

const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { content: apiContent, loading, error, getContentVisibility, isFreePreview } = useContentItem(id || '');
  const [content, setContent] = useState<ContentItem | null>(null);
  const [localIsFreePreview, setLocalIsFreePreview] = useState(false);
  const { isSubscribed, planType } = useSubscriptionContext();

  useEffect(() => {
    if (apiContent) {
      setContent(apiContent);
      setLocalIsFreePreview(isFreePreview || false);
    } else if (error && id) {
      console.log('APIによるコンテンツ取得失敗、モックデータから取得を試みます:', id);
      const mockContent = getMockContentById(id);
      
      if (mockContent) {
        console.log('モックデータからコンテンツを取得しました:', mockContent.title);
        setContent(mockContent);
        setLocalIsFreePreview(!isSubscribed && mockContent.accessLevel !== 'free');
      }
    }
  }, [apiContent, error, id, isFreePreview, isSubscribed]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!content) {
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

  const { canViewFree, canViewPremium } = getContentVisibility ? 
    getContentVisibility() : 
    { 
      canViewFree: true, 
      canViewPremium: content.accessLevel === 'free' || (isSubscribed && (
        (planType && CONTENT_PERMISSIONS.member.includes(planType) && content.accessLevel === 'member') ||
        (planType && CONTENT_PERMISSIONS.learning.includes(planType) && content.accessLevel === 'learning') ||
        content.accessLevel === 'free'
      ))
    };
  
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日');
    } catch (err) {
      return dateString;
    }
  };
  
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

  const getAccessLevelLabel = (accessLevel: string): string => {
    switch (accessLevel) {
      case 'free':
        return '無料';
      case 'learning':
        return '学習コンテンツ';
      case 'member':
        return 'メンバー限定';
      default:
        return accessLevel;
    }
  };

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
        
        {localIsFreePreview && (
          <div className="mb-4 rounded-md bg-amber-50 dark:bg-amber-950 p-4 border-l-4 border-amber-500">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  無料プレビュー
                </h3>
                <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                  <p>
                    これは無料プレビュー版です。全てのコンテンツを閲覧するには、サブスクリプションが必要です。
                  </p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <Link to="/subscription">
                      <Button variant="outline" size="sm" className="bg-amber-50 text-amber-800 border-amber-500 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800">
                        サブスクリプションを購入する
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
            
            {content.type === 'video' && (
              <div className="space-y-6">
                {canViewPremium && !localIsFreePreview && (
                  <div className="space-y-4">
                    <div className="aspect-video overflow-hidden rounded-lg border-2 border-primary">
                      <VimeoPlayer
                        vimeoId={content.videoUrl || ''}
                        title={content.title}
                        responsive={true}
                      />
                    </div>
                    {content.content && (
                      <div className="prose max-w-none dark:prose-invert">
                        <div dangerouslySetInnerHTML={{ __html: content.content }} />
                      </div>
                    )}
                  </div>
                )}
                
                {(!canViewPremium || localIsFreePreview) && (
                  <div className="space-y-6">
                    {canViewFree && content.freeVideoUrl && (
                      <div className="space-y-4">
                        <div className="aspect-video overflow-hidden rounded-lg">
                          <VimeoPlayer
                            vimeoId={content.freeVideoUrl}
                            title={`${content.title} (プレビュー)`}
                            responsive={true}
                          />
                        </div>
                        <div className="rounded-md bg-muted p-2 text-center text-sm text-muted-foreground">
                          これは無料プレビュー版です。完全版を視聴するにはサブスクリプションが必要です。
                        </div>
                      </div>
                    )}
                    
                    {canViewFree && content.freeContent && (
                      <div className="prose max-w-none dark:prose-invert">
                        <div dangerouslySetInnerHTML={{ __html: content.freeContent }} />
                        <div className="mt-4 rounded-md bg-muted p-2 text-center text-sm text-muted-foreground">
                          続きを読むにはサブスクリプションが必要です。
                        </div>
                      </div>
                    )}
                    
                    <div className="rounded-lg border-2 border-dashed border-primary/30 p-6">
                      <div className="text-center">
                        <h3 className="text-xl font-medium">プレミアムコンテンツ</h3>
                        <p className="mt-2 text-muted-foreground">
                          このコンテンツの続きを閲覧するには、プレミアムメンバーシップへの登録が必要です。
                        </p>
                        <div className="mt-6">
                          <Link to="/subscription">
                            <Button>メンバーシップに登録する</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                      <span>{getAccessLevelLabel(content.accessLevel)}</span>
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

export default ContentDetail;
