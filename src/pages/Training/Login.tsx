
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TrainingLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // リダイレクト元のパスがあれば取得、なければトレーニングのホームへ
  const from = location.state?.from?.pathname || '/training';
  
  // 既にログインしている場合はトレーニングホームにリダイレクト
  if (user) {
    navigate('/training', { replace: true });
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!email || !password) {
      setLoginError("メールアドレスとパスワードを入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(`サインイン試行: ${email}`);
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setLoginError("メールアドレスまたはパスワードが正しくありません。");
        } else if (error.message.includes('Email not confirmed')) {
          setLoginError("メールアドレスの確認が完了していません。確認メールをご確認ください。");
        } else {
          setLoginError(error.message);
        }
      } else {
        // 認証成功時はトレーニングホームページにリダイレクト
        navigate('/training', { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container max-w-md mx-auto py-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">トレーニングにログイン</h1>
          <p className="text-gray-600">アカウントにログインして学習を続けましょう</p>
        </div>
        
        <Card className="border-2 border-[#374151]">
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
            <CardDescription>登録済みのアカウントでログインしてください</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="login-email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">パスワード</Label>
                  <Button 
                    variant="link" 
                    className="px-0 text-xs" 
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                  >
                    パスワードを忘れた方
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <LogIn className="mr-2 h-4 w-4" />
                {isSubmitting ? 'ログイン中...' : 'ログイン'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない方は{' '}
            <Link to="/training/signup" className="text-blue-600 hover:underline font-medium">
              新規登録
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

export default TrainingLogin;
