
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, Tag } from 'lucide-react';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TaskList from '@/components/training/TaskList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getTrainingDetail, getUserTaskProgress } from '@/services/training';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import TrainingProgress from '@/components/training/TrainingProgress';

const TrainingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSubscribed, planMembers } = useSubscriptionContext();
  const [loading, setLoading] = useState(true);
  const [trainingData, setTrainingData] = useState<any>(null);
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  
  const hasPremiumAccess = isSubscribed && planMembers;
  
  // slugが存在しない場合のエラーハンドリング
  if (!slug) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">エラー</h1>
            <p className="mt-2">トレーニングスラッグが指定されていません。</p>
            <Button
              className="mt-4"
              onClick={() => navigate('/training')}
            >
              トレーニング一覧に戻る
            </Button>
          </div>
        </div>
      </TrainingLayout>
    );
  }
  
  useEffect(() => {
    const fetchTrainingData = async () => {
      setLoading(true);
      try {
        console.log('TrainingDetail - slug:', slug);
        
        // トレーニング詳細データを取得
        const trainingDetailData = await getTrainingDetail(slug);
        console.log('TrainingDetail - trainingDetailData:', trainingDetailData);
        setTrainingData(trainingDetailData);
        
        // ユーザーがログインしている場合は進捗状況を取得
        if (user && trainingDetailData) {
          try {
            const progressData = await getUserTaskProgress(user.id, trainingDetailData.id);
            if (progressData && !progressData.error && progressData.progressMap) {
              setProgressMap(progressData.progressMap);
            }
          } catch (progressError) {
            console.error('進捗状況の取得に失敗しました:', progressError);
          }
        }
      } catch (error) {
        console.error('トレーニングデータの取得に失敗しました:', error);
        toast({
          title: 'エラーが発生しました',
          description: 'トレーニングデータの取得に失敗しました。もう一度お試しください。',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingData();
  }, [slug, toast, user]);
  
  const handleBack = () => {
    navigate('/training');
  };
  
  if (loading) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="container py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </TrainingLayout>
    );
  }
  
  if (!trainingData) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">トレーニングが見つかりません</h1>
            <p className="mt-2">指定されたトレーニング「{slug}」は存在しないか、アクセスできません。</p>
            <Button
              className="mt-4"
              onClick={handleBack}
            >
              トレーニング一覧に戻る
            </Button>
          </div>
        </div>
      </TrainingLayout>
    );
  }
  
  console.log('TrainingDetail - rendering with slug:', slug, 'trainingData:', trainingData);
  
  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <h1 className="text-3xl font-bold">{trainingData.title}</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">{trainingData.description}</p>
              
              <div className="flex items-center mt-4 space-x-4">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-sm">{`難易度: ${trainingData.difficulty}`}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-sm">{`${trainingData.type === 'challenge' ? 'チャレンジ' : 'スキル'}`}</span>
                </div>
              </div>
              
              {trainingData.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {trainingData.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator className="my-6" />
            
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">タスク一覧</h2>
              {trainingData.has_premium_content && !hasPremiumAccess && (
                <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-amber-800 dark:text-amber-300 text-sm">
                    このトレーニングには有料コンテンツが含まれています。すべてのコンテンツにアクセスするには
                    <Link to="/training/plan" className="text-amber-600 dark:text-amber-400 font-medium ml-1">
                      メンバーシップに登録
                    </Link>
                    してください。
                  </p>
                </div>
              )}
              
              <TaskList 
                tasks={trainingData.tasks || []} 
                progressMap={progressMap} 
                trainingSlug={slug}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
            {user && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 shadow-sm">
                <TrainingProgress 
                  tasks={trainingData.tasks || []}
                  progressMap={progressMap}
                  trainingSlug={slug}
                />
              </div>
            )}
            
            {!user && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-medium mb-2">進捗を記録するには</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  トレーニングの進捗を記録するには、ログインしてください。
                </p>
                <Link to="/auth?redirect=/training">
                  <Button className="w-full">ログイン / 登録</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TrainingDetail;
