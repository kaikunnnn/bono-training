
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskList from '@/components/training/TaskList';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock } from 'lucide-react';
import { getTrainingDetail } from '@/services/training';
import { TrainingDetailData } from '@/types/training';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

const TrainingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [trainingData, setTrainingData] = useState<TrainingDetailData | null>(null);
  const { isSubscribed, planMembers } = useSubscriptionContext();
  
  useEffect(() => {
    const fetchTrainingData = async () => {
      setLoading(true);
      try {
        if (slug) {
          const data = await getTrainingDetail(slug);
          setTrainingData(data);
        }
      } catch (error) {
        console.error("トレーニングデータの取得中にエラーが発生しました:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrainingData();
  }, [slug]);
  
  // メンバーシップアクセス権があるか確認
  const hasMemberAccess = isSubscribed && planMembers;
  
  // 各タスクにアクセス権限情報を追加
  const processedTasks = trainingData?.tasks?.map(task => ({
    ...task,
    // 有料タスクの場合、メンバーシップを持っていればアクセス可能
    isLocked: task.is_premium && !hasMemberAccess
  })) || [];
  
  if (loading) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="container py-8">
          <Skeleton className="h-16 w-3/4 mb-6" />
          <Skeleton className="h-24 w-full mb-8" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </TrainingLayout>
    );
  }
  
  if (!trainingData) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="container py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">トレーニングが見つかりませんでした</h2>
          <p className="text-muted-foreground mb-8">
            指定されたトレーニングは存在しないか、アクセスできません。
          </p>
          <Button asChild>
            <Link to="/training">トレーニング一覧へ戻る</Link>
          </Button>
        </div>
      </TrainingLayout>
    );
  }
  
  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{trainingData.title}</h1>
            {trainingData.description && (
              <p className="mt-2 text-lg text-gray-600">{trainingData.description}</p>
            )}
          </div>
          
          <div className="flex items-center flex-wrap gap-3">
            {trainingData.difficulty && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800">
                難易度: {trainingData.difficulty}
              </span>
            )}
            
            {trainingData.tags?.map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* 有料コンテンツを含み、かつメンバーシップを持っていない場合に警告表示 */}
          {trainingData.has_premium_content && !hasMemberAccess && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <Lock className="text-amber-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-800">メンバー限定コンテンツを含みます</h3>
                <p className="text-amber-700 text-sm mt-1">
                  このトレーニングには有料のタスクが含まれています。すべてのコンテンツにアクセスするには
                  メンバーシップへの登録が必要です。
                </p>
                <div className="mt-3">
                  <Button asChild size="sm">
                    <Link to="/training/plan">メンバーシップ登録</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <Tabs defaultValue="tasks" className="mt-8">
            <TabsList>
              <TabsTrigger value="tasks">タスク一覧</TabsTrigger>
              <TabsTrigger value="details">詳細情報</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks" className="mt-6">
              <TaskList tasks={processedTasks} trainingSlug={slug || ''} />
            </TabsContent>
            
            <TabsContent value="details" className="mt-6">
              <div className="prose max-w-none">
                <h3>トレーニングの目標</h3>
                <p>このトレーニングを通じて以下のスキルを習得できます：</p>
                <ul>
                  {trainingData.skills?.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  )) || (
                    <li>実践的なスキルの習得</li>
                  )}
                </ul>
                
                <h3>前提知識</h3>
                <p>このトレーニングには以下の知識が役立ちます：</p>
                <ul>
                  {trainingData.prerequisites?.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  )) || (
                    <li>基本的なデザインの知識</li>
                  )}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TrainingDetail;
