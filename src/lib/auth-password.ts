// src/lib/auth-password.ts
// パスワードの最低文字数（純粋な定数・関数のみ。Client/Server どちらからも import 可）。
//
// Supabase Auth の設定（Authentication > Password の最低文字数）と必ず同じ値にする。
// 値を変えるときは「画面のこの定数を変えてデプロイ → Supabase の設定を変える」の順にする。
// 逆にすると、画面は通るのに Supabase で弾かれて登録できなくなる（#321）。

export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_MIN_LENGTH_LABEL = `${PASSWORD_MIN_LENGTH}文字以上`;

export const PASSWORD_TOO_SHORT_MESSAGE = `パスワードは${PASSWORD_MIN_LENGTH}文字以上で入力してください`;

export function isPasswordLongEnough(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}
