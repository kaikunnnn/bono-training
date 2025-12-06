# Stripe実装の追加レビューポイント検討

**作成日**: 2025-11-20
**目的**: 中長期的な運用を見据えた追加の考慮事項を検討

---

## レビュー指摘の4つのポイント

### 1. Price IDの問題

#### 指摘内容
> Stripeでは、同じプランでもテスト環境と本番環境でPrice IDが異なる。
> コード内で定数で持っていると、本番環境に切り替えた瞬間にエラーになる。

#### 現状の実装確認

**環境変数の状況**:
```bash
# テスト環境用
STRIPE_TEST_STANDARD_1M_PRICE_ID
STRIPE_TEST_STANDARD_3M_PRICE_ID
STRIPE_TEST_FEEDBACK_1M_PRICE_ID
STRIPE_TEST_FEEDBACK_3M_PRICE_ID
# ...etc

# 本番環境用
STRIPE_STANDARD_1M_PRICE_ID
STRIPE_STANDARD_3M_PRICE_ID
STRIPE_FEEDBACK_1M_PRICE_ID
STRIPE_FEEDBACK_3M_PRICE_ID
# ...etc
```

**コードでの使用方法**（`create-checkout/index.ts:123-130`）:
```typescript
// 環境変数の命名規則: STRIPE_[TEST_]PLANTYPE_DURATION_PRICE_ID
const envPrefix = useTestPrice ? "STRIPE_TEST_" : "STRIPE_";
const planTypeUpper = planType.toUpperCase();
const durationSuffix = duration === 1 ? "1M" : "3M";
const envVarName = `${envPrefix}${planTypeUpper}_${durationSuffix}_PRICE_ID`;

priceId = Deno.env.get(envVarName);
```

#### 評価

**✅ 既に正しく実装されている**

- 環境変数で管理
- `useTestPrice`フラグで自動的に切り替え
- 本番環境に切り替えても問題なく動作する

#### 追加対応

**不要**

---

### 2. フロントエンドの「モード」制御

#### 指摘内容
> ユーザーがブラウザで操作している時、フロントエンドは「今テストモードなのか本番なのか」をどう判断するのか？

#### 現状の実装確認

**フロントエンド（`src/services/stripe.ts:26`）**:
```typescript
const useTestPrice = isTest || import.meta.env.MODE !== 'production';
```

**判定ロジック**:
- `import.meta.env.MODE` が `'production'` でない場合 → テストモード
- または明示的に`isTest`フラグが渡された場合 → テストモード

**Viteの環境変数**:
```bash
# 開発時（npm run dev）
import.meta.env.MODE = 'development' → useTestPrice = true

# 本番ビルド（npm run build）
import.meta.env.MODE = 'production' → useTestPrice = false
```

#### 評価

**⚠️ 部分的に実装されているが、改善の余地あり**

**問題点**:
1. 本番環境（`MODE='production'`）でもテストしたい場合に対応できない
2. 管理者が本番環境でテストモードを使いたい場合の仕組みがない

#### 追加対応の必要性

**現時点**: 不要（開発中のため）

**将来的な改善案**（本番運用後）:
1. 管理者フラグを持つユーザーは、UI上で「テストモード」を切り替えられるようにする
2. URLパラメータで`?test=true`のような形で明示的にテストモードを有効化

**今回の実装には含めない**（理由: 現在は開発段階で、本番運用後の機能として検討すべき）

---

### 3. 「メール誤送信」のリスク

#### 指摘内容
> テスト環境で操作しているつもりで、間違って本番ユーザーのメールアドレスを使ってしまい、謎の請求メールが届いてパニックになる事故が起きえる。

#### リスク分析

**Stripeから送信されるメール**:
1. 領収書メール
2. 支払い失敗通知
3. サブスクリプション更新通知

**Supabaseから送信されるメール**:
1. メール確認メール
2. パスワードリセットメール

#### 現状の対策

**データベースレベル**:
- テストユーザーと本番ユーザーは`environment`カラムで明確に分離される
- テストユーザーのメールアドレスは削除して新規登録するため、本番ユーザーと重複しない

**Stripeレベル**:
- テスト環境のStripe APIキーを使っている場合、**実際のメールは送信されない**（Stripeのテストモードはメール送信をシミュレートするだけ）

#### 評価

**✅ 現在の実装で十分に安全**

理由:
1. テスト環境のStripe APIは実際のメールを送信しない
2. データベースで環境が分離されている
3. テストユーザーは明示的に削除・再登録される

#### 追加対応

**念のための確認事項**:

1. **Stripe Dashboard（テスト環境）での設定確認**:
   - Settings → Emails で「テスト環境のメール送信」がオフになっているか確認
   - 通常はデフォルトでオフ

2. **テストユーザーのメールアドレス**:
   - `takumi.kai.skywalker@gmail.com` をそのまま使用可能
   - 必要に応じて`takumi.kai.skywalker+test@gmail.com`にすることも可能（Gmailの`+`エイリアス機能）

**推奨**: 現状のまま進める。念のためStripe Dashboardのメール設定を確認するだけ。

---

### 4. 究極の解決策：プロジェクト自体の分離

#### 指摘内容
> SupabaseとStripeのベストプラクティスは、「本番用プロジェクト」と「開発用プロジェクト」を完全に分けること。

```
my-app-prod (Supabase) ⇔ Stripe本番
my-app-dev (Supabase) ⇔ Stripeテスト
```

#### メリット・デメリット

**メリット**:
- 完全に分離されるため、事故のリスクがゼロ
- `WHERE environment = ...`のようなクエリ条件が不要
- 環境変数を差し替えるだけで済む

**デメリット**:
- Supabaseプロジェクトを2つ管理する必要がある
- データの移行が必要
- 設定（Edge Functions、RLS、トリガーなど）を2つ同期する必要がある
- コストが2倍（Supabaseの無料枠を超える場合）

#### 現状との比較

**現在の方針（environmentカラムで分離）**:
- ✅ 1つのプロジェクトで管理できる
- ✅ データ移行不要
- ✅ コストが増えない
- ⚠️ クエリに`environment`条件を追加する必要がある
- ⚠️ 本番データとテストデータが混在する

**プロジェクト分離**:
- ✅ 完全に分離される
- ✅ クエリ条件不要
- ❌ データ移行が必要
- ❌ 2つのプロジェクトを管理
- ❌ コストが増える可能性

#### 評価

**現時点での推奨**: **environmentカラムで分離（現在の方針）**

理由:
1. 現在は開発段階で、プロジェクト分離のコストが高い
2. データ移行（2,162件の顧客）のリスクがある
3. `environment`カラムで十分に安全に分離できる
4. 将来的に必要になったら、その時点でプロジェクト分離を検討すれば良い

#### 将来的な検討事項

以下の状況になったら、プロジェクト分離を再検討:
1. 開発チームが拡大し、複数人が同時に開発する
2. 本番データの量が膨大になり、テストデータと混在させたくない
3. 規制要件（GDPR、PCI DSSなど）で本番データとテストデータの物理的分離が必要になる

---

## 総合評価と結論

### 4つの指摘に対する対応状況

| 指摘 | 現状 | 追加対応 |
|-----|------|---------|
| 1. Price IDの問題 | ✅ 既に実装済み | **不要** |
| 2. フロントエンドのモード制御 | ⚠️ 部分的に実装 | **今回は不要**（将来的に検討） |
| 3. メール誤送信リスク | ✅ 十分に安全 | **念のため確認のみ** |
| 4. プロジェクト分離 | - | **今回は不要**（将来的に検討） |

### 今回の実装で追加対応が必要な項目

**なし**

現在の実装計画（environmentカラム + Webhook分離）で十分です。

### 念のための確認事項

実装開始前に以下を確認:

1. **Stripe Dashboard（テスト環境）のメール設定**:
   - https://dashboard.stripe.com/test/settings/emails
   - 「テスト環境のメール送信」がオフになっているか確認

2. **テストユーザーのメールアドレス**:
   - `takumi.kai.skywalker@gmail.com` のまま使用するか
   - `takumi.kai.skywalker+test@gmail.com` に変更するか

   → 推奨: そのまま使用（Stripeのテストモードは実際のメールを送信しないため）

---

## 最終的な実装計画（変更なし）

以下の計画で問題なく進められます：

1. データベーススキーマ変更（environmentカラム追加）
2. 環境変数の設定（TEST/LIVE分離、Webhook署名追加）
3. Edge Functions修正（Webhook分離、環境判定）
4. Stripe Dashboard設定（Webhook 2つ登録）
5. テストユーザー再登録

**追加の実装は不要**

---

## 次のステップ

上記の確認事項（Stripeのメール設定とテストユーザーのメールアドレス）について決定していただければ、実装を開始できます。

**質問**:
1. Stripeのテスト環境メール設定を確認しますか？（推奨: はい）
2. テストユーザーのメールアドレスはどうしますか？
   - A) そのまま `takumi.kai.skywalker@gmail.com` を使う
   - B) `takumi.kai.skywalker+test@gmail.com` に変更する

どちらでも問題ありません。
