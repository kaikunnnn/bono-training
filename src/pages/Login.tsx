import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { TabGroup } from '@/components/ui/tab-group';
import Layout from '@/components/layout/Layout';
import { Mail, Lock, LogIn, AlertCircle, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

type TabId = 'login' | 'first-time';

const Login = () => {
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    return tab === 'first-time' ? 'first-time' : 'login';
  });
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
  const { toast } = useToast();

  // URLクエリで「はじめての方」タブを指定できるようにする
  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab === 'first-time') {
      setActiveTab('first-time');
    }
  }, [location.search]);

  // リダイレクト元のパスがあれば取得
  const from = location.state?.from?.pathname || '/';

  // 既にログインしている場合はリダイレクト
  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  // はじめての方向け: パスワード設定メール送信
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
      // まずユーザーが存在するかチェック
      const { exists } = await checkMigratedUser(firstTimeEmail);

      if (!exists) {
        setFirstTimeError("このメールアドレスは登録されていません。BONO本サイトでメンバーシップ登録を行ってください。");
        setIsSubmitting(false);
        return;
      }

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
        {/* ページタイトル */}
        <h1 className="text-2xl font-bold mb-6 font-noto-sans-jp">
          ログイン
        </h1>

        <TabGroup
          tabs={[
            { id: 'login', label: '設定済み' },
            { id: 'first-time', label: 'はじめての方' },
          ]}
          activeTabId={activeTab}
          onTabChange={(id) => setActiveTab(id as TabId)}
        />

        {/* 設定済みタブ */}
        {activeTab === 'login' && (
          <Card className="mt-4 rounded-3xl">
              <form onSubmit={handleSignIn}>
                <CardContent className="pt-6 space-y-4">
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
                  <Button type="submit" size="large" className="w-full" disabled={isSubmitting}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'ログイン中...' : 'ログイン'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
        )}

        {/* はじめての方タブ: BONO本サイトでメンバーシップ登録済みの方 */}
        {activeTab === 'first-time' && (
          <Card className="mt-4 rounded-3xl">
              <form onSubmit={handleFirstTimeSetup}>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-sm text-muted-foreground font-noto-sans-jp">
                    BONO本サイトでメンバーシップ登録済みの方は、パスワードを設定してログインしましょう
                  </p>
                  {firstTimeSuccess ? (
                    <div className="space-y-4">
                      <Alert className="border-green-500 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800 font-noto-sans-jp">メールを送信しました</AlertTitle>
                      </Alert>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground font-noto-sans-jp">
                          メールに記載されたリンクからパスワードを設定してください。
                          設定完了後、「設定済み」タブからログインできます。
                        </p>
                      </div>
                    </div>
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
                            placeholder="BONO本サイトで登録したメールアドレス"
                            className="pl-10"
                            value={firstTimeEmail}
                            onChange={(e) => setFirstTimeEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                {!firstTimeSuccess && (
                  <CardFooter>
                    <Button type="submit" size="large" className="w-full font-noto-sans-jp" disabled={isSubmitting}>
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? '送信中...' : 'パスワード設定メールを送信'}
                    </Button>
                  </CardFooter>
                )}
              </form>
            </Card>
        )}

        {/* 新規登録への導線 */}
        <p className="text-center mt-6 text-sm text-muted-foreground font-noto-sans-jp">
          アカウントをお持ちでない方は{' '}
          <Link to="/signup" className="text-primary hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default Login;
