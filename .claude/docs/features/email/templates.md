# BONOメールテンプレート

**作成日**: 2025-01-20
**ステータス**: 設計中

---

## デザインコンセプト

### ブランドカラー

| 用途 | カラーコード | 説明 |
|-----|------------|------|
| 背景 | `#EAEAEA` | グレー（メール全体の背景） |
| カード背景 | `#FFFFFF` | 白（コンテンツエリア） |
| プライマリ | `#151834` | ダークネイビー（ロゴ、ボタン） |
| テキスト | `#151834` | ダークネイビー（メイン） |
| サブテキスト | `#6B7280` | グレー |
| ボタンテキスト | `#FFFFFF` | 白 |

### フォント

メールではWebフォントが使えないため、システムフォントを使用：
```
font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
```

### デザイン原則

1. **シンプル** - 必要な情報のみ
2. **温かみ** - BONOらしい親しみやすさ
3. **読みやすさ** - 大きめのフォント、余白
4. **一貫性** - 全メールで統一されたレイアウト

---

## ベーステンプレート（HTML）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ .Subject }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F7; font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9F9F7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

          <!-- ヘッダー -->
          <tr>
            <td style="background-color: #FFF9F4; padding: 32px 40px; text-align: center;">
              <span style="font-size: 28px; font-weight: 700; color: #FF9900; letter-spacing: 2px;">BONO</span>
            </td>
          </tr>

          <!-- メインコンテンツ -->
          <tr>
            <td style="padding: 40px;">
              <!-- タイトル -->
              <h1 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 700; color: #020817; line-height: 1.5;">
                {{ .Title }}
              </h1>

              <!-- 本文 -->
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #374151; line-height: 1.8;">
                {{ .Body }}
              </p>

              <!-- ボタン（必要な場合） -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ActionURL }}" style="display: inline-block; padding: 14px 32px; background-color: #FF9900; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      {{ .ActionText }}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- 補足テキスト -->
              <p style="margin: 24px 0 0 0; font-size: 13px; color: #6B7280; line-height: 1.7;">
                {{ .Note }}
              </p>
            </td>
          </tr>

          <!-- フッター -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #F3F4F6; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 1.6;">
                このメールは BONO から自動送信されています。<br>
                ご不明な点がございましたら、サポートまでお問い合わせください。
              </p>
              <p style="margin: 16px 0 0 0; font-size: 12px; color: #9CA3AF;">
                &copy; BONO
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 各メール種別のコンテンツ

### 1. パスワードリセット

**件名**: パスワードリセットのご案内

**タイトル**: パスワードをリセット

**本文**:
```
パスワードリセットのリクエストを受け付けました。

以下のボタンをクリックして、新しいパスワードを設定してください。
```

**ボタン**: パスワードを再設定する

**補足**:
```
このリンクは24時間有効です。
リクエストに心当たりがない場合は、このメールを無視してください。
```

---

### 2. メールアドレス確認（新規登録）

**件名**: メールアドレスの確認

**タイトル**: BONOへようこそ！

**本文**:
```
BONOにご登録いただきありがとうございます。

以下のボタンをクリックして、メールアドレスの確認を完了してください。
```

**ボタン**: メールアドレスを確認する

**補足**:
```
このリンクは24時間有効です。
```

---

### 3. メールアドレス変更確認

**件名**: メールアドレス変更の確認

**タイトル**: メールアドレスを変更

**本文**:
```
メールアドレスの変更リクエストを受け付けました。

以下のボタンをクリックして、新しいメールアドレスを確認してください。
```

**ボタン**: 変更を確認する

**補足**:
```
リクエストに心当たりがない場合は、このメールを無視してください。
```

---

## Supabaseテンプレート設定用

Supabaseの Email Templates に設定するHTML:

### パスワードリセット用

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F7; font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9F9F7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color: #FFF9F4; padding: 32px 40px; text-align: center;">
              <span style="font-size: 28px; font-weight: 700; color: #FF9900; letter-spacing: 2px;">BONO</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 700; color: #020817; line-height: 1.5;">
                パスワードをリセット
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #374151; line-height: 1.8;">
                パスワードリセットのリクエストを受け付けました。<br><br>
                以下のボタンをクリックして、新しいパスワードを設定してください。
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background-color: #FF9900; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      パスワードを再設定する
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; font-size: 13px; color: #6B7280; line-height: 1.7;">
                このリンクは24時間有効です。<br>
                リクエストに心当たりがない場合は、このメールを無視してください。
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #F3F4F6; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 1.6;">
                このメールは BONO から自動送信されています。
              </p>
              <p style="margin: 16px 0 0 0; font-size: 12px; color: #9CA3AF;">
                &copy; BONO
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## プレビュー確認方法

1. 上記HTMLをローカルファイルとして保存
2. ブラウザで開いてデザイン確認
3. 問題なければSupabaseに設定

---

## 参考

- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Email Client CSS Support](https://www.caniemail.com/)
