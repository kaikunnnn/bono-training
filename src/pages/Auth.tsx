
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import { Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { signUp, signIn, user } = useAuth();
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    
    if (!email || !password) {
      setSignupError("メールアドレスとパスワードを入力してください");
      return;
    }

    if (password.length < 6) {
      setSignupError("パスワードは6文字以上で設定してください");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(`サインアップ試行: ${email}`);
      const { error } = await signUp(email, password);
      if (error) {
        // エラーの内容に基づいてエラーメッセージを設定
        if (error.message.includes('already registered') || 
            error.message.includes('already taken') ||
            error.message.includes('User already registered')) {
          setSignupError("このメールアドレスはすでに登録されています。ログインしてください。");
        } else {
          setSignupError(error.message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">ログイン</TabsTrigger>
            <TabsTrigger value="signup">新規登録</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
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
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>新規登録</CardTitle>
                <CardDescription>新しいアカウントを作成してください</CardDescription>
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
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      パスワードは6文字以上で設定してください
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isSubmitting ? '登録中...' : 'アカウント作成'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Auth;
