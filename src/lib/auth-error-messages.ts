// src/lib/auth-error-messages.ts
// Supabase Auth エラーメッセージの日本語翻訳マップ
//
// Supabase Auth が返す英語エラーメッセージを日本語に変換する。
// Client/Server どちらからも import 可能（純粋関数のみ）。

/** Supabase Auth の英語エラーメッセージ → 日本語メッセージのマッピング */
const AUTH_ERROR_MAP: Record<string, string> = {
  // パスワード関連
  "Password should be at least 6 characters":
    "パスワードは6文字以上にしてください",
  "Password should be at least 8 characters":
    "パスワードは8文字以上にしてください",
  "Password should be at least":
    "パスワードの文字数が不足しています",
  "New password should be different from the old password":
    "新しいパスワードは現在のパスワードと異なるものにしてください",
  "New password should be different":
    "新しいパスワードは現在のパスワードと異なるものにしてください",
  "Password is too weak":
    "パスワードが弱すぎます。より複雑なパスワードを設定してください",

  // ログイン関連
  "Invalid login credentials":
    "メールアドレスまたはパスワードが正しくありません",
  "Email not confirmed":
    "メールアドレスの確認が完了していません。確認メールをご確認ください",
  "Invalid email or password":
    "メールアドレスまたはパスワードが正しくありません",

  // ユーザー登録関連
  "User already registered":
    "このメールアドレスは既に登録されています",
  "A user with this email address has already been registered":
    "このメールアドレスは既に登録されています",
  "Signup requires a valid password":
    "有効なパスワードを入力してください",

  // レート制限
  "For security purposes, you can only request this after 60 seconds":
    "セキュリティのため、60秒後に再度お試しください",
  "Email rate limit exceeded":
    "メール送信の制限に達しました。しばらく経ってから再度お試しください",
  "Rate limit exceeded":
    "リクエスト回数の制限に達しました。しばらく経ってから再度お試しください",

  // セッション関連
  "Auth session missing!":
    "ログインセッションが見つかりません。再度ログインしてください",
  "Session expired":
    "セッションが期限切れです。再度ログインしてください",
  "Token expired":
    "セッションが期限切れです。再度ログインしてください",

  // その他
  "Unable to validate email address: invalid format":
    "メールアドレスの形式が正しくありません",
  "Email address is invalid":
    "メールアドレスの形式が正しくありません",
};

/**
 * Supabase Auth のエラーメッセージを日本語に翻訳する。
 * 完全一致を先に試し、次に部分一致で検索する。
 * マッチしない場合は元のメッセージをそのまま返す。
 */
export function translateAuthError(message: string): string {
  // 完全一致
  if (AUTH_ERROR_MAP[message]) {
    return AUTH_ERROR_MAP[message];
  }

  // 部分一致（英語メッセージが含まれている場合）
  for (const [key, value] of Object.entries(AUTH_ERROR_MAP)) {
    if (message.includes(key)) {
      return value;
    }
  }

  // マッチしない場合は元のメッセージを返す
  return message;
}
