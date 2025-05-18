
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  uploadContentFile, 
  uploadTrainingMeta, 
  listAllTrainings,
  listTrainingContents, 
  deleteContentFile,
  getFileContent
} from '@/utils/contentManager';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  FileText, 
  FolderOpen, 
  Upload, 
  Trash2, 
  RefreshCw,
  PlusCircle,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContentManagementState, ContentUploadResult } from '@/types/training';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * コンテンツ管理画面
 */
const ContentManager: React.FC = () => {
  const { user } = useAuth();
  const { planMembers } = useSubscriptionContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [state, setState] = useState<ContentManagementState>({
    currentTraining: null,
    currentTask: null,
    isUploading: false,
    uploadResult: null,
    availableTrainings: [],
    trainingContents: []
  });

  const [newTrainingSlug, setNewTrainingSlug] = useState('');
  const [newTaskSlug, setNewTaskSlug] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overwriteMode, setOverwriteMode] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 管理者権限の確認
  const isAdmin = user && planMembers;

  // コンポーネントマウント時に全トレーニング一覧を取得
  useEffect(() => {
    if (isAdmin) {
      fetchAllTrainings();
    }
  }, [isAdmin]);

  // トレーニング一覧の取得
  const fetchAllTrainings = async () => {
    setIsLoading(true);
    try {
      const result = await listAllTrainings();
      if (result.success && result.trainings) {
        setState(prev => ({
          ...prev,
          availableTrainings: result.trainings
        }));
      } else {
        toast({
          title: "エラー",
          description: result.error || "トレーニング一覧の取得に失敗しました",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('トレーニング一覧取得エラー:', error);
      toast({
        title: "エラー",
        description: "トレーニング一覧の取得中にエラーが発生しました",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // トレーニング選択時の処理
  const handleSelectTraining = async (trainingSlug: string) => {
    if (!trainingSlug) return;
    
    setIsLoading(true);
    try {
      const result = await listTrainingContents(trainingSlug);
      if (result.success && result.files) {
        setState(prev => ({
          ...prev,
          currentTraining: trainingSlug,
          currentTask: null,
          trainingContents: result.files
        }));
      } else {
        toast({
          title: "エラー",
          description: result.error || "トレーニング内容の取得に失敗しました",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('トレーニング内容取得エラー:', error);
      toast({
        title: "エラー",
        description: "トレーニング内容の取得中にエラーが発生しました",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ファイル選択時の処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  // コンテンツアップロードの処理
  const handleUploadContent = async () => {
    if (!state.currentTraining || !newTaskSlug || !selectedFile) {
      toast({
        title: "入力エラー",
        description: "トレーニング、タスク、ファイルをすべて指定してください",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isUploading: true, uploadResult: null }));

    try {
      const result = await uploadContentFile(
        state.currentTraining,
        newTaskSlug,
        selectedFile,
        overwriteMode
      );

      setState(prev => ({ ...prev, uploadResult: result }));

      if (result.success) {
        toast({
          title: "アップロード成功",
          description: `${result.path} にファイルがアップロードされました`,
          variant: "default"
        });
        
        // リストを更新
        await handleSelectTraining(state.currentTraining);
        setSelectedFile(null);
        setNewTaskSlug('');
        
        // ファイル入力をリセット
        const fileInput = document.getElementById('content-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast({
          title: "アップロードエラー",
          description: result.error || "ファイルのアップロードに失敗しました",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      toast({
        title: "エラー",
        description: "アップロード処理中にエラーが発生しました",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isUploading: false }));
    }
  };

  // メタデータアップロードの処理
  const handleUploadMeta = async () => {
    if (!state.currentTraining || !selectedFile) {
      toast({
        title: "入力エラー",
        description: "トレーニングとファイルを指定してください",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isUploading: true, uploadResult: null }));

    try {
      const result = await uploadTrainingMeta(
        state.currentTraining,
        selectedFile,
        overwriteMode
      );

      setState(prev => ({ ...prev, uploadResult: result }));

      if (result.success) {
        toast({
          title: "アップロード成功",
          description: `${result.path} にメタデータがアップロードされました`,
          variant: "default"
        });
        
        // リストを更新
        await handleSelectTraining(state.currentTraining);
        setSelectedFile(null);
        
        // ファイル入力をリセット
        const fileInput = document.getElementById('meta-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast({
          title: "アップロードエラー",
          description: result.error || "メタデータのアップロードに失敗しました",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('メタデータアップロードエラー:', error);
      toast({
        title: "エラー",
        description: "メタデータのアップロード処理中にエラーが発生しました",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isUploading: false }));
    }
  };

  // 新しいトレーニングの作成処理
  const handleCreateTraining = async () => {
    if (!newTrainingSlug) {
      toast({
        title: "入力エラー",
        description: "トレーニングのスラッグを指定してください",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isUploading: true }));

    try {
      // 空のメタデータファイルを作成
      const emptyMeta = new Blob([
        '---\n' +
        `title: "${newTrainingSlug}"\n` +
        'description: "新しいトレーニング"\n' +
        'type: "challenge"\n' +
        'difficulty: "normal"\n' +
        'tags: ["new"]\n' +
        '---\n\n' +
        `# ${newTrainingSlug}\n\n` +
        'このトレーニングの説明を入力してください。'
      ], { type: 'text/markdown' });
      
      const metaFile = new File([emptyMeta], 'meta.md', { type: 'text/markdown' });
      
      const result = await uploadTrainingMeta(newTrainingSlug, metaFile, false);

      if (result.success) {
        toast({
          title: "トレーニング作成",
          description: `${newTrainingSlug} トレーニングが作成されました`,
          variant: "default"
        });
        
        // リストを更新
        await fetchAllTrainings();
        setNewTrainingSlug('');
        
        // 新しく作成したトレーニングを選択
        await handleSelectTraining(newTrainingSlug);
      } else {
        toast({
          title: "トレーニング作成エラー",
          description: result.error || "トレーニングの作成に失敗しました",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('トレーニング作成エラー:', error);
      toast({
        title: "エラー",
        description: "トレーニングの作成中にエラーが発生しました",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isUploading: false }));
    }
  };

  // ファイル削除の処理
  const handleDeleteFile = async (path: string) => {
    if (!window.confirm('このファイルを削除してもよろしいですか？')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteContentFile(path);
      
      if (result.success) {
        toast({
          title: "削除成功",
          description: `${path} が削除されました`,
          variant: "default"
        });
        
        // 現在のトレーニングの内容を更新
        if (state.currentTraining) {
          await handleSelectTraining(state.currentTraining);
        }
      } else {
        toast({
          title: "削除エラー",
          description: result.error || "ファイルの削除に失敗しました",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('ファイル削除エラー:', error);
      toast({
        title: "エラー",
        description: "ファイル削除中にエラーが発生しました",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ファイル内容の表示
  const handleViewFile = async (path: string) => {
    setIsLoading(true);
    try {
      const result = await getFileContent(path);
      
      if (result.success && result.content) {
        setFileContent(result.content);
      } else {
        toast({
          title: "ファイル取得エラー",
          description: result.error || "ファイルの内容取得に失敗しました",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('ファイル内容取得エラー:', error);
      toast({
        title: "エラー",
        description: "ファイル内容の取得中にエラーが発生しました",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 管理者でない場合は権限エラーを表示
  if (!isAdmin) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>権限エラー</AlertTitle>
            <AlertDescription>
              このページにアクセスする権限がありません。メンバーシップにアップグレードしてください。
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/training')}>トレーニングページに戻る</Button>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">コンテンツ管理</h1>
        
        <Tabs defaultValue="browse">
          <TabsList className="mb-4">
            <TabsTrigger value="browse">ブラウズ</TabsTrigger>
            <TabsTrigger value="upload">アップロード</TabsTrigger>
            <TabsTrigger value="create">新規作成</TabsTrigger>
          </TabsList>
          
          {/* ブラウズタブ */}
          <TabsContent value="browse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* トレーニング一覧 */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>トレーニング一覧</span>
                    <Button variant="outline" size="icon" onClick={fetchAllTrainings}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {state.availableTrainings.map((training) => (
                        <Button
                          key={training.slug}
                          variant={state.currentTraining === training.slug ? "default" : "outline"}
                          onClick={() => handleSelectTraining(training.slug)}
                          className="w-full justify-start"
                        >
                          <FolderOpen className="mr-2 h-4 w-4" />
                          {training.slug}
                        </Button>
                      ))}
                      {state.availableTrainings.length === 0 && (
                        <p className="text-sm text-muted-foreground py-2">
                          トレーニングがありません
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* ファイル一覧 */}
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {state.currentTraining ? `${state.currentTraining} のファイル` : 'トレーニングを選択してください'}
                  </CardTitle>
                  {state.currentTraining && (
                    <CardDescription>
                      コンテンツファイルとディレクトリ一覧
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      {!state.currentTraining ? (
                        <p className="text-muted-foreground">
                          左側のリストからトレーニングを選択してください
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {state.trainingContents.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">
                              ファイルがありません
                            </p>
                          ) : (
                            state.trainingContents.map((item) => (
                              <div
                                key={item.path}
                                className="p-3 border rounded-md flex justify-between items-center"
                              >
                                <div className="flex items-center">
                                  {item.isDirectory ? (
                                    <FolderOpen className="mr-2 h-4 w-4 text-amber-500" />
                                  ) : (
                                    <FileText className="mr-2 h-4 w-4 text-blue-500" />
                                  )}
                                  <span>{item.name}</span>
                                </div>
                                <div className="space-x-2">
                                  {!item.isDirectory && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewFile(item.path)}
                                    >
                                      表示
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteFile(item.path)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              
              {/* ファイル内容表示 */}
              {fileContent && (
                <Card className="col-span-1 md:col-span-3">
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>ファイル内容</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setFileContent(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
                      <pre className="whitespace-pre-wrap text-sm">{fileContent}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* アップロードタブ */}
          <TabsContent value="upload">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* コンテンツファイルアップロード */}
              <Card>
                <CardHeader>
                  <CardTitle>コンテンツアップロード</CardTitle>
                  <CardDescription>
                    タスクのコンテンツファイルをアップロード
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="training-select" className="text-sm font-medium">
                        トレーニング選択
                      </label>
                      <select
                        id="training-select"
                        className="w-full border p-2 rounded-md"
                        value={state.currentTraining || ''}
                        onChange={(e) => handleSelectTraining(e.target.value)}
                      >
                        <option value="">-- トレーニングを選択 --</option>
                        {state.availableTrainings.map((training) => (
                          <option key={training.slug} value={training.slug}>
                            {training.slug}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="task-slug" className="text-sm font-medium">
                        タスクスラッグ
                      </label>
                      <Input
                        id="task-slug"
                        value={newTaskSlug}
                        onChange={(e) => setNewTaskSlug(e.target.value)}
                        placeholder="タスクのスラッグを入力"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="content-file" className="text-sm font-medium">
                        MDファイル選択
                      </label>
                      <Input
                        id="content-file"
                        type="file"
                        accept=".md,.mdx,.txt"
                        onChange={handleFileChange}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="overwrite"
                        checked={overwriteMode}
                        onChange={(e) => setOverwriteMode(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="overwrite" className="text-sm">
                        既存ファイルを上書き
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={handleUploadContent}
                    disabled={!state.currentTraining || !newTaskSlug || !selectedFile || state.isUploading}
                  >
                    {state.isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        アップロード中...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        アップロード
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* メタデータアップロード */}
              <Card>
                <CardHeader>
                  <CardTitle>メタデータアップロード</CardTitle>
                  <CardDescription>
                    トレーニングのメタデータファイルをアップロード
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="meta-training-select" className="text-sm font-medium">
                        トレーニング選択
                      </label>
                      <select
                        id="meta-training-select"
                        className="w-full border p-2 rounded-md"
                        value={state.currentTraining || ''}
                        onChange={(e) => setState(prev => ({ ...prev, currentTraining: e.target.value }))}
                      >
                        <option value="">-- トレーニングを選択 --</option>
                        {state.availableTrainings.map((training) => (
                          <option key={training.slug} value={training.slug}>
                            {training.slug}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="meta-file" className="text-sm font-medium">
                        メタデータファイル選択
                      </label>
                      <Input
                        id="meta-file"
                        type="file"
                        accept=".md,.mdx,.txt"
                        onChange={handleFileChange}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="meta-overwrite"
                        checked={overwriteMode}
                        onChange={(e) => setOverwriteMode(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="meta-overwrite" className="text-sm">
                        既存メタデータを上書き
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={handleUploadMeta}
                    disabled={!state.currentTraining || !selectedFile || state.isUploading}
                  >
                    {state.isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        アップロード中...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        メタデータアップロード
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* アップロード結果表示 */}
              {state.uploadResult && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {state.uploadResult.success ? (
                        <>
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          アップロード成功
                        </>
                      ) : (
                        <>
                          <X className="h-5 w-5 text-red-500 mr-2" />
                          アップロードエラー
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="text-sm mb-2">
                        <span className="font-medium">パス:</span> {state.uploadResult.path}
                      </p>
                      {state.uploadResult.error && (
                        <p className="text-sm text-red-500">
                          <span className="font-medium">エラー:</span> {state.uploadResult.error}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* 新規作成タブ */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>新しいトレーニングを作成</CardTitle>
                <CardDescription>
                  新しいトレーニングを作成し、メタデータファイルを自動生成します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="new-training-slug" className="text-sm font-medium">
                      新しいトレーニングのスラッグ
                    </label>
                    <Input
                      id="new-training-slug"
                      value={newTrainingSlug}
                      onChange={(e) => setNewTrainingSlug(e.target.value)}
                      placeholder="英数字とハイフンのみ使用可能"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleCreateTraining}
                  disabled={!newTrainingSlug || state.isUploading}
                >
                  {state.isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      作成中...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      新しいトレーニングを作成
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TrainingLayout>
  );
};

export default ContentManager;
