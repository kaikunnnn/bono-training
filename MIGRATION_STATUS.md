# Next.js 移行ステータス

## 移行方針
元のViteプロジェクトの仕組みとスタイルを完全に再現した状態でNext.jsに移行する

---

## 🚨 移行時に発生した問題と教訓

### 発生した問題一覧

| # | 問題 | 原因 | 影響 |
|---|------|------|------|
| 1 | サイドバーレイアウトが消失 | mainの Layout.tsx を確認せず Header+Footer で実装 | 全ページのレイアウトが違う |
| 2 | サイドバーのアイコンが表示されない | `"use client"` 未指定、color prop 未指定、transpilePackages 未設定 | iconsax-reactが動作しない |
| 3 | ローディングがSkeletonカード | mainの LoadingSpinner を確認せず shadcn/ui パターンで実装 | ローディング表示が違う |
| 4 | ボタンサイズが違う | `size="large"` を `size="lg"` に変更 | ボタンが小さく角丸も違う |
| 5 | レッスンのアイコン画像が表示されない | Sanityクエリで `iconImageUrl` を直接取得せず `iconImage.asset->url` で解決 | 画像URLがnull |
| 6 | CSS色・Containerが適用されない | Tailwind v4のCSS変数に`hsl()`ラッパーがない、container設定がない | Card背景、ボーダー、リンク色、中央揃えが効かない |
| 7 | 記事詳細ページにグローバルナビが表示 | Layout.tsxが全ページに適用されている | `/articles/[slug]`で独自サイドナビ＋グローバルサイドバーが二重表示 |

### 根本原因

**mainブランチのコードを十分に確認せずに実装した**

具体的には：
1. **コンポーネントの実装を見ていない** - Button の variants、LoadingSpinner の見た目
2. **データ取得のクエリを見ていない** - Sanity GROQ クエリの構造
3. **レイアウト構造を見ていない** - Sidebar vs Header/Footer
4. **ライブラリの使い方を見ていない** - iconsax-react の props
5. **CSS処理パイプラインを見ていない** - Tailwind v3 → v4 の変更点

### 防止策

**移行前に必ず `git show main:src/...` でコードを確認する**

詳細は下記「移行時の必須チェックリスト」を参照。

---

### 問題 #6 の詳細分析：Tailwind v3 → v4 のCSS処理差異

#### 発生した問題

「コードレベルでは差分がない」と誤った結論を出したが、実際には重大なスタイル差分があった。

#### 調査ミスの原因

1. **コンポーネントファイルの比較だけで満足した**
   - Card.tsx, Input.tsx が同一 → 「問題なし」と判断
   - CSS処理パイプラインの違いを見落とした

2. **Tailwind v3 → v4 の変更点を理解していなかった**
   ```css
   /* Tailwind v3 (main) - tailwind.config.ts で設定 */
   colors: { primary: 'hsl(var(--primary))' }

   /* Tailwind v4 (migration) - @theme inline で設定 */
   --color-primary: var(--primary);  /* ← hsl()がない！ */
   ```
   CSS変数 `--primary: 222.2 47.4% 11.2%;` は有効な色値ではない

3. **設定ファイルの不在を軽視した**
   - main: `tailwind.config.ts` に `container: { center: true }` あり
   - migration: 設定ファイルなし → `.container` の挙動が異なる

4. **ユーザー報告との矛盾を疑わなかった**
   - ユーザー: 「デザインが違う」
   - 調査結果: 「差分なし」
   - → 調査方法を疑うべきだった

#### 修正内容

```css
/* globals.css - @theme inline 内 */
--color-primary: hsl(var(--primary));  /* hsl() ラッパー追加 */
--color-card: hsl(var(--card));
/* ...他17色も同様に修正 */

/* Container中央揃え設定を追加 */
.container {
  margin-left: auto;
  margin-right: auto;
  padding-left: 2rem;
  padding-right: 2rem;
}
```

#### 教訓

| 比較すべき対象 | 実施した | すべきだった |
|--------------|---------|------------|
| コンポーネントファイル | ✅ | ✅ |
| CSS変数定義 | ❌ | ✅ |
| Tailwindバージョン差異 | ❌ | ✅ |
| 設定ファイルの有無 | △（発見したが軽視） | ✅ |
| **実際のブラウザ表示** | ❌ | ✅ |

**コードの比較だけでなく、実際のレンダリング結果を確認すること。**

## 現在の移行状況

### ✅ 完了したフェーズ

#### Phase 1: スタイル・基盤の移行
- [x] Tailwind設定（globals.css - Tailwind v4形式）
- [x] Header/Footer コンポーネント
- [x] 共通コンポーネント（LoadingSpinner, DottedSeparator）

#### Phase 2: コア機能ページの移行
- [x] ホームページ（認証状態によるリダイレクト）
- [x] レッスン一覧ページ（SSR + カテゴリナビゲーション）
- [x] レッスン詳細ページ（SSR + OGP + 進捗表示）
- [x] 記事詳細ページ（SSR + OGP + サイドバー統合）
- [x] マイページ（サブスク・ブックマーク・履歴表示）
- [x] プロフィール・アカウント設定

#### Phase 3: サブスク・決済機能
- [x] Stripeサービス（Edge Function連携）
- [x] サブスクリプションページ（PlanCard, CustomerPortalButton）
- [x] アカウントページ（カスタマーポータル連携）
- [x] プレミアムコンテンツ制御（canAccessContent）

#### Phase 4: 追加機能ページ（新規）
- [x] フィードバック一覧・詳細ページ（Sanity連携）
- [x] フィードバック申請ページ・フォーム（マルチステップ）
- [x] フィードバックAPI（Slack通知統合）
- [x] ガイド一覧・詳細ページ（Markdownファイル）
- [x] ブログ一覧・詳細ページ（Sanity連携）

---

### ページ移行状況

| カテゴリ | 元のVite | Next.js | 状態 |
|---------|----------|---------|------|
| **認証** | | | |
| ログイン | Login.tsx | (auth)/login/page.tsx | ✅ 移行済 |
| サインアップ | Signup.tsx | (auth)/signup/page.tsx | ✅ 移行済 |
| パスワードリセット | ForgotPassword.tsx | (auth)/forgot-password/page.tsx | ✅ 移行済 |
| パスワード更新 | ResetPassword.tsx | auth/update-password/page.tsx | ✅ 移行済 |
| 認証コールバック | Auth.tsx | auth/callback/route.ts | ✅ 移行済 |
| **メインページ** | | | |
| ホーム | Index.tsx | page.tsx | ✅ 移行済 |
| レッスン一覧 | Lessons.tsx | lessons/page.tsx | ✅ 移行済 |
| レッスン詳細 | LessonDetail.tsx | lessons/[slug]/page.tsx | ✅ 移行済 |
| レッスンカテゴリ | - | lessons/category/[categoryId]/page.tsx | ✅ 移行済 |
| 記事詳細 | ArticleDetail.tsx | articles/[slug]/page.tsx | ✅ 移行済 |
| 記事一覧 | - | articles/page.tsx | ✅ 新規作成 |
| **ユーザー** | | | |
| マイページ | MyPage.tsx | mypage/page.tsx | ✅ 移行済 |
| プロフィール | Profile.tsx | profile/page.tsx | ✅ 移行済 |
| アカウント | Account.tsx | account/page.tsx | ✅ 移行済 |
| サブスクリプション | Subscription.tsx | subscription/page.tsx | ✅ 移行済 |
| 設定 | - | settings/page.tsx | ✅ 新規作成 |
| **ロードマップ** | | | |
| ロードマップ | Roadmap.tsx | roadmap/page.tsx | ✅ 移行済 |
| **フィードバック** | | | |
| フィードバック一覧 | feedbacks/FeedbackList.tsx | feedbacks/page.tsx | ✅ 移行済 |
| フィードバック詳細 | feedbacks/FeedbackDetail.tsx | feedbacks/[slug]/page.tsx | ✅ 移行済 |
| フィードバック申請 | feedback-apply/index.tsx | feedback-apply/page.tsx | ✅ 移行済 |
| フィードバック送信 | feedback-apply/submit.tsx | feedback-apply/submit/page.tsx | ✅ 移行済 |
| **ガイド** | | | |
| ガイド一覧 | Guide/index.tsx | guide/page.tsx | ✅ 移行済 |
| ガイド詳細 | Guide/GuideDetail.tsx | guide/[slug]/page.tsx | ✅ 移行済 |
| **ブログ** | | | |
| ブログ一覧 | blog/index.tsx | blog/page.tsx | ✅ 移行済 |
| ブログ詳細 | blog/detail.tsx | blog/[slug]/page.tsx | ✅ 移行済 |
| **トレーニング** | | | |
| トレーニング一覧 | Training/index.tsx | training/page.tsx | ✅ 移行済 |
| トレーニング詳細 | TrainingDetail.tsx | training/[trainingSlug]/page.tsx | ✅ 移行済 |
| タスク詳細 | Training/TaskDetailPage.tsx | training/[trainingSlug]/[taskSlug]/page.tsx | ✅ 移行済 |
| **API・バックエンド** | | | |
| フィードバック申請API | api/feedback-apply/submit.ts | api/feedback-apply/submit/route.ts | ✅ 移行済 |
| 質問投稿API | api/questions/submit.ts | api/questions/submit/route.ts | ✅ 移行済 |
| 回答通知API | api/questions/answer-notification.ts | api/questions/answer-notification/route.ts | ✅ 移行済 |
| Supabase Edge Functions | supabase/functions/ | supabase/functions/ | ✅ 移行済 |
| **その他** | | | |
| 質問機能（ページ） | questions/*.tsx | - | ❌ 未移行 |
| 知識ベース | knowledge/*.tsx | - | ❌ 未移行 |
| 検索 | Search.tsx | - | ❌ 未移行 |
| イベント | events/EventDetail.tsx | - | ❌ 未移行 |

---

### サービス移行状況

| サービス | 元のVite | Next.js | 状態 |
|---------|----------|---------|------|
| 認証 | auth.ts | (auth)/actions.ts | ✅ 移行済 |
| 進捗管理 | progress.ts | services/progress.ts | ✅ 移行済 |
| ブックマーク | bookmarks.ts | services/bookmarks.ts | ✅ 移行済 |
| 閲覧履歴 | viewHistory.ts | services/viewHistory.ts | ✅ 移行済 |
| Stripe | stripe.ts | services/stripe.ts | ✅ 移行済 |
| サブスク確認 | - | lib/subscription.ts | ✅ 移行済 |
| レッスン | lessons.ts | sanity.ts内 | ✅ 移行済 |
| フィードバック | - | sanity.ts内 | ✅ 移行済 |
| ブログ | sanityBlogService.ts | sanity.ts内 | ✅ 移行済 |
| ガイドローダー | guideLoader.ts | lib/guideLoader.ts | ✅ 移行済 |
| トレーニング | training/*.ts | services/training/*.ts | ✅ 移行済 |
| ロードマップ | roadmapService.ts | - | ❌ 未移行 |
| 認証サービス | services/auth.ts | lib/services/auth.ts | ✅ 移行済 |
| 料金サービス | services/pricing.ts | lib/services/pricing.ts | ✅ 移行済 |

---

### コンポーネント移行状況

| カテゴリ | 状態 |
|---------|------|
| レイアウト (Header, Footer, Layout) | ✅ 移行済 |
| 共通 (LoadingSpinner, DottedSeparator, Logo等) | ✅ 移行済 |
| 記事関連 (VideoSection, HeadingSection, Sidebar等) | ✅ 移行済 |
| サブスクリプション (PlanCard, CustomerPortalButton) | ✅ 移行済 |
| フィードバック (FeedbackCard, CategoryTabs, FeedbackSubmitForm) | ✅ 移行済 |
| ガイド (GuideCard, GuideCategoryFilter) | ✅ 移行済 |
| ブログ (BlogCard) | ✅ 移行済 |
| UI (shadcn/ui コンポーネント) | ✅ 主要移行済 |
| トレーニング (10個コア移行済) | ✅ 主要移行済 |

---

#### Phase 5: トレーニング機能
- [x] トレーニング一覧ページ（SSR + カテゴリ別表示）
- [x] トレーニング詳細ページ（SSR + タスク一覧）
- [x] タスク詳細ページ（SSR + マークダウン + 動画）
- [x] トレーニングサービス（Edge Function連携）
- [x] トレーニングコンポーネント（10個コア移行済）

#### Phase 6: バックエンド機能
- [x] Supabase Edge Functions（17関数 + 共有ユーティリティ）
- [x] Questions API（submit, answer-notification）
- [x] 認証サービス（auth.ts）
- [x] 料金サービス（pricing.ts）
- [x] サブスクリプションユーティリティ関数

---

## 今後の移行予定

### 優先度順
1. **質問機能** - 質問掲示板
2. **知識ベース** - ナレッジベース
3. **検索機能** - 全文検索
4. **イベント機能** - イベント詳細

---

## ビルド状態

✅ `npm run build` 成功（全32ルート生成）

### 実装済みルート
```
/ - ホーム
/login, /signup, /forgot-password - 認証
/auth/callback, /auth/update-password - 認証コールバック
/lessons, /lessons/[slug], /lessons/category/[categoryId] - レッスン
/articles, /articles/[slug] - 記事
/mypage, /profile, /account, /settings - ユーザー
/subscription - サブスクリプション
/roadmap - ロードマップ
/feedbacks, /feedbacks/[slug] - フィードバック
/feedback-apply, /feedback-apply/submit - フィードバック申請
/guide, /guide/[slug] - ガイド
/blog, /blog/[slug] - ブログ
/training, /training/[trainingSlug], /training/[trainingSlug]/[taskSlug] - トレーニング

API:
/api/feedback-apply/submit - フィードバック申請
/api/questions/submit - 質問投稿
/api/questions/answer-notification - 回答通知 Webhook
```

### Supabase Edge Functions（17関数）
```
stripe-webhook, stripe-webhook-test - 決済 Webhook
create-checkout, create-customer-portal - Stripe チェックアウト
check-subscription, update-subscription - サブスクリプション管理
get-content, get-plan-prices - コンテンツ・料金取得
get-training-content, get-training-detail, get-training-list - トレーニング
preview-subscription-change - プラン変更プレビュー
check-migrated-user, clear-migrated-flag - ユーザー移行
webflow-series, fetch-ogp - 外部連携
```

---

## 検証方法

### 各ページの完了基準
1. **ビルド成功**: TypeScriptエラーなし
2. **見た目の一致**: 元のページと同じ見た目
3. **機能の一致**: すべての機能が同じように動作
4. **OGP対応**: メタデータが正しく生成される

---

## ⚠️ 移行時の必須チェックリスト

### 失敗から学んだ教訓

以下のチェックリストは実際の移行ミスから作成。**必ず確認すること**。

#### 1. レイアウト・構造の確認
```bash
# mainブランチのレイアウト構造を確認
git show main:src/components/layout/Layout.tsx
git show main:src/pages/[対象ページ].tsx | head -100
```
- [ ] Sidebar / Header / Footer の構造は同じか
- [ ] ページのラッパー構造（div のネスト）は同じか
- [ ] レスポンシブ対応（モバイル/デスクトップ）は同じか

#### 2. コンポーネントの props/API 確認
```bash
# mainブランチのコンポーネント定義を確認
git show main:src/components/ui/button.tsx
git show main:src/components/[対象コンポーネント].tsx
```
- [ ] Button の `size` 属性: `lg` vs `large` vs `medium` の違いを確認
- [ ] variant の指定は正しいか
- [ ] カスタム props は全て渡されているか

#### 3. Sanity クエリの確認 ★重要★
```bash
# mainブランチのクエリを必ず確認
git show main:src/pages/[対象ページ].tsx | grep -A 50 "const query"
git show main:src/lib/sanity.ts
```
- [ ] フィールド名は直接取得か、参照解決か（例: `iconImageUrl` vs `iconImage.asset->url`）
- [ ] `coalesce()` でフォールバックが必要なフィールドはないか
- [ ] 必須フィールドは全て含まれているか

#### 4. データの流れ確認
```
page.tsx → ClientComponent → 子コンポーネント → 表示
```
- [ ] 各階層の interface/type でフィールドが欠落していないか
- [ ] Optional (`?`) の指定は正しいか
- [ ] データが null の場合の処理は同じか

#### 5. ローディング・エラー状態の確認
```bash
# mainブランチのローディング実装を確認
git show main:src/pages/[対象ページ].tsx | grep -A 10 "if (loading)"
git show main:src/components/common/LoadingSpinner.tsx
```
- [ ] ローディング表示は同じか（Skeleton vs Spinner）
- [ ] エラー表示は同じか
- [ ] 空状態の表示は同じか

#### 6. 画像・アセットの確認
```bash
# Next.js Image の設定確認
cat next.config.ts
```
- [ ] `next.config.ts` に `remotePatterns` が設定されているか
- [ ] `<img>` → `<Image>` 変換時に `fill` + `unoptimized` が適切か
- [ ] 画像URLの取得方法はmainと同じか

#### 7. アイコン・UIライブラリの確認
```bash
# 使用しているアイコンライブラリを確認
git show main:src/components/[対象].tsx | grep "import.*icon"
```
- [ ] iconsax-react / lucide-react の使い分けは同じか
- [ ] アイコンの `size` / `color` / `variant` は同じか

### 移行作業フロー

```
1. mainブランチの対象コードを読む（必須・最初に行う）
   ↓
2. 差分を確認（git diff main:src/... -- src/...）
   ↓
3. 実装する
   ↓
4. ブラウザで見た目を確認
   ↓
5. 上記チェックリストで漏れがないか確認
```

### よくある間違いパターン

| パターン | 誤り | 正解 |
|---------|------|------|
| Button size | `size="lg"` | `size="large"` (Figma準拠) |
| Loading | Skeleton カード | LoadingSpinner (シンプル) |
| Sanity iconImageUrl | `iconImage.asset->url` | `coalesce(iconImageUrl, iconImage.asset->url)` |
| Layout | Header + Footer | Sidebar (左固定) |
| Icons | 全部lucide-react | iconsax-react + lucide 混在 |
| Image className | `absolute inset-0 w-full h-full` | `fill` prop使用時は不要 |
| Tailwind v4 色定義 | `--color-primary: var(--primary)` | `--color-primary: hsl(var(--primary))` |
| Tailwind v4 Container | 設定なし | CSS内で手動定義が必要 |
| 記事詳細レイアウト | 全ページに Layout 適用 | `/articles/[slug]` は独自レイアウト（グローバルナビ除外） |

### Tailwind v3 → v4 移行時の注意点

| 項目 | v3 | v4 |
|-----|----|----|
| 設定ファイル | tailwind.config.ts | @theme inline (CSS内) |
| 色定義 | `'hsl(var(--primary))'` | `hsl(var(--primary))` (CSS内で直接) |
| Container | config で `center: true` | CSS で `.container` を手動定義 |
| CSS変数参照 | 自動的にhsl()ラップ | 明示的にhsl()が必要 |

---

### 再調査結果（2026-03-14）

教訓を踏まえて再調査を実施。以下の差分を確認。

#### 1. Tailwind v3 → v4 設定差分

| 項目 | main (v3) | migration (v4) | 対応状況 |
|------|-----------|----------------|----------|
| 色定義 (17色) | `hsl(var(--primary))` | `hsl(var(--primary))` | ✅ 修正済み |
| Container | `container: { center: true }` | CSS手動定義 | ✅ 修正済み |
| Sidebar colors | `hsl(var(--sidebar-background))` | `var(--sidebar)` (oklch) | ✅ 正しい（oklch形式） |
| backgroundColor.base | 分離定義（text-base衝突回避） | `--color-base` | ⚠️ 要監視 |

#### 2. コンポーネント差分

| コンポーネント | 状態 |
|----------------|------|
| button.tsx | ✅ 同一 |
| card.tsx | ✅ 同一 |
| input.tsx | ✅ 同一 |

#### 3. Button サイズ問題

| ファイル | 行 | 問題 | 対応状況 |
|----------|-----|------|----------|
| roadmap/page.tsx | 225 | `size="lg"` | ✅ 修正済み |
| feedback-apply/page.tsx | 187, 194 | `size="lg"` | ✅ 修正済み |
| lessons/page.tsx | 322 | `size="lg"` | ✅ 修正済み |

#### 4. 構造的差分（React Router → Next.js App Router）

以下は意図的な変更であり、修正不要：

| 項目 | main (Vite) | migration (Next.js) |
|------|-------------|---------------------|
| Router | react-router-dom | Next.js App Router |
| Header | Client Component | Server + Client Component |
| Footer | React Router Link | Next.js Link |
| 認証コンテキスト | AuthContext | Server Actions + Supabase Server Client |

#### 5. 記事詳細ページのレイアウト問題（#7）

| 項目 | main | 移行版（修正前） | 移行版（修正後） |
|------|------|----------------|----------------|
| `/articles/[slug]` | ArticleSideNavNew のみ | グローバルSidebar + ArticleSideNavNew | ArticleSideNavNew のみ ✅ |
| グローバルナビ | 非表示 | 表示されてしまう | 非表示 ✅ |
| フッター | なし | 表示される | なし ✅ |

**修正内容**: `Layout.tsx` で `/articles/[slug]` パスの場合は `children` のみ返すように変更

```tsx
// Layout.tsx
const isArticleDetailPage = pathname?.startsWith("/articles/") && pathname !== "/articles";

if (isArticleDetailPage) {
  return <>{children}</>;
}
```

---

## 参照ファイル

| 種類 | Vite版 | Next.js版 |
|------|--------|-----------|
| ページ | `src/pages/` | `src/app/` |
| コンポーネント | `src/components/` | `src/components/` |
| サービス | `src/services/` | `src/lib/services/` |
| フック | `src/hooks/` | `src/hooks/` |
| スタイル | `tailwind.config.ts` | `globals.css` (Tailwind v4) |

**Vite版**: `/Users/kaitakumi/Documents/bono-training/`
**Next.js版**: `/Users/kaitakumi/Documents/bono-training-nextjs/`
