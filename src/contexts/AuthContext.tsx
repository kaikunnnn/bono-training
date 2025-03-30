
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  updatePassword: (password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    // 初期セッションの取得
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // サインアップ関数
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('サインアップエラー:', error.message);
        toast({
          title: "サインアップに失敗しました",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      toast({
        title: "サインアップに成功しました",
        description: "確認メールを送信しました。メールのリンクをクリックして登録を完了してください。",
      });
      return { error: null, data };
    } catch (error: any) {
      console.error('サインアップエラー:', error.message);
      toast({
        title: "サインアップに失敗しました",
        description: error.message,
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  // サインイン関数
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('サインインエラー:', error.message);
        toast({
          title: "ログインに失敗しました",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      toast({
        title: "ログインに成功しました",
        description: "ようこそ！",
      });
      return { error: null, data };
    } catch (error: any) {
      console.error('サインインエラー:', error.message);
      toast({
        title: "ログインに失敗しました",
        description: error.message,
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  // サインアウト関数
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "ログアウトしました",
      });
    } catch (error: any) {
      console.error('サインアウトエラー:', error.message);
      toast({
        title: "ログアウトに失敗しました",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // パスワードリセット申請関数
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('パスワードリセットエラー:', error.message);
        toast({
          title: "パスワードリセットに失敗しました",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      toast({
        title: "パスワードリセットメールを送信しました",
        description: "メールに記載されたリンクからパスワードを再設定してください。",
      });
      return { error: null, data };
    } catch (error: any) {
      console.error('パスワードリセットエラー:', error.message);
      toast({
        title: "パスワードリセットに失敗しました",
        description: error.message,
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  // パスワード更新関数
  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error('パスワード更新エラー:', error.message);
        toast({
          title: "パスワード更新に失敗しました",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      toast({
        title: "パスワードを更新しました",
        description: "新しいパスワードでログインできます。",
      });
      return { error: null, data };
    } catch (error: any) {
      console.error('パスワード更新エラー:', error.message);
      toast({
        title: "パスワード更新に失敗しました",
        description: error.message,
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
