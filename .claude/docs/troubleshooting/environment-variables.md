# 環境変数トラブルシューティングガイド

## 概要
このドキュメントは、Vite環境変数に関するトラブルシューティングと再発防止のためのベストプラクティスをまとめています。

## 発生した問題（2025-11-30）

### 症状
- `.env.local`にローカルSupabase URLを設定しているにも関わらず、フロントエンドが本番環境に接続していた
- ハードリロード、シークレットウィンドウ、複数のVite再起動を試しても解決しなかった
- ブラウザコンソールに本番URLが表示され続けた

### 根本原因

**2つの問題が重なっていた：**

#### 1. ハードコードされた本番URL（最初の問題）
`src/integrations/supabase/client.ts`に本番環境のURLが直接書かれていた：

```typescript
// ❌ 間違い
const SUPABASE_URL = "https://fryogvfhymnpiqwssmuu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGci...";
```

**問題点**: 環境変数を完全に無視してハードコードされた値を使用していた

**解決策**: 環境変数を読み込むように修正
```typescript
// ✅ 正しい
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

#### 2. グローバルシェル環境変数の優先（真の原因）
シェルのグローバル環境変数に本番URLが設定されていた：

```bash
$ printenv | grep SUPABASE
VITE_SUPABASE_URL=https://fryogvfhymnpiqwssmuu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...（本番環境のキー）
```

**Viteの環境変数優先順位:**
```
1. グローバルシェル環境変数（最優先） ← これが原因！
2. .env.development.local
3. .env.local
4. .env.development
5. .env（最低優先）
```

どんなに`.env.local`を修正しても、グローバル環境変数が常に勝っていた。

### 最終的な解決策

`vite.config.ts`で`define`を使って強制上書き：

```typescript
export default defineConfig(({ mode }) => {
  // 🚨 TESTING MODE: ローカル環境に強制上書き
  const FORCED_LOCAL_URL = 'http://127.0.0.1:54321';
  const FORCED_LOCAL_ANON_KEY = 'eyJhbGci...（ローカルキー）';

  return {
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(FORCED_LOCAL_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(FORCED_LOCAL_ANON_KEY),
    },
    // ...
  };
});
```

**`define`の特徴:**
- コンパイル時に定数として置き換えられる
- 全ての環境変数（グローバル含む）より優先される
- 開発時のテストモードに最適

## 再発防止チェックリスト

### 環境変数設定時の必須確認項目

#### ✅ 1. ハードコードされた値がないか確認
```bash
# 本番URLやキーがハードコードされていないか検索
grep -r "fryogvfhymnpiqwssmuu" src/
grep -r "https://" src/integrations/supabase/
```

**チェックポイント:**
- `src/integrations/supabase/client.ts`
- `src/config/`以下の設定ファイル
- APIエンドポイント定義

#### ✅ 2. グローバル環境変数を確認
```bash
# Supabase関連のグローバル環境変数を確認
printenv | grep -i supabase
printenv | grep -i vite
```

**対処法:**
- 不要なグローバル環境変数は削除
- または`vite.config.ts`で強制上書き

#### ✅ 3. .envファイルの優先順位を理解する

**開発環境の読み込み順序:**
1. グローバルシェル環境変数
2. `.env.development.local` （gitignore、個人用）
3. `.env.local` （gitignore、個人用）
4. `.env.development` （共有可）
5. `.env` （共有可）

**本番環境の読み込み順序:**
1. グローバルシェル環境変数
2. `.env.production.local`
3. `.env.local`
4. `.env.production`
5. `.env`

#### ✅ 4. デバッグログを追加する

`src/integrations/supabase/client.ts`に詳細ログ：
```typescript
console.log('========== Supabase Client Debug ==========');
console.log('📦 import.meta.env:', import.meta.env);
console.log('🔑 VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('🌍 環境:', import.meta.env.VITE_SUPABASE_URL?.includes('127.0.0.1') ? 'ローカル ✅' : '本番 ❌');
console.log('==========================================');
```

`vite.config.ts`に環境変数ロードログ：
```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  console.log('========== Vite Config Debug ==========');
  console.log('🔧 Mode:', mode);
  console.log('🔧 All SUPABASE env keys:', Object.keys(env).filter(k => k.includes('SUPABASE')));
  console.log('🔧 env.VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL);
  console.log('========================================');
});
```

#### ✅ 5. ブラウザで確認する手順

1. **ハードリロード**: `Cmd + Shift + R` (Mac) / `Ctrl + Shift + R` (Win)
2. **開発者ツールを開く**: `F12` または `Cmd + Option + I`
3. **Consoleタブで確認**:
   - `🌍 環境: ローカル ✅` が表示されているか
   - `VITE_SUPABASE_URL: http://127.0.0.1:54321` が表示されているか
4. **Networkタブで確認**:
   - API呼び出しが`127.0.0.1:54321`に向いているか
   - 本番URL（`fryogvfhymnpiqwssmuu.supabase.co`）への通信がないか

### 開発モードとテストモードの切り替え手順

#### ローカル環境（テストモード）に切り替える

1. **グローバル環境変数を確認・削除**
   ```bash
   # 確認
   printenv | grep VITE_SUPABASE

   # 削除（必要に応じて）
   unset VITE_SUPABASE_URL
   unset VITE_SUPABASE_ANON_KEY
   ```

2. **vite.config.tsで強制上書きを有効化**（推奨）
   ```typescript
   // 🚨 TESTING MODE: ローカル環境に強制上書き
   const FORCED_LOCAL_URL = 'http://127.0.0.1:54321';
   const FORCED_LOCAL_ANON_KEY = 'eyJhbGci...';

   return {
     define: {
       'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(FORCED_LOCAL_URL),
       'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(FORCED_LOCAL_ANON_KEY),
     },
   };
   ```

3. **Viteサーバーを再起動**
   ```bash
   # 全てのViteプロセスをkill
   lsof -ti:8080 | xargs kill -9

   # 再起動
   npm run dev
   ```

4. **ブラウザで確認**
   - コンソールに `🌍 環境: ローカル ✅` と表示されることを確認

#### 本番環境に切り替える（デプロイ前）

1. **vite.config.tsの強制上書きをコメントアウト**
   ```typescript
   // 本番環境テスト時は以下をコメントアウト
   // define: {
   //   'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(FORCED_LOCAL_URL),
   //   'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(FORCED_LOCAL_ANON_KEY),
   // },
   ```

2. **グローバル環境変数を本番に設定**（またはLovable等のホスティング環境で設定）
   ```bash
   export VITE_SUPABASE_URL=https://fryogvfhymnpiqwssmuu.supabase.co
   export VITE_SUPABASE_ANON_KEY=eyJhbGci...（本番キー）
   ```

3. **Viteサーバーを再起動**

4. **ブラウザで確認**
   - コンソールに `🌍 環境: 本番 ❌` と表示されることを確認

## トラブルシューティングフローチャート

```
環境変数が正しく読み込まれない
    ↓
[1] ブラウザコンソールでURLを確認
    ↓
    ├─ ローカルURL表示 → OK、次のステップへ
    └─ 本番URL表示 → 以下を順番に確認
        ↓
[2] src/integrations/supabase/client.tsを確認
    - ハードコードされた値がないか？
    - import.meta.env.VITE_SUPABASE_URLを使っているか？
    ↓
[3] グローバル環境変数を確認
    - printenv | grep VITE_SUPABASE
    - 本番URLが設定されていないか？
    ↓
[4] .envファイルを確認
    - .env.local にローカルURLが設定されているか？
    - .env に本番URLが残っていないか？
    ↓
[5] vite.config.tsで強制上書き
    - defineでローカルURLを強制設定
    ↓
[6] Viteサーバーを完全再起動
    - lsof -ti:8080 | xargs kill -9
    - npm run dev
    ↓
[7] ブラウザをハードリロード
    - Cmd + Shift + R
    - シークレットウィンドウでも確認
```

## ベストプラクティス

### 1. 環境変数は必ず`import.meta.env`経由で読み込む
```typescript
// ✅ Good
const url = import.meta.env.VITE_SUPABASE_URL;

// ❌ Bad
const url = "https://fryogvfhymnpiqwssmuu.supabase.co";
```

### 2. デフォルト値を設定する
```typescript
const url = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
```

### 3. 環境別のデバッグログを追加
```typescript
if (import.meta.env.DEV) {
  console.log('🔍 Development mode');
  console.log('📍 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
}
```

### 4. テストモード専用のvite.config設定を作る
```typescript
// vite.config.ts
const isTestMode = process.env.TEST_MODE === 'true';

export default defineConfig(({ mode }) => {
  return {
    define: isTestMode ? {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('http://127.0.0.1:54321'),
    } : {},
  };
});
```

使用方法：
```bash
# テストモード
TEST_MODE=true npm run dev

# 通常モード
npm run dev
```

### 5. .gitignoreを正しく設定
```gitignore
# Local env files
.env.local
.env.*.local
.env.development.local
.env.production.local

# ただし、.envと.env.exampleはコミット
# .env
# .env.example
```

## まとめ

### 環境変数が正しく読み込まれない場合のチェックリスト

- [ ] `src/integrations/supabase/client.ts`にハードコードされた値がないか
- [ ] グローバル環境変数に本番URLが設定されていないか（`printenv | grep SUPABASE`）
- [ ] `.env.local`に正しいローカルURLが設定されているか
- [ ] Viteサーバーを再起動したか（ポート競合も確認）
- [ ] ブラウザをハードリロードしたか（Cmd+Shift+R）
- [ ] ブラウザコンソールで`🌍 環境: ローカル ✅`が表示されているか
- [ ] Networkタブで`127.0.0.1:54321`にリクエストが飛んでいるか

### 学んだ教訓

1. **環境変数の優先順位を理解する**: グローバル環境変数 > .env.local > .env
2. **ハードコードを避ける**: 必ず`import.meta.env`を使う
3. **詳細なデバッグログを追加する**: 問題の早期発見に役立つ
4. **vite.config.tsの`define`を活用**: テストモードで環境変数を強制上書き
5. **ブラウザとサーバー両方を確認**: 片方だけでは不十分

### 今後の改善案

- [ ] 環境変数バリデーション関数を作成
- [ ] 起動時に環境変数を自動チェックするスクリプト作成
- [ ] テストモード/本番モードの明確な切り替えコマンド作成
- [ ] CI/CDで環境変数の設定ミスを検出

---

**関連ドキュメント:**
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
