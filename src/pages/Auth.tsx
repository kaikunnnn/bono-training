import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import { Mail, Lock, LogIn, AlertCircle, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RegistrationFlowGuide } from '@/components/auth/RegistrationFlowGuide';

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

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstTimeEmail, setFirstTimeEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [firstTimeError, setFirstTimeError] = useState<string | null>(null);
  const [firstTimeSuccess, setFirstTimeSuccess] = useState(false);
  const [isMigratedUser, setIsMigratedUser] = useState(false);
  const { signIn, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // リダイレクト元のパスがあれば取得
  const from = location.state?.from?.pathname || '/';
  
  // 既にログインしている場合はリダイレクト
  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  // 初めての方向け: パスワード設定メール送信
  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirstTimeError(null);
    setFirstTimeSuccess(false);

    if (!firstTimeEmail) {
      setFirstTimeError("メールアドレスを入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(firstTimeEmail);
      if (error) {
        setFirstTimeError("メールの送信に失敗しました。メールアドレスを確認してください。");
      } else {
        setFirstTimeSuccess(true);
        toast({
          title: "メール送信完了",
          description: "パスワード設定用のメールを送信しました。",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
        navigate(from, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-10">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login" className="text-xs sm:text-sm">通常ログイン</TabsTrigger>
            <TabsTrigger value="first-time" className="text-xs sm:text-sm">初めての方</TabsTrigger>
            <TabsTrigger value="signup" className="text-xs sm:text-sm">新規登録</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="font-noto-sans-jp">ログイン</CardTitle>
                <CardDescription className="font-noto-sans-jp">登録済みのアカウントでログインしてください</CardDescription>
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
          </TabsContent>

          {/* 初めての方タブ: bo-no.designで登録済み、初回ログイン */}
          <TabsContent value="first-time">
            <Card>
              <CardHeader>
                <CardTitle className="font-noto-sans-jp">初めての方</CardTitle>
                <CardDescription className="font-noto-sans-jp">
                  bo-no.designで会員登録済みの方は、こちらからパスワードを設定してください
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleFirstTimeSetup}>
                <CardContent className="space-y-4">
                  {firstTimeSuccess ? (
                    <Alert className="border-green-500 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800 font-noto-sans-jp">メール送信完了</AlertTitle>
                      <AlertDescription className="text-green-700 font-noto-sans-jp">
                        <p className="mb-2">
                          パスワード設定用のメールを送信しました。
                        </p>
                        <p className="text-sm">
                          メールに記載されたリンクからパスワードを設定してください。
                          設定完了後、「通常ログイン」タブからログインできます。
                        </p>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      {firstTimeError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="font-noto-sans-jp">{firstTimeError}</AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="first-time-email" className="font-noto-sans-jp">メールアドレス</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="first-time-email"
                            type="email"
                            placeholder="bo-no.designで登録したメールアドレス"
                            className="pl-10"
                            value={firstTimeEmail}
                            onChange={(e) => setFirstTimeEmail(e.target.value)}
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground font-noto-sans-jp">
                          bo-no.designで会員登録に使用したメールアドレスを入力してください
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
                {!firstTimeSuccess && (
                  <CardFooter>
                    <Button type="submit" className="w-full font-noto-sans-jp" disabled={isSubmitting}>
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? '送信中...' : 'パスワード設定メールを送信'}
                    </Button>
                  </CardFooter>
                )}
              </form>
            </Card>
          </TabsContent>

          {/* 新規登録タブ: bo-no.designへの案内 */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle className="font-noto-sans-jp">新規登録</CardTitle>
                <CardDescription className="font-noto-sans-jp">
                  会員登録はbo-no.designで行います
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegistrationFlowGuide variant="page" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Auth;
