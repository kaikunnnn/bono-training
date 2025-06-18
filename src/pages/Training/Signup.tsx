
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { getPlanSession, clearPlanSession, PlanSessionData } from '@/utils/planSession';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/services/stripe';
import { Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TrainingSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
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

  // プランセッション情報の取得（必須ではない）
  useEffect(() => {
    const sessionData = getPlanSession();
    setPlanSession(sessionData);
  }, []);

  // 既にログインしている場合はトレーニングホームにリダイレクト
  if (user) {
    navigate('/training', { replace: true });
    return null;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    
    if (!email || !password) {
      setSignupError("メールアドレスとパスワードを入力してください");
      return;
    }

    if (password.length < 6) {
      setSignupError("パスワードは6文字以上で入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(`サインアップ試行: ${email}`);
      const { error } = await signUp(email, password);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setSignupError("このメールアドレスは既に登録されています。ログインしてください。");
        } else {
          setSignupError(error.message);
        }
        return;
      }

      // アカウント作成成功時の処理
      toast({
        title: "アカウント作成完了",
        description: "確認メールを送信しました。メール認証後にサービスをご利用いただけます。",
      });

      // プランセッション情報がある場合は決済フローへ
      if (planSession) {
        try {
          const checkoutResult = await createCheckoutSession(
            '/training',
            planSession.planType,
            planSession.duration
          );

          if (checkoutResult.error) {
            console.error('決済セッション作成エラー:', checkoutResult.error);
            toast({
              title: "決済処理でエラーが発生しました",
              description: "アカウントは作成されました。後ほどプランページから購読してください。",
              variant: "destructive",
            });
          } else if (checkoutResult.url) {
            // 決済URLを新しいタブで開く
            window.open(checkoutResult.url, '_blank');
            toast({
              title: "決済ページを開きました",
              description: "新しいタブで決済を完了してください。",
            });
          }

          // プランセッション情報をクリア
          clearPlanSession();
        } catch (error) {
          console.error('決済処理エラー:', error);
          toast({
            title: "決済処理でエラーが発生しました",
            description: "アカウントは作成されました。後ほどプランページから購読してください。",
            variant: "destructive",
          });
        }
      } else {
        // プラン情報がない場合の案内
        toast({
          title: "アカウント作成が完了しました",
          description: "プランを選択して学習を開始してください。",
        });
      }

      // トレーニングホームにリダイレクト
      navigate('/training');
      
    } catch (error) {
      console.error('サインアップエラー:', error);
      setSignupError("予期しないエラーが発生しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
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
    <TrainingLayout>
      <TrainingHeader />
      <div className="container max-w-md mx-auto py-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">BONOトレーニングをはじめる</h1>
          <p className="text-gray-600">アカウントを作成して、デザインスキルを学習しましょう</p>
        </div>

        {/* プラン選択情報表示（プランが選択されている場合のみ） */}
        {planSession && (
          <Card className="border-2 border-[#374151] mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">選択中のプラン</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">
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
                  className="text-blue-600 hover:underline"
                >
                  プランを変更する
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="border-2 border-[#374151]">
          <CardHeader>
            <CardTitle>アカウント作成</CardTitle>
            <CardDescription>メールアドレスとパスワードを入力してください</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              {signupError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{signupError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="signup-email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">パスワード</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="6文字以上"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isSubmitting ? 'アカウント作成中...' : 'アカウントを作成'}
              </Button>
            </CardContent>
          </form>
        </Card>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちですか？{' '}
            <Link 
              to="/training/login" 
              className="text-blue-600 hover:underline font-medium"
            >
              ログイン
            </Link>
          </p>
          <Link to="/training" className="text-sm text-gray-600 hover:underline block">
            トレーニングホームに戻る
          </Link>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TrainingSignup;
