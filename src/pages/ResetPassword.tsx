
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const { updatePassword, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ユーザーがリセットリンクからアクセスしたかを確認
  useEffect(() => {
    // Auth初期化前（URLからのセッション復元含む）は判定を待つ
    if (loading) return;

    // Supabaseの「implicit（#access_token...）」/「PKCE（?code=...）」どちらにも対応
    const hash = window.location.hash ?? '';
    const params = new URLSearchParams(window.location.search);
    const hasAccessTokenInHash = hash.includes('access_token=');
    const hasCodeInQuery = params.has('code');
    const isFromResetLink = hasAccessTokenInHash || hasCodeInQuery;

    if (!isFromResetLink && !user) {
      // リセットリンク経由でなく、ログインもしていない場合はログインページにリダイレクト
      toast({
        title: "アクセスエラー",
        description: "パスワードリセットのリンクが無効です。再度リセットをリクエストしてください。",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [loading, navigate, toast, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "パスワードが一致しません",
        description: "パスワードと確認用パスワードが一致しません。",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "パスワードが短すぎます",
        description: "パスワードは6文字以上で設定してください。",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await updatePassword(password);
      if (!error) {
        setIsResetSuccess(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>新しいパスワード設定</CardTitle>
            <CardDescription>
              {isResetSuccess 
                ? "パスワードを更新しました。新しいパスワードでログインできます。"
                : "新しいパスワードを設定してください。"
              }
            </CardDescription>
          </CardHeader>
          {!isResetSuccess ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">新しいパスワード</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
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
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">パスワード（確認）</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'パスワード更新中...' : 'パスワードを更新'}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate('/login')}>
                ログインページに移動
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPassword;
