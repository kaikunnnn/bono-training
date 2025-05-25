
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getTrainings, getTrainingDetail } from '@/services/training';
import { loadAllTrainingMeta } from '@/lib/markdown-loader';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';

const TrainingDebug = () => {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [rawFiles, setRawFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDebugData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('=== Training Debug - データ読み込み開始 ===');
        
        // 1. サービス関数経由でトレーニング一覧を取得
        const serviceTrainings = await getTrainings();
        setTrainings(serviceTrainings);
        console.log('Service trainings:', serviceTrainings);
        
        // 2. 直接ファイルローダーからも取得
        const directFiles = await loadAllTrainingMeta();
        setRawFiles(directFiles);
        console.log('Direct files:', directFiles);
        
        console.log('=== Training Debug - データ読み込み完了 ===');
      } catch (err) {
        console.error('Debug data loading error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadDebugData();
  }, []);

  const handleTrainingDetail = async (slug: string) => {
    try {
      console.log(`=== Loading detail for ${slug} ===`);
      const detail = await getTrainingDetail(slug);
      setSelectedTraining(detail);
      console.log('Training detail:', detail);
    } catch (err) {
      console.error('Error loading training detail:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
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

  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Training Debug Console</h1>
          <Badge variant="outline">Phase-1 Testing</Badge>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* サービス経由で取得したトレーニング一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>Service Layer Trainings ({trainings.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trainings.map((training) => (
              <div key={training.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{training.title}</h3>
                    <p className="text-sm text-gray-600">Slug: {training.slug}</p>
                    <p className="text-sm text-gray-600">Type: {training.type}</p>
                    <div className="flex gap-1 mt-2">
                      {training.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleTrainingDetail(training.slug)}
                  >
                    詳細取得
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 直接ファイルから取得した生データ */}
        <Card>
          <CardHeader>
            <CardTitle>Raw File Data ({rawFiles.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rawFiles.map((file, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{file.frontmatter.title}</h3>
                <p className="text-sm text-gray-600">Path: {file.path}</p>
                <p className="text-sm text-gray-600">Slug: {file.slug}</p>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                  {JSON.stringify(file.frontmatter, null, 2)}
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 選択されたトレーニングの詳細 */}
        {selectedTraining && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle>Training Detail: {selectedTraining.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Basic Info</h4>
                  <p>Description: {selectedTraining.description}</p>
                  <p>Tasks: {selectedTraining.tasks?.length || 0}</p>
                  <p>Has Premium: {selectedTraining.has_premium_content ? 'Yes' : 'No'}</p>
                </div>
                
                {selectedTraining.tasks && selectedTraining.tasks.length > 0 && (
                  <div>
                    <h4 className="font-medium">Tasks</h4>
                    <div className="space-y-2">
                      {selectedTraining.tasks.map((task: any) => (
                        <div key={task.id} className="p-2 bg-gray-50 rounded">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm">Slug: {task.slug}</p>
                          <p className="text-sm">Premium: {task.is_premium ? 'Yes' : 'No'}</p>
                          <p className="text-sm">Order: {task.order_index}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* JSON Export */}
        <Card>
          <CardHeader>
            <CardTitle>JSON Export</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                const data = { trainings, rawFiles, selectedTraining };
                console.log('Debug JSON:', data);
                navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
              }}
            >
              Copy JSON to Clipboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </TrainingLayout>
  );
};

export default TrainingDebug;
