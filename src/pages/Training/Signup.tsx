
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import TrainingHeader from '@/components/training/TrainingHeader';
import { getPlanSession, clearPlanSession, PlanSessionData } from '@/utils/planSession';
import { useToast } from '@/hooks/use-toast';

const TrainingSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [planSession, setPlanSession] = useState<PlanSessionData | null>(null);
  
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ログイン済みユーザーは/trainingにリダイレクト
  useEffect(() => {
    if (user) {
      navigate('/training');
    }
  }, [user, navigate]);

  // プランセッション情報の取得
  useEffect(() => {
    const sessionData = getPlanSession();
    setPlanSession(sessionData);
    
    // セッション情報がない場合は/training/planにリダイレクト
    if (!sessionData) {
      toast({
        title: "プラン選択が必要です",
        description: "まずプランを選択してからアカウントを作成してください。",
        variant: "destructive",
      });
      navigate('/training/plan');
    }
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "パスワードが一致しません",
        description: "パスワードと確認用パスワードが一致していません。",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "パスワードが短すぎます",
        description: "パスワードは6文字以上で入力してください。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        setIsLoading(false);
        return;
      }

      // アカウント作成成功時の処理
      toast({
        title: "アカウント作成完了",
        description: "確認メールを送信しました。メール認証後にサービスをご利用いただけます。",
      });

      // プランセッション情報をクリア
      clearPlanSession();
      
      // トレーニングホームにリダイレクト
      navigate('/training');
      
    } catch (error) {
      console.error('サインアップエラー:', error);
      toast({
        title: "アカウント作成に失敗しました",
        description: "予期しないエラーが発生しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanDisplayName = (planType: string): string => {
    switch (planType) {
      case 'community':
        return 'コミュニティプラン';
      case 'standard':
        return 'スタンダードプラン';
      case 'growth':
        return 'グロースプラン';
      default:
        return planType;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <TrainingHeader />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold font-['Rounded_Mplus_1c']">
              BONOトレーニングをはじめる
            </h1>
            <p className="text-sm text-gray-600 font-['Rounded_Mplus_1c']">
              BONOトレーニングの全コンテンツにアクセスして、<br />
              効率的にデザインスキルを身につけましょう。
            </p>
          </div>

          {/* プラン選択情報表示 */}
          {planSession && (
            <Card className="border-2 border-[#0D221D]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-['Rounded_Mplus_1c']">
                  選択中のプラン
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-['Rounded_Mplus_1c'] text-sm">
                      {getPlanDisplayName(planSession.planType)}
                    </span>
                    <span className="font-bold text-lg">
                      {planSession.price}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {planSession.duration}ヶ月プラン
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="text-xs text-gray-600">
                  <Link 
                    to="/training/plan" 
                    className="text-[#0D221D] hover:underline"
                  >
                    プランを変更する
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-[#0D221D]">
            <CardHeader>
              <CardTitle className="font-['Rounded_Mplus_1c']">アカウント作成</CardTitle>
              <CardDescription className="font-['Rounded_Mplus_1c']">
                メールアドレスとパスワードを入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-['Rounded_Mplus_1c']">
                    メールアドレス
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="font-['Rounded_Mplus_1c']"
                    placeholder="your@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-['Rounded_Mplus_1c']">
                    パスワード
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="font-['Rounded_Mplus_1c']"
                    placeholder="6文字以上"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="font-['Rounded_Mplus_1c']">
                    パスワード（確認）
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="font-['Rounded_Mplus_1c']"
                    placeholder="パスワードを再入力"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#0D221D] hover:bg-[#0D221D]/90 font-['Rounded_Mplus_1c']"
                  disabled={isLoading}
                >
                  {isLoading ? 'アカウント作成中...' : 'アカウントを作成'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm font-['Rounded_Mplus_1c']">
            すでにアカウントをお持ちですか？{' '}
            <Link 
              to="/training/login" 
              className="text-[#0D221D] hover:underline font-medium"
            >
              ログイン
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingSignup;
