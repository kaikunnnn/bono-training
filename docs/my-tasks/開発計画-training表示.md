
# 統合開発計画 - Training コンテンツ管理・表示システム

**（統合 Phase 3 & Phase 4 - Supabase Storage 一元化版）**

---

## 📑 統合プラン概要

**キー方針**
1. **ローカル Markdown 執筆は従来どおり** - 開発体験を維持
2. **git push すると GitHub Actions がバケットへ自動同期** - ヒューマンエラー防止
3. **フロント／Edge Function は常に Storage だけを見る** - 分岐ゼロ、テスト・本番で経路が変わらない

**変更背景（旧案 → 新案）**

| 旧案 | 新案（採用） | 理由 |
|------|-------------|------|
| 無料: ローカル読込<br>有料: Storage | 無料も有料も Storage | コード分岐をなくしバグ要因を削減。CI が「同期 → ビルド」で一貫。 |
| 手動アップロード or 部分同期 | GitHub Actions で全 Markdown をワンクリック同期 | 執筆フローは git push だけ。ヒューマンエラー防止。 |
| Edge Function が複雑（分岐＋正規化） | 単一 API・単一パスですべて取得 | テスト・監視・キャッシュ戦略をシンプルに。 |

---

## Phase 3 – プラン判定ロジック完成（約 0.5 日）

### ゴール
- free/standard/growth/community の各プランを正しく判定
- 「hasMemberAccess」「hasLearningAccess」などのメソッド名で必要な Boolean フラグを返す
- Guard コンポーネントが「Member 権限」ベースで正しく制御できる

### 実装タスク

| #   | 作業 | 主要ファイル | 完了条件 |
|-----|------|-------------|----------|
| 3-1 | subscriptionPlans.ts 仕上げ<br>`learning: ['standard','growth']`<br>`member: ['standard','growth','community']` | `src/utils/subscriptionPlans.ts` | 型チェック OK |
| 3-2 | useSubscription.ts リファクタ<br>返却値：`hasMemberAccess` / `hasLearningAccess` | `src/hooks/useSubscription.ts` | Storybook／Jest 4 ケース通過 |
| 3-3 | Guard 置換<br>`planMembers` → `hasMemberAccess` | `TrainingGuard.tsx` など | `/training?plan=...` テストで OK |
| 3-4 | Edge Function check-subscription ミニマム化<br>`{ subscribed, planType }` のみ返す | `supabase/functions/check-subscription/...` | DevTools で JSON 確認 |

### テストゲート（Phase 3 完了チェック）

1. **プラン定義の検証**
   ```bash
   # URL パラメータでのテスト
   ?plan=free → hasMemberAccess: false
   ?plan=standard → hasMemberAccess: true  
   ?plan=growth → hasMemberAccess: true
   ?plan=community → hasMemberAccess: true
   ```

2. **権限判定フックの動作確認**
   - `useSubscriptionContext()` で正しい Boolean 値が返る

3. **Guard コンポーネントの動作確認**
   - 無料ユーザーが有料コンテンツにアクセス → 適切にブロック
   - 有料ユーザーが有料コンテンツにアクセス → 正常表示

4. **全体ビルド確認**
   ```bash
   pnpm typecheck && pnpm test && pnpm build
   ```

---

## Phase 4 – コンテンツ同期 & PREMIUM 出し分け（約 1 日）

### ゴール
- すべての Markdown（無料・有料）を Supabase Storage に同期
- `<!-- PREMIUM_ONLY -->` マーカーでコンテンツを出し分け
- 無料ユーザーと有料ユーザーで適切な表示制御

### フェーズ別時間目安

| フェーズ | 目的 | 時間目安 |
|---------|------|----------|
| 4-1 | Storage 自動同期セットアップ | 1h |
| 4-2 | get-training-content Edge Function | 2h |
| 4-3 | サービス層 & 型統一 | 1h |
| 4-4 | MdxPreview + TaskHeader 出し分け | 1h |
| 4-5 | クリーンアップ & 総合テスト | 0.5h |

---

### Phase 4-1: Storage 自動同期セットアップ

#### 1. バケット作成
```sql
-- プライベートバケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-content', 'training-content', false);
```

#### 2. RLS ポリシー設定
```sql
-- 匿名でも無料ファイルを読める
CREATE POLICY "anon_read_free"
  ON storage.objects FOR SELECT
  TO anon
  USING (
    bucket_id = 'training-content' 
    AND metadata->>'is_free' = 'true'
  );

-- 認証ユーザーはすべて読める  
CREATE POLICY "authed_read_all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'training-content');
```

#### 3. GitHub Actions 設定
```yaml
# .github/workflows/sync-training-content.yml
name: Sync Training Content to Supabase
on:
  push:
    paths: ['content/training/**']
    
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Detect Free Content
        id: detect_free
        run: |
          # front-matter の is_premium を読んで metadata.is_free を付与
          
      - uses: supabase/supabase-js@cli-sync
        with:
          from: content/
          to: training-content/
          metadata: |
            is_free=${{ steps.detect_free.outputs.is_free }}
```

---

### Phase 4-2: Edge Function 実装

#### get-training-content Edge Function
```typescript
export const handler = async (req) => {
  const { slug, task } = JSON.parse(req.body);
  const path = task
    ? `training/${slug}/tasks/${task}/content.md`
    : `training/${slug}/index.md`;

  // Storage からファイル取得
  const { data, error } = await supabase.storage
    .from('training-content')
    .download(path);

  if (error) return new Response('Not found', { status: 404 });

  // Front-matter パース
  const { data: fm, content } = parseFrontmatter(await data.text());
  
  // アクセス権判定
  const hasAccess = fm.is_premium ? req.ctx.user?.hasMemberAccess : true;
  
  // コンテンツ分割
  const rendered = hasAccess
    ? content
    : content.split('<!-- PREMIUM_ONLY -->')[0];

  return new Response(JSON.stringify({
    meta: fm,
    content: rendered,
    showPremiumBanner: fm.is_premium && !hasAccess
  }), { 
    headers: { 'Content-Type': 'application/json' }
  });
};
```

#### エラー防止策
- **JWT パースロジック追加** - `req.ctx.user?.hasMemberAccess` の実装
- **段階的テスト** - 認証なし → あり → プレミアム分割の順
- **フォールバック処理** - Storage 接続失敗時のローカルファイル読み込み

---

### Phase 4-3: フロントエンド統合

#### サービス層統一
```typescript
// src/services/training.ts
export const fetchTrainingContent = async (slug: string, task?: string) => {
  const { data } = await supabase.functions.invoke(
    'get-training-content', 
    { body: { slug, task } }
  );
  return data; // { meta, content, showPremiumBanner }
};
```

#### 型定義統一
```typescript
// src/types/training.ts  
export interface TrainingContentResponse {
  meta: TaskFrontmatter;
  content: string;
  showPremiumBanner: boolean;
}
```

#### 後方互換性維持
- 既存の `loadTaskContent()` 関数は残してフォールバック用に活用
- 新旧両方の取得方法を並行実装し、段階的に切り替え

---

### Phase 4-4: 表示コンポーネント調整

#### MdxPreview 更新
```typescript
// showPremiumBanner プロパティ追加
<MdxPreview 
  content={content}
  showPremiumBanner={showPremiumBanner}
/>

// 内部実装
{showPremiumBanner && <PremiumContentBanner />}
<ReactMarkdown>{content}</ReactMarkdown>
```

#### TaskHeader 更新  
```typescript
// アクセス制御表示
{!hasMemberAccess && meta.is_premium && (
    <Badge variant="outline">メンバー限定コンテンツ</Badge>
)}

// 動画プレーヤー
<VideoPlayer 
  src={hasMemberAccess ? meta.video_full : meta.video_preview}
  isPremium={meta.is_premium}
  hasPremiumAccess={hasMemberAccess}
/>
```

---

### Phase 4-5: クリーンアップ & 総合テスト

#### 1. git push → Actions 同期テスト
- 新しい Markdown ファイルを追加
- GitHub Actions でのバケット同期を確認

#### 2. ブラウザテスト（プラン別）
- **free**: `/training/todo-app/introduction` → バナー表示＆preview 動画
- **community**: 全文表示、preview 動画  
- **standard/growth**: 全文表示、full 動画

#### 3. ビルドテスト
```bash
pnpm typecheck && pnpm build && pnpm preview
# エラー 0 件を確認
```

#### 4. 不要コード削除
- ローカルファイル読み込み関数の削除
- 分岐処理のクリーンアップ
- 使われていない import の整理

---

## Phase 3.5: Edge Function 準備（追加フェーズ）

### 目的
Phase 4-2 で必要な JWT パースと権限判定ロジックを事前準備

### 実装内容
```typescript
// Edge Function 内での認証チェック実装
const getUserFromJWT = async (authHeader: string) => {
  // JWT 検証とユーザー情報取得
  // サブスクリプション状態の確認
  // hasMemberAccess フラグの生成
};
```

---

## 🎯 最終成果物

### 1. ファイル構造
```
content/training/           # ローカル執筆環境（従来通り）
├── todo-app/
│   ├── index.md           # Training 概要
│   └── tasks/
│       ├── 01-introduction/
│       │   └── content.md  # 無料タスク
│       └── 02-premium/
│           └── content.md  # 有料タスク（<!-- PREMIUM_ONLY -->マーカー付き）

# GitHub Actions で自動同期 ↓

Supabase Storage training-content/ # 本番配信環境
├── training/
│   └── todo-app/          # 同じ構造で同期される
```

### 2. データフロー
```
ローカル執筆 → git push → GitHub Actions → Supabase Storage
                                              ↓
ユーザーアクセス → Edge Function → 権限チェック → コンテンツ分割 → フロントエンド表示
```

### 3. セキュリティ
- **Storage**: プライベートバケット + RLS
- **Edge Function**: JWT 検証 + サブスクリプション確認
- **フロント**: 追加のクライアント側バリデーション

---

## 🚀 次のステップ

### Phase 5（予定）
- Vercel 自動デプロイ連携
- CDN キャッシュ最適化
- パフォーマンス監視

### 運用フロー
1. **新コンテンツ作成**: ローカルで Markdown 執筆
2. **デプロイ**: `git push` のみ（Actions が自動同期）
3. **確認**: ブラウザでプレビュー、権限テスト
4. **公開**: 自動的に本番反映

これで **ローカル Markdown 執筆の快適さ** と **本番での安全なプレミアム出し分け** を両立した統合システムが完成します。
