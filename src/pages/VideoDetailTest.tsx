import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import VimeoPlayer from '@/components/content/VimeoPlayer';
import { Button } from '@/components/ui/button';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { getContentById } from '@/services/content';
import { getContentById as getMockContentById } from '@/data/mockContent';
import { ContentItem } from '@/types/content';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CONTENT_PERMISSIONS } from '@/utils/subscriptionPlans';

const VideoDetailTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const { isSubscribed, planType } = useSubscriptionContext();

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // API経由でコンテンツを取得
        const { content: fetchedContent, error, isFreePreview } = await getContentById(id);
        
        // コンテンツが取得できた場合はそれを使用
        if (fetchedContent) {
          setContent(fetchedContent);
          setIsFreePreview(isFreePreview || false);
          if (error) {
            toast.info(error.message);
          }
          setLoading(false);
          return;
        }
        
        // APIでの取得に失敗した場合、モックデータからの取得を試みる
        if (error) {
          console.log('APIによるコンテンツ取得失敗、モックデータから取得を試みます:', id);
          const mockContent = getMockContentById(id);
          
          if (mockContent) {
            console.log('モックデータからコンテンツを取得しました:', mockContent.title);
            
            // 閲覧制限の判定
            const canViewPremium = mockContent.accessLevel === 'free' || 
              (isSubscribed && planType && 
                ((mockContent.accessLevel === 'learning' && CONTENT_PERMISSIONS.learning.includes(planType)) || 
                 (mockContent.accessLevel === 'member' && CONTENT_PERMISSIONS.member.includes(planType))));
            
            setContent(mockContent);
            setIsFreePreview(!canViewPremium);
            setLoading(false);
            return;
          }
          
          // モックデータからも取得できなかった場合
          toast.error(error.message || 'コンテンツの取得に失敗しました');
        }
      } catch (err) {
        toast.error('コンテンツの取得に失敗しました');
        console.error('コンテンツ取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, isSubscribed, planType]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!content) {
    return (
      <Layout>
        <div className="container py-8">
          <h1 className="text-2xl font-bold">コンテンツが見つかりません</h1>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/')}
          >
            トップページに戻る
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{content.title}</h1>
          <p className="mt-2 text-muted-foreground">{content.description}</p>
        </div>

        <div className="mb-8 overflow-hidden rounded-lg">
          <VimeoPlayer
            vimeoId={isFreePreview ? content.freeVideoUrl || '' : content.videoUrl || ''}
            title={content.title}
          />
        </div>

        {isFreePreview && (
          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
            <p className="text-yellow-800 dark:text-yellow-200">
              これは無料プレビューです。全編をご覧いただくには、サブスクリプションが必要です。
            </p>
            {!isSubscribed && (
              <Button variant="link" className="mt-2 p-0 text-yellow-800 dark:text-yellow-200" onClick={() => window.location.href = '/subscription'}>
                サブスクリプションの詳細を見る →
              </Button>
            )}
          </div>
        )}

        <div className="prose dark:prose-invert lg:prose-lg" dangerouslySetInnerHTML={{ 
          __html: isFreePreview ? content.freeContent || '' : content.content || '' 
        }} />
      </div>
    </Layout>
  );
};

export default VideoDetailTest;
