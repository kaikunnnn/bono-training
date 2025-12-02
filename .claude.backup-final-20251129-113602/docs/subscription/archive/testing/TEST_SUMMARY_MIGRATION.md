# TEST_SUMMARY.md 移行ガイド

**作成日**: 2025-11-28
**目的**: 既存のTEST_SUMMARY.mdと新しいphase4-testing-guide.mdの関係を明確化

---

## 📋 ドキュメントの役割

### 既存: TEST_SUMMARY.md
**役割**: Option 3実装時のテスト記録・履歴

**内容**:
- ✅ Test 1: 新規登録（実施済み）
- ⏸️ Test 2A: Feedback → Standard（未実施）
- **⏸️ Test 2B: Standard → Feedback（今回の対象）**
- ⏸️ Test 3A: 期間変更 1ヶ月→3ヶ月（未実施）
- ⏸️ Test 3B: 期間変更 3ヶ月→1ヶ月（未実施）
- ⏸️ Test 4: キャンセル（未実施）
- ⏸️ Test 5: 二重課金防止（未実施）
- 📜 過去のバグ修正履歴（ブラウザバックバグ、Webhook環境変数バグ）

**特徴**:
- ✅ 実施結果の記録欄がある
- ✅ 過去の実施履歴が残っている
- ❌ **プロレーション確認モーダルのテストが含まれていない**（今回新規実装）

---

### 新規: phase4-testing-guide.md
**役割**: プロレーション確認モーダル実装のテストガイド

**内容**:
- **Phase 4-2: UIの目視確認**（新規）
  - モーダル表示確認
  - プロレーション計算表示確認
  - レスポンシブデザイン確認
  - 複数プランパターン確認
  - エッジケース確認
- **Phase 4-3: Test 2B実施**（既存Test 2Bの拡張版）
  - 10ステップの詳細フロー
  - **モーダル確認を含む**（新規）
  - Stripe Checkout確認
  - 二重課金確認
  - データベース確認

**特徴**:
- ✅ モーダルUIの詳細テスト手順
- ✅ プロレーション表示の検証方法
- ✅ スクリーンショット要件
- ✅ 問題発生時の対処方法
- ✅ テスト完了報告フォーマット

---

## 🔄 2つのドキュメントの関係

### 継承関係

```
TEST_SUMMARY.md (Option 3実装テスト)
  │
  ├─ Test 1: 新規登録 ✅ 実施済み
  │
  ├─ Test 2B: Standard → Feedback ⏸️ 未完了
  │    ↓
  │    【今回拡張】
  │    ↓
  └─ phase4-testing-guide.md (プロレーション表示追加)
       │
       ├─ Phase 4-2: UIの目視確認 【新規】
       │   └─ モーダル表示テスト
       │
       └─ Phase 4-3: Test 2B実施 【拡張】
           └─ Step 3: モーダル内容確認 【新規追加】
```

### 差分（何が変わったか）

#### Test 2Bの変更点

**従来のTest 2B（TEST_SUMMARY.md）**:
```
1. /subscription でプラン選択
2. Stripe Checkoutに遷移
3. プロレーション確認（Checkout画面で）← ❌ 実際は表示されない
4. 支払い完了
```

**新しいTest 2B（phase4-testing-guide.md）**:
```
1. 現在の状態確認
2. /subscription でプラン選択
3. ✨ モーダル表示確認（プロレーション表示）← 🆕 追加
4. 確定ボタンクリック
5. Stripe Checkoutに遷移
6. 支払い完了
7. 変更後の状態確認（詳細）
8. Stripeダッシュボード確認
9. Edge Functionログ確認
10. データベース確認
```

---

## 📝 推奨される使い分け

### TEST_SUMMARY.md の使い方
**用途**: テスト実施結果の記録・履歴管理

**更新タイミング**:
1. Test 2B完了時に結果を記入
2. 新しいバグを発見した時に「既知の問題」セクションに追加
3. 他のテスト（Test 2A, 3A, 3B, 4, 5）を実施した時に結果を記入

**メンテナンス**:
- ✅ **継続使用を推奨**
- ✅ 過去の履歴・バグ情報が貴重
- ✅ 全体的なテスト進捗管理に有用

---

### phase4-testing-guide.md の使い方
**用途**: プロレーション確認モーダルのテスト手順書

**使用タイミング**:
1. Phase 4-2（UIの目視確認）実施時
2. Phase 4-3（Test 2B実施）実施時
3. モーダルUIに問題が発生した時のデバッグ

**メンテナンス**:
- ✅ **テスト手順のマスター**として保持
- ✅ 今後のリグレッションテスト時にも使用
- ✅ 他の開発者がテストする時のガイドとして活用

---

## 🔧 TEST_SUMMARY.md の更新案

### Option 1: Test 2Bセクションにリンク追加（推奨）

```markdown
### Test 2B: プラン変更 - アップグレード（Standard → Feedback）

**重要**: プロレーション確認モーダルが追加されました（2025-11-28）

**詳細テストガイド**: `.claude/docs/subscription/plans/phase4-testing-guide.md`

**目的**: プラン変更（低 → 高）でプロレーションが正しく計算されることを確認

**前提条件**:
- アクティブなスタンダードプラン（1ヶ月）

**手順**:
1. `/subscription` でフィードバック 1ヶ月を選択
2. ✨ **プラン変更確認モーダルが表示される**（新規）
3. モーダル内でプロレーション（差額）を確認
4. 「プラン変更を確定」ボタンをクリック
5. Stripe Checkout画面に遷移
6. 支払い完了
7. `/subscription?updated=true` にリダイレクト

**検証項目**:
- [×] ✨ プラン変更確認モーダルが表示される
- [×] ✨ プロレーション計算が正しく表示される（返金額、新規請求額、合計）
- [×] Checkout に「Subscribe to グロースプラン」ではなく**プラン更新**の表示
- [ ] Stripe に**1つだけ**アクティブなサブスク（フィードバック）
- [ ] 旧サブスク（スタンダード）がキャンセル済み
- [ ] DB: `plan_type='feedback'`, `is_active=true`
- [ ] Webhook 200 OK

**詳細手順**: `phase4-testing-guide.md` の「Phase 4-3: Test 2B実施」参照
```

### Option 2: 目次にリンク追加

```markdown
## 📋 テスト一覧（詳細）

**プロレーション確認モーダル実装（2025-11-28）**:
- 詳細テストガイド: `.claude/docs/subscription/plans/phase4-testing-guide.md`
- Phase 4-2: UIの目視確認
- Phase 4-3: Test 2B実施（拡張版）

---

### Test 1: ログイン済みユーザーの新規登録
...
```

### Option 3: 新セクション追加

```markdown
## 🆕 プロレーション確認モーダル（2025-11-28実装）

### 概要
Option 2（Option 3 + 独自UI確認モーダル）の実装により、プラン変更時にプロレーション（差額）を事前に確認できるモーダルが追加されました。

### テストガイド
**詳細**: `.claude/docs/subscription/plans/phase4-testing-guide.md`

**テスト内容**:
- Phase 4-2: UIの目視確認（8テストケース）
- Phase 4-3: Test 2B実施（10ステップ）

### 実装内容
- ファイル作成:
  - `src/utils/prorationCalculator.ts`
  - `src/components/subscription/PlanChangeConfirmModal.tsx`
  - `src/utils/__tests__/prorationCalculator.test.ts`
- ファイル修正:
  - `src/utils/subscriptionPlans.ts`
  - `src/pages/Subscription.tsx`

### ユニットテスト
- ✅ 13テストケース全パス
- 計算ロジック検証済み

---

## 📋 テスト一覧（詳細）
...
```

---

## ✅ 推奨アクション

### 短期（今すぐ）
1. **TEST_SUMMARY.mdにリンク追加**（Option 1推奨）
   - Test 2Bセクションに`phase4-testing-guide.md`へのリンクを追加
   - 検証項目にモーダル関連の項目を追加

2. **phase4-testing-guide.mdで実施**
   - Phase 4-2: UIの目視確認
   - Phase 4-3: Test 2B実施

3. **TEST_SUMMARY.mdに結果記入**
   - Test 2Bの結果記入欄に実施日時・結果を記録
   - スクリーンショットへのリンクを追加

### 中期（Test 2B完了後）
4. **TEST_SUMMARY.mdを更新**
   - Test 2Bを「✅ 完了」にマーク
   - 実施結果を「📜 テスト履歴」セクションに追加

5. **他のテストも実施**
   - Test 2A, 3A, 3B, 4, 5を順次実施
   - それぞれ結果をTEST_SUMMARY.mdに記録

### 長期（全テスト完了後）
6. **統合サマリー作成**（オプション）
   - 全テスト完了後、総合レポートを作成
   - Option 2実装の成功を文書化

---

## 📂 ドキュメント構成（推奨）

```
.claude/docs/subscription/
├── plans/
│   ├── plan-change-modal-implementation.md  # 実装仕様
│   ├── implementation-progress.md           # 実装進捗
│   └── phase4-testing-guide.md             # テストガイド（新規）
│
├── testing/
│   ├── TEST_SUMMARY.md                      # テスト記録・履歴（既存）
│   ├── user-flow-test.md                    # 全体テスト計画
│   └── screenshots/
│       └── phase4/                          # 今回のスクリーンショット
│           ├── 01-before-change.png
│           ├── 02-modal-proration.png
│           └── ...
│
└── issues/
    ├── 2025-11-28-webhook-environment-bug.md
    ├── browser-back-bug-analysis.md
    └── ...
```

---

## 🎯 まとめ

### TEST_SUMMARY.md
- **役割**: テスト実施結果の記録・履歴管理
- **継続使用**: ✅ 推奨
- **更新内容**: Test 2Bセクションにリンク追加、検証項目追加

### phase4-testing-guide.md
- **役割**: プロレーション確認モーダルのテスト手順書
- **使用目的**: Phase 4-2, 4-3の実施ガイド
- **位置づけ**: TEST_SUMMARY.mdから参照される詳細ガイド

### 関係性
- TEST_SUMMARY.md（親）→ phase4-testing-guide.md（子・詳細）
- TEST_SUMMARY.mdで全体管理、phase4-testing-guide.mdで詳細手順
- **両方を併用することで完全なテスト体制**

---

**作成日**: 2025-11-28
**次のアクション**: TEST_SUMMARY.mdにリンク追加 → Phase 4-2, 4-3実施
