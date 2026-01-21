
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  signUpService, 
  signInService, 
  signOutService, 
  resetPasswordService, 
  updatePasswordService 
} from '@/services/auth';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // メール確認後のトースト表示用フラグ（重複表示防止）
    let hasShownEmailConfirmationToast = false;

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        // メール確認・変更後のトースト表示
        const hash = window.location.hash;

        // メールアドレス確認完了（新規登録）
        if (event === 'SIGNED_IN' && hash.includes('type=signup') && !hasShownEmailConfirmationToast) {
          hasShownEmailConfirmationToast = true;
          toast({
            title: "メールアドレスが確認されました",
            description: "アカウントの登録が完了しました。",
          });
          // URLハッシュをクリア
          window.history.replaceState(null, '', window.location.pathname);
        }

        // メールアドレス変更完了
        if (event === 'USER_UPDATED' && hash.includes('type=email_change') && !hasShownEmailConfirmationToast) {
          hasShownEmailConfirmationToast = true;
          toast({
            title: "メールアドレスが変更されました",
            description: "新しいメールアドレスが確認されました。",
          });
          // URLハッシュをクリア
          window.history.replaceState(null, '', window.location.pathname);
        }
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

  // サービス関数をコンテキストの関数にマッピング
  const signUp = (email: string, password: string) => {
    return signUpService(email, password, toast);
  };

  const signIn = (email: string, password: string) => {
    return signInService(email, password, toast);
  };

  const signOut = () => {
    return signOutService(toast);
  };

  const resetPassword = (email: string) => {
    return resetPasswordService(email, toast);
  };

  const updatePassword = (password: string) => {
    return updatePasswordService(password, toast);
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
