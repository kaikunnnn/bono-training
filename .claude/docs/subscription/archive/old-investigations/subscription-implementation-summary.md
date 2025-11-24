# サブスクリプション機能 実装状況サマリー

**最終更新日**: 2025-11-16
**ステータス**: Phase 6 実装途中（プレミアムコンテンツ制御は未実装）
**ドキュメントの役割**: 現状の把握と問題点の整理

> **📌 実装作業を開始する場合**
> このドキュメントで現状を把握した後、`subscription-fix-plan.md` で具体的な修正手順を確認してください。

---

## 📚 関連ドキュメント

### 実装・修正作業用
- **[subscription-fix-plan.md](./subscription-fix-plan.md)** ⭐ - **今すぐ実装を始める場合はこちら**
  - 6ステップの具体的な修正手順
  - コード例とテスト方法
  - 完了条件とチェックリスト

### 背景・詳細仕様
- [progress-and-subscription-plan.md](./progress-and-subscription-plan.md) - 全体計画（7フェーズ）
- [subscription-page-specification.md](./subscription-page-specification.md) - サブスクリプションページ仕様
- [phase6-premium-content-implementation.md](./phase6-premium-content-implementation.md) - プレミアムコンテンツ実装計画
- [subscription-issues-analysis.md](./subscription-issues-analysis.md) - 問題分析（詳細）
- [subscription-test-report.md](./subscription-test-report.md) - テストレポート

---

## 📊 実装状況の全体像

### ✅ 完了済みの機能

#### 1. **データベース設計** (Phase 1完了)
- ✅ `user_subscriptions` テーブル作成済み
- ✅ `subscriptions` テーブル作成済み
- ✅ `stripe_customers` テーブル作成済み
- ✅ `article_bookmarks` テーブル作成済み (Phase 2)
- ✅ `lesson_progress` テーブル作成済み (Phase 5)
- ✅ `article_progress` テーブル作成済み (Phase 4)
- ⚠️ `duration` カラム追加 (マイグレーション実行確認が必要)

#### 2. **Stripe連携の基本機能**
- ✅ Stripe Checkout統合 (新規登録)
- ✅ Stripe Webhook処理
  - `checkout.session.completed` - 新規サブスクリプション作成
  - `customer.subscription.deleted` - サブスクリプション削除
  - `invoice.paid` - 支払い完了通知
- ✅ Stripe Customer Portal統合 (既存契約者のプラン管理)
- ✅ 環境変数設定 (.env)
  - Standard 1ヶ月: `price_1OIiOUKUVUnt8GtyOfXEoEvW` (4,000円/月)
  - Standard 3ヶ月: `price_1OIiPpKUVUnt8Gty0OH3Pyip` (3,800円/月)
  - Feedback 1ヶ月: `price_1OIiMRKUVUnt8GtyMGSJIH8H` (1,480円/月)
  - Feedback 3ヶ月: `price_1OIiMRKUVUnt8GtyttXJ71Hz` (1,280円/月)

#### 3. **フロントエンド実装**
- ✅ `/subscription` ページ作成
  - 期間選択タブ (1ヶ月/3ヶ月)
  - プランカード (Standard/Feedback)
  - プラン比較表
- ✅ `/account` ページ作成
  - サブスクリプション情報表示
  - Customer Portalへのリンク
- ✅ `SubscriptionContext` 実装
- ✅ `useSubscription` フック実装
- ✅ サブスクリプション状態管理

#### 4. **Supabase Edge Functions**
- ✅ `create-checkout` - チェックアウトセッション作成
- ✅ `stripe-webhook` - Webhookイベント処理
- ✅ `check-subscription` - サブスクリプション状態確認
- ✅ `create-customer-portal` - カスタマーポータルURL取得
- ✅ `update-subscription` - デプロイ済み (未使用)

---

### 🔨 実装中の機能

#### Phase 2: ブックマーク機能 (部分完了)
- ✅ データベーステーブル作成済み
- ⏳ サービス層実装 (`src/services/bookmarks.ts`)
- ⏳ ArticleDetailページへの統合
- ⏳ UI実装

#### Phase 5: レッスン進捗管理 (部分完了)
- ✅ データベーステーブル作成済み
- ⏳ 進捗計算ロジック実装
- ⏳ UI更新 (ArticleSideNav, MyPage)

---

### ❌ 未実装の機能

#### Phase 6: プレミアムコンテンツ表示制御 (最重要)
- ❌ `SubscriptionContext` にプレミアムアクセス判定機能追加
- ❌ ArticleDetail - 動画エリアのロック表示
- ❌ ArticleDetail - 記事コンテンツのプレビュー制御 (最初の3ブロックのみ)
- ❌ LessonDetail - コンテンツリストのロックアイコン表示
- ❌ プレミアムCTAコンポーネント
- ❌ Sanityクエリに`isPremium`フィールド追加

#### Phase 3: 記事進捗管理 (詳細仕様なし)
- ❌ 進捗率計算
- ❌ UI実装

#### Phase 4: 記事進捗追跡 (詳細仕様なし)
- ❌ 視聴時間トラッキング
- ❌ 完了判定ロジック

---

## 🚨 現在の問題点

### 🔴 優先度：高（機能が使えない / 致命的なバグ）

#### 問題1: 二重課金が発生する
**症状**: 既存契約者が別プランを選択すると、新旧2つのサブスクリプションが同時にアクティブになる

**影響範囲**: すべての既存契約者

**原因**:
- 古いサブスクリプションの自動キャンセル処理が動作していない
- Webhookの`replace_subscription_id`メタデータが正しく処理されていない可能性

**関連ファイル**:
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/create-checkout/index.ts`

---

#### 問題2: 同じプラン内で期間変更ができない
**症状**: 現在フィードバックプラン（1ヶ月）に加入中、期間タブを「3ヶ月」に切り替えても、ボタンが「現在のプラン」と表示され非活性になる

**影響範囲**: すべての既存契約者

**原因**: `Subscription.tsx:129` の `isCurrentPlan` 判定がプランタイプのみで判定し、期間を考慮していない

**該当コード**:
```typescript
// src/pages/Subscription.tsx:129
const isCurrentPlan = isSubscribed && planType === plan.id;
// ❌ durationを比較していない
```

**修正方針**:
```typescript
const isCurrentPlan = isSubscribed && planType === plan.id && currentDuration === selectedDuration;
```

**関連ファイル**:
- `src/pages/Subscription.tsx`
- `src/contexts/SubscriptionContext.tsx` (durationの取得が必要)

---

#### 問題3: Stripe ⇔ Supabase の同期が取れていない
**症状**: Stripe上でサブスクリプションをキャンセルしても、`/account` ページではまだアクティブと表示される

**影響範囲**: すべてのユーザー

**原因**: `customer.subscription.deleted` Webhookイベントの処理に問題がある可能性

**関連ファイル**:
- `supabase/functions/stripe-webhook/index.ts` (handleSubscriptionDeleted関数)

---

#### 問題4: プラン変更後、UIに反映されない
**症状**: Stripeチェックアウトで決済完了後、`/account` ページに戻っても、プラン情報が更新されていない

**原因（推測）**:
1. Webhookが正常に処理されていない
2. フロントエンドのSubscriptionContextが更新されていない
3. `/subscription/success` ページでデータをリフレッシュしていない

**関連ファイル**:
- `src/pages/SubscriptionSuccess.tsx` (存在するか確認が必要)
- `src/contexts/SubscriptionContext.tsx`

---

### 🟡 優先度：中（不便だが使える / UX問題）

#### 問題5: チェックアウトの「戻る」ボタンで404エラー
**症状**: Stripeチェックアウトページで「戻る」をクリックすると、`/subscription/success` にリダイレクトされ404エラーが表示される

**原因**: `create-checkout` のcancel_urlが正しく設定されていない

**該当コード**:
```typescript
// supabase/functions/create-checkout/index.ts:151
cancel_url: returnUrl,
// ❌ returnUrlが/subscription/successになっている
```

**修正方針**:
```typescript
success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: returnUrl.replace('/success', ''), // /subscriptionに戻る
```

---

#### 問題6: 既存契約者に新規課金画面が表示される
**症状**: 既存契約者が別プランを選択すると、Stripeチェックアウトページでクレジットカード情報の再入力を求められる

**影響範囲**: すべての既存契約者

**原因**: Stripe Checkoutは新規サブスクリプション作成用のフロー

**解決策**: Customer Portalは実装済み。Subscription.tsxで既存契約者にはCustomer Portalへのリンクを表示する設計変更が推奨される

---

### 🔵 その他の問題

#### エラー1: カスタマーポータルが開けない（kyasya00@gmail.com）
**症状**: `/account` で「プランの管理」ボタンをクリックすると「カスタマーポータルが開けませんでした」というエラー

**原因（推測）**: Stripeでこのユーザーのデータが見つからない（古いテストデータ）

**対処方法**: DBの`stripe_customers`テーブルでkyasya00@gmail.comを検索し、存在しない場合はDBレコードを削除

---

## 📂 ファイル構成

### フロントエンド
```
src/
├── pages/
│   ├── Subscription.tsx              ✅ 完成
│   ├── Account.tsx                   ✅ 完成
│   ├── SubscriptionSuccess.tsx       ❌ 未作成（404エラーの原因）
│   ├── ArticleDetail.tsx             ⏳ プレミアム制御が未実装
│   └── LessonDetail.tsx              ⏳ ロックアイコンが未実装
├── contexts/
│   └── SubscriptionContext.tsx       ✅ 完成
├── hooks/
│   ├── useSubscription.ts            ✅ 完成
│   └── useLessons.ts                 ✅ 完成
├── services/
│   ├── stripe.ts                     ✅ 完成
│   └── bookmarks.ts                  ❌ 未作成 (Phase 2)
├── components/
│   ├── subscription/
│   │   ├── PlanCard.tsx              ✅ 完成
│   │   ├── PlanComparison.tsx        ✅ 完成
│   │   ├── SubscriptionHeader.tsx    ✅ 完成
│   │   ├── SubscriptionButton.tsx    ✅ 完成
│   │   └── SubscriptionGuard.tsx     ✅ 完成
│   ├── account/
│   │   └── SubscriptionInfo.tsx      ✅ 完成
│   ├── article/
│   │   ├── ArticleVideo.tsx          ⏳ プレミアムロック未実装
│   │   └── ArticleContent.tsx        ⏳ プレビュー制御未実装
│   ├── lesson/
│   │   └── ContentItem.tsx           ⏳ ロックアイコン未実装
│   └── premium/
│       ├── PremiumVideoLock.tsx      ❌ 未作成
│       ├── ContentPreviewOverlay.tsx ❌ 未作成
│       └── PremiumCTA.tsx            ❌ 未作成
└── utils/
    ├── subscriptionPlans.ts          ✅ 完成
    └── premiumAccess.ts              ❌ 未作成 (Phase 6)
```

### バックエンド (Supabase Edge Functions)
```
supabase/functions/
├── create-checkout/                  ✅ デプロイ済み (v133)
│   └── index.ts
├── stripe-webhook/                   ✅ デプロイ済み (v128)
│   └── index.ts
├── check-subscription/               ✅ デプロイ済み (v127)
│   └── index.ts
├── create-customer-portal/           ✅ デプロイ済み (v5)
│   └── index.ts
└── update-subscription/              ✅ デプロイ済み (v1) - 未使用
    └── index.ts
```

### データベーステーブル
```
Supabase Tables:
├── user_subscriptions                ✅ 作成済み
│   ├── user_id (FK)
│   ├── stripe_subscription_id
│   ├── stripe_customer_id
│   ├── plan_type (standard/feedback)
│   ├── duration (1 or 3)             ⚠️ マイグレーション確認が必要
│   └── is_active
├── subscriptions                     ✅ 作成済み
├── stripe_customers                  ✅ 作成済み
├── article_bookmarks                 ✅ 作成済み (Phase 2)
├── lesson_progress                   ✅ 作成済み (Phase 5)
└── article_progress                  ✅ 作成済み (Phase 4)
```

---

## 🎯 推奨される実装優先順位

### フェーズ1: 緊急バグ修正（1-2日）
1. **データベースマイグレーション確認**
   - `duration`カラムが存在するか確認
   - なければマイグレーション実行

2. **二重課金の調査と修正**
   - Webhookログを確認
   - `replace_subscription_id`処理の修正
   - 既存の二重課金を手動で修正

3. **期間変更の修正**
   - `Subscription.tsx`の`isCurrentPlan`判定にdurationを追加
   - `SubscriptionContext`にduration情報を追加

4. **テストアカウントのクリーンアップ**
   - kyasya00@gmail.comのデータを削除

5. **`/subscription/success` ページ作成**
   - 決済成功後のページを作成
   - SubscriptionContextをリフレッシュ

---

### フェーズ2: 設計改善（2-3日）
**選択肢A: Customer Portal統合（推奨）**
- `Subscription.tsx`で既存契約者の判定
- 既存契約者には「プラン管理」ボタンを表示してCustomer Portalへ遷移
- 新規ユーザーは現在のCheckoutフローを維持

**選択肢B: Checkoutフローの改善**
- 既存サブスクリプションのキャンセル処理を確実に動作させる
- プラン差分表示の追加（実装が複雑）

---

### フェーズ3: プレミアムコンテンツ制御（Phase 6）（3-5日）
1. **アクセス権限判定**
   - `SubscriptionContext`に`canAccessContent(isPremium: boolean)`を追加
   - `utils/premiumAccess.ts`作成

2. **ArticleDetail - 動画ロック**
   - `ArticleVideo.tsx`にプレミアムロック状態を追加
   - `PremiumVideoLock.tsx`コンポーネント作成

3. **ArticleDetail - コンテンツプレビュー**
   - `ArticleContent.tsx`にブロック数制限
   - `ContentPreviewOverlay.tsx`作成 (グラデーション + CTA)

4. **LessonDetail - ロックアイコン**
   - `ContentItem.tsx`にロックアイコン表示
   - Sanityクエリに`isPremium`追加

5. **Sanity設定**
   - 記事スキーマに`isPremium`フィールド追加（既存の場合はスキップ）

---

### フェーズ4: 進捗管理機能（Phase 2-5）（5-7日）
1. **Phase 2: ブックマーク機能**
   - `src/services/bookmarks.ts`作成
   - ArticleDetailにブックマークボタン追加

2. **Phase 4: 記事進捗追跡**
   - 視聴時間トラッキング実装

3. **Phase 5: レッスン進捗管理**
   - 進捗率計算ロジック
   - ArticleSideNavにプログレスバー追加

---

## 📝 確認が必要な事項

### 1. データベースマイグレーション
**確認SQL**:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_subscriptions' AND column_name = 'duration';
```

**期待される結果**: `duration | integer`

### 2. Stripe Webhook設定
**確認場所**: https://dashboard.stripe.com/test/webhooks

**設定すべきイベント**:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.paid`
- ⚠️ `customer.subscription.updated` (現在のコードでは未使用)

### 3. 環境変数
**フロントエンド (.env)**:
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY`
- ✅ `VITE_STRIPE_STANDARD_1M_PRICE_ID`
- ✅ `VITE_STRIPE_STANDARD_3M_PRICE_ID`
- ✅ `VITE_STRIPE_FEEDBACK_1M_PRICE_ID`
- ✅ `VITE_STRIPE_FEEDBACK_3M_PRICE_ID`

**Supabase Edge Functions**:
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`

---

## 🎉 完了状態の定義

### Phase 6完了時の状態
- ✅ プレミアムコンテンツが適切にロックされる
- ✅ 無料ユーザーにプレミアムCTAが表示される
- ✅ 有料ユーザーは全コンテンツにアクセス可能
- ✅ Stripe連携が正常に動作
- ✅ プラン変更が正しく動作（二重課金なし）
- ✅ 期間変更が可能
- ✅ Customer Portalでプラン管理が可能

---

## 🔗 参考ドキュメント

1. `.claude/docs/progress-and-subscription-plan.md` - 全体計画
2. `.claude/docs/subscription-page-specification.md` - サブスクリプションページ仕様
3. `.claude/docs/phase6-premium-content-implementation.md` - プレミアムコンテンツ実装計画
4. `.claude/docs/subscription-issues-analysis.md` - 問題分析
5. `.claude/docs/subscription-test-report.md` - テストレポート
6. `.claude/docs/phase2-bookmark-feature.md` - ブックマーク機能
7. `.claude/docs/phase5-lesson-progress.md` - レッスン進捗管理

---

## 📊 完了率

- **Phase 1 (データベース設計)**: 90% (durationカラムの確認が必要)
- **Phase 2 (ブックマーク)**: 20% (テーブルのみ)
- **Phase 3 (記事進捗)**: 0%
- **Phase 4 (記事進捗追跡)**: 0%
- **Phase 5 (レッスン進捗)**: 20% (テーブルのみ)
- **Phase 6 (プレミアムコンテンツ)**: 60% (Stripe連携は完了、表示制御が未実装)

**全体進捗**: 約 30%

---

## 💡 次のアクションアイテム

### 🚀 今すぐ実装を始める
**👉 [subscription-fix-plan.md](./subscription-fix-plan.md) を開いて、ステップ1から開始してください**

このドキュメントでは以下が提供されています:
- ✅ 6つのステップに分かれた具体的な修正手順
- ✅ 各ステップのコード例とテスト方法
- ✅ 完了条件とチェックリスト
- ✅ 所要時間の目安

### 実装の優先順位（再掲）

#### フェーズ1: 緊急バグ修正（今日～明日）
1. データベースの`duration`カラム存在確認（5分）
2. 二重課金の原因調査（30分）
3. 期間変更の修正（30分）
4. `/subscription/success`ページ作成（45分）
5. チェックアウトのcancel_url修正（15分）
6. テストアカウントクリーンアップ（10分）

**詳細**: `subscription-fix-plan.md` の「フェーズ1」を参照

#### フェーズ2: 二重課金の根本修正（明日～明後日）
- オプションA: Webhookの修正
- オプションB: Customer Portal統合（推奨）

**詳細**: `subscription-fix-plan.md` の「フェーズ2」を参照

#### Phase 6: プレミアムコンテンツ制御（次週）
1. アクセス権限判定の実装
2. ArticleDetail - 動画ロック
3. ArticleDetail - コンテンツプレビュー
4. LessonDetail - ロックアイコン

**詳細**: `phase6-premium-content-implementation.md` を参照

#### Phase 2-5: 進捗管理機能（次々週以降）
- ブックマーク機能
- 記事進捗追跡
- レッスン進捗管理

**詳細**: 各Phaseドキュメントを参照

---

## 📖 このドキュメントの使い方

1. **現状把握**: このドキュメント全体を読んで実装状況を理解
2. **問題確認**: 「現在の問題点」セクションで何が壊れているか確認
3. **実装開始**: `subscription-fix-plan.md` を開いてステップ1から実装
4. **進捗記録**: `subscription-fix-plan.md` のチェックリストで進捗を記録

---

**作成者**: Claude Code
**作成日**: 2025-11-16
**役割**: 現状把握と問題点の整理
**次のステップ**: `subscription-fix-plan.md` で実装を開始
