
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { Mail, Lock, LogIn, AlertCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 移行ユーザーかどうかをチェックする関数
async function checkMigratedUser(email: string): Promise<{ exists: boolean; isMigrated: boolean }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/check-migrated-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      console.error('Failed to check migrated user:', response.status);
      return { exists: false, isMigrated: false };
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking migrated user:', error);
    return { exists: false, isMigrated: false };
  }
}

const TrainingLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isMigratedUser, setIsMigratedUser] = useState(false);
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
    setIsMigratedUser(false);

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
          // ログイン失敗時、移行ユーザーかどうかをチェック
          const { exists, isMigrated } = await checkMigratedUser(email);

          if (exists && isMigrated) {
            // 移行ユーザーの場合は専用メッセージを表示
            setIsMigratedUser(true);
            setLoginError(null);
          } else {
            // 通常のエラーメッセージ
            setLoginError("メールアドレスまたはパスワードが正しくありません。");
          }
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
              {/* 移行ユーザー向け専用メッセージ */}
              {isMigratedUser && (
                <Alert className="border-amber-500 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">パスワードの再設定が必要です</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    <p className="mb-3">
                      システムの移行により、新しいパスワードを設定していただく必要があります。
                    </p>
                    <p className="mb-3 text-sm">
                      ご利用中のサブスクリプション情報はそのまま引き継がれますのでご安心ください。
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-amber-500 text-amber-700 hover:bg-amber-100"
                      onClick={() => navigate('/forgot-password')}
                    >
                      パスワードを再設定する
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* 通常のエラーメッセージ */}
              {loginError && !isMigratedUser && (
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
