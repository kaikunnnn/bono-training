# 2025-01 オンボーディング改善

## 📋 タスク一覧

| # | タスク | 優先度 | ステータス |
|---|--------|--------|-----------|
| 1 | /authページ分割（ログイン/新規登録） | 高 | ✅ 完了 |
| 2 | 「はじめての方」タブ改善 | 高 | ✅ 完了 |
| 3 | ペイウォールモーダル改善 | 高 | ✅ 完了 |
| 4 | パスワードリセットメールのロゴ修正 | 中 | 📋 手動設定が必要 |
| 5 | 全ページのリンク先変更 | 中 | ✅ 完了 |
| 6 | UI統一（タブ・ボタン） | 中 | ✅ 完了 |
| 7 | 情報構造の整理 | 中 | ✅ 完了 |

---

## 1. /authページ分割

### 要件
- 現在の `/auth` を `/login` と `/signup` に分割
- 仕組みは同じ、デザインもほぼ同じ
- URL変更に伴い、全ページのリンク先を更新

### /login ページ
**タブ構成:**
- 通常ログイン
- はじめての方（BONO本サイトで登録済みの方）

※「通常ログイン」と「はじめての方」の文言バランスを調整

---

## 2. 「はじめての方」タブ改善

### 変更点

| 項目 | 現在 | 変更後 |
|------|------|--------|
| タブ名の説明 | 会員登録 | メンバーシップ登録済みの方 |
| メッセージ | パスワードを設定してください | パスワードを設定して、ログインしよう |
| フォーム下説明 | bo-no.designで会員登録に使用した... | **削除**（placeholderと重複） |

### 追加機能
- [ ] メールバリデーション: 存在しないメールアドレスの場合はエラーを返す

### メール送信完了画面
- 成功メッセージと説明を**別ブロック**に分ける
  - ブロック1: 「メールを送信しました」（成功）
  - ブロック2: 「メールに記載されたリンクからパスワードを設定してください。設定完了後、「通常ログイン」タブからログインできます。」

---

## 3. ペイウォールモーダル改善

### コンテンツ

**タイトル**
「本サイトでメンバーシップ登録をするとプレミアムコンテンツが閲覧できます。」

**説明文**
「このページはアルファ版のため、BONO本サイトでの登録が必要です」

**ステップ**
1. BONO本サイト（bo-no.design）でメンバーシップ登録
   - 決済もこちらで完了します
2. ログイン画面の「はじめての方へ」でパスワードを設定してログイン
3. すべてのコンテンツを楽しもう！

**ボタン**
- メイン: 「BONO本サイトでメンバーシップ登録する」
- サブ: 「アカウントをお持ちの方はログイン」リンク

### UI要件
- ステップ間に縦矢印を表示
- iconsax or fluent emoji でグラフィカルに
- `/dev/registration-flow` でパターン検討済み

---

## 4. パスワードリセットメールのロゴ修正

### 問題
- BONOロゴが表示されていない
- 原因: `data:image/svg+xml;base64,...` 形式の画像がGmailでブロックされる

### 解決方法
1. ✅ `public/images/bono-logo.svg` を作成済み
2. 📋 デプロイ後、Supabase Dashboard でテンプレートを更新

### Supabase Dashboard 更新手順
1. https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/auth/templates にアクセス
2. 各テンプレートのロゴ部分を以下に変更:
   ```html
   <img src="https://training.bo-no.design/images/bono-logo.svg" alt="BONO" width="68" height="20" />
   ```

### 対象テンプレート
- [ ] Reset Password（パスワードリセット）
- [ ] Confirm Signup（メールアドレス確認）
- [ ] Change Email Address（メールアドレス変更）
- [ ] Magic Link（マジックリンク）

### 技術詳細
- ❌ 旧: Base64エンコード (`data:image/svg+xml;base64,...`) → Gmailでブロック
- ✅ 新: 外部URL (`https://training.bo-no.design/images/bono-logo.svg`) → 表示可能

---

## 5. 全ページのリンク先変更

`/auth` → `/login` または `/signup` への変更が必要な箇所:
- [ ] ペイウォール
- [ ] ヘッダー
- [ ] フッター
- [ ] その他認証関連リンク

---

---

## 📝 実装サマリー（2025-01-22）

### 完了した作業

#### 1. ページ構造
- `/auth` → `/login` + `/signup` に分割
- `/auth` は `/login` へリダイレクト設定済み
- 全リンク先を更新完了

#### 2. ログインページ (`/login`)
- **構造**: ページタイトル → タブ → コンテンツ
- **タブ**: `TabGroup`コンポーネントに統一（マイページと同じ）
- **タブ名**: 「設定済み」「はじめての方」
- **Card内**: 重複タイトル・説明を削除
- **新規登録リンク**: Cardの外に配置
- **ボタン**: `size="large"` に統一

#### 3. 新規登録ページ (`/signup`)
- **構造**: ページタイトル → RegistrationFlowGuide → ログインリンク
- **Card二重構造を解消**: 直接`RegistrationFlowGuide`を表示
- **背景色**: `bg-muted/30` → `bg-white`（コントラスト改善）

#### 4. ペイウォール・プレミアムロック
- **Modalコンポーネント**: `src/components/ui/modal.tsx` を新規作成
- **テキスト統一**: 「メンバーシップの登録が必要です」「メンバーシップ登録へ」
- **RegistrationFlowGuide**: Amie風デザイン、ステップ説明付き

#### 5. 新規作成ファイル
- `src/components/ui/modal.tsx` - 構造化モーダルコンポーネント
- `src/pages/Login.tsx` - ログインページ
- `src/pages/Signup.tsx` - 新規登録ページ
- `src/pages/dev/RegistrationFlowPatterns.tsx` - 開発用パターン検討
- `src/pages/dev/MobileMenuButtonPatterns.tsx` - 開発用パターン検討

---

## ⚠️ 残タスク・検討事項

### 手動設定が必要（デプロイ後）
| タスク | 対応方法 |
|--------|----------|
| メールテンプレートのロゴ更新 | Supabase Dashboard → Authentication → Email Templates で `<img src="https://training.bo-no.design/images/bono-logo.svg" alt="BONO" width="68" height="20" />` に変更 |

**対象テンプレート**: Reset Password, Confirm Signup, Change Email, Magic Link

### 検討事項
| 項目 | 内容 | ステータス |
|------|------|----------|
| メールバリデーション | 存在しないメールアドレスの場合のエラー表示 | ✅ 実装済み |
| 開発用ページの整理 | `/dev/registration-flow`, `/dev/mobile-menu-patterns` の削除検討 | 📋 未対応 |

---

## 🔗 関連ファイル

### 変更したファイル
```
src/pages/Login.tsx (新規)
src/pages/Signup.tsx (新規)
src/components/ui/modal.tsx (新規)
src/components/auth/RegistrationFlowGuide.tsx
src/components/premium/ContentPreviewOverlay.tsx
src/components/premium/PremiumVideoLock.tsx
src/components/ui/dialog.tsx
src/App.tsx
```

### UIコンポーネント依存関係
```
TabGroup        → マイページ・ログインで使用
Button (large)  → 新規登録・ログインで使用
Modal           → ペイウォールモーダルで使用
Card            → ログインフォームで使用
```

