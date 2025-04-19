
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import VimeoPlayer from '@/components/content/VimeoPlayer';
import { Button } from '@/components/ui/button';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { getContentById } from '@/services/content';
import { ContentItem } from '@/types/content';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const VideoDetailTest = () => {
  const { id } = useParams();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const { isSubscribed } = useSubscriptionContext();

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { content: fetchedContent, error, isFreePreview } = await getContentById(id);
        
        if (error) {
          toast.error(error.message);
          return;
        }

        if (fetchedContent) {
          setContent(fetchedContent);
          setIsFreePreview(isFreePreview || false);
        }
      } catch (err) {
        toast.error('コンテンツの取得に失敗しました');
        console.error('コンテンツ取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

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
