import { supabase } from '@/integrations/supabase/client';
import { toast as toastFunc } from '@/hooks/use-toast';

export interface AuthResponse {
  error: Error | null;
  data: any | null;
}

// トースト関数の型定義を修正
type ToastFunction = typeof toastFunc;

// サインアップ関数
export const signUpService = async (
  email: string, 
  password: string,
  toast: ToastFunction
): Promise<AuthResponse> => {
  try {
    // Supabaseの認証APIを使用してサインアップを実行
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // エラーがある場合
    if (error) {
      console.error('サインアップエラー:', error.message);
      
      // エラーメッセージに基づいて適切なメッセージを表示
      if (error.message.includes('User already registered') || 
          error.message.includes('already registered') || 
          error.message.includes('already taken') ||
          error.message.includes('user_repeated_signup')) {
        toast({
          title: "サインアップに失敗しました",
          description: "このメールアドレスはすでに登録されています。ログインしてください。",
          variant: "destructive",
        });
      } else {
        toast({
          title: "サインアップに失敗しました",
          description: error.message,
          variant: "destructive",
        });
      }
      return { error, data: null };
    }

    // サインアップ成功の場合でも、実際にはユーザーが既に存在する可能性がある
    // data.user.identities が空の配列の場合、既に登録されているメールアドレス
    if (data?.user && data.user.identities && data.user.identities.length === 0) {
      toast({
        title: "サインアップに失敗しました",
        description: "このメールアドレスはすでに登録されています。ログインしてください。",
        variant: "destructive",
      });
      return { error: new Error('User already registered'), data: null };
    }

    // メールアドレスが確認されていない場合
    if (data?.user && !data.user.email_confirmed_at) {
      toast({
        title: "サインアップに成功しました",
        description: "確認メールを送信しました。メールのリンクをクリックして登録を完了してください。",
      });
    } else {
      toast({
        title: "サインアップに成功しました",
        description: "ようこそ！",
      });
    }
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
export const signInService = async (
  email: string, 
  password: string, 
  toast: ToastFunction
): Promise<AuthResponse> => {
  try {
    // デバッグ情報
    console.log(`ログイン試行: ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('サインインエラー:', error.message);
      
      // エラーメッセージをより具体的に
      if (error.message.includes('Invalid login credentials')) {
        toast({
          title: "ログインに失敗しました",
          description: "メールアドレスまたはパスワードが正しくありません。",
          variant: "destructive",
        });
      } else if (error.message.includes('Email not confirmed')) {
        toast({
          title: "ログインに失敗しました",
          description: "メールアドレスの確認が完了していません。確認メールをご確認ください。",
          variant: "destructive",
        });
      } else {
        toast({
          title: "ログインに失敗しました",
          description: error.message,
          variant: "destructive",
        });
      }
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
export const signOutService = async (
  toast: ToastFunction
): Promise<void> => {
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
export const resetPasswordService = async (
  email: string, 
  toast: ToastFunction
): Promise<AuthResponse> => {
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
export const updatePasswordService = async (
  password: string, 
  toast: ToastFunction
): Promise<AuthResponse> => {
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
