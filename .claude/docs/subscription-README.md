# サブスクリプション機能 ドキュメントガイド

**最終更新**: 2025-11-17

このガイドは、サブスクリプション関連のドキュメントをすばやく見つけるためのものです。

---

## 🚀 クイックスタート

### 決済機能の完全実装を進めたい ⭐ **最新**
**👉 [subscription-complete-plan.md](./subscription-complete-plan.md)** - 新規登録、プラン変更、解約の全機能を実装

### 進捗状況を確認したい
**👉 [subscription-progress-tracker.md](./subscription-progress-tracker.md)** - 現在83%完了（ステップ1-5）

### まず全体を把握したい
**👉 [subscription-implementation-summary.md](./subscription-implementation-summary.md)** - 現状を理解

---

## 📚 ドキュメント一覧

### 🎯 実装・修正作業用（優先度：高）

#### 1. [subscription-fix-plan.md](./subscription-fix-plan.md) ⭐⭐⭐
**役割**: 具体的な実装手順とコード例
**いつ使う**: 今すぐコードを修正したい時
**内容**:
- フェーズ1: 緊急バグ修正（6ステップ）
  - データベース確認
  - 二重課金の調査
  - 期間変更の修正
  - Successページ作成
  - チェックアウト修正
  - テストアカウントクリーンアップ
- フェーズ2: 二重課金の根本修正
  - オプションA: Webhookの修正
  - オプションB: Customer Portal統合（推奨）
- 各ステップのコード例、テスト方法、完了条件

**所要時間**: フェーズ1（2-3時間）、フェーズ2（1-2時間）

---

#### 2. [subscription-implementation-summary.md](./subscription-implementation-summary.md) ⭐⭐⭐
**役割**: 現状の把握と問題点の整理
**いつ使う**: 最初に全体を理解したい時
**内容**:
- 実装状況の全体像
  - ✅ 完了済みの機能（約30%）
  - 🔨 実装中の機能
  - ❌ 未実装の機能
- 現在の問題点（優先度別）
  - 🔴 優先度：高（二重課金、期間変更など）
  - 🟡 優先度：中（UX問題）
  - 🔵 その他
- ファイル構成
- 推奨される実装優先順位
- 完了率

**所要時間**: 読むだけなら15分

---

### 📖 背景・詳細仕様（参考資料）

#### 3. [progress-and-subscription-plan.md](./progress-and-subscription-plan.md) ⭐⭐
**役割**: 全体計画（7フェーズ）
**いつ使う**: プロジェクト全体の設計を理解したい時
**内容**:
- Phase 1: データベース設計
- Phase 2: ブックマーク機能
- Phase 3: 記事進捗管理
- Phase 4: 記事進捗追跡
- Phase 5: レッスン進捗管理
- Phase 6: プレミアムコンテンツ & Stripe連携
- Phase 7: マイページ実装

---

#### 4. [subscription-page-specification.md](./subscription-page-specification.md) ⭐⭐
**役割**: サブスクリプションページの詳細仕様
**いつ使う**: `/subscription`ページの要件を確認したい時
**内容**:
- 現状の問題点（CORSエラー、プラン表示の不一致）
- プラン構成（Standard/Feedback、1ヶ月/3ヶ月）
- UIデザイン要件
- 機能要件（新規登録フロー、プラン変更フロー）
- 実装ステップ

---

#### 5. [phase6-premium-content-implementation.md](./phase6-premium-content-implementation.md) ⭐⭐
**役割**: プレミアムコンテンツ表示制御の実装計画
**いつ使う**: プレミアムコンテンツのロック機能を実装する時
**内容**:
- プラン構成（無料/スタンダード/フィードバック）
- プレミアムコンテンツ表示制御
  - ArticleDetailページの動画ロック
  - 記事コンテンツのプレビュー制御
  - LessonDetailページのロックアイコン
- Stripe連携
- 実装ステップ（Step 1-10）
- チェックリスト

---

### 🔍 問題分析・テスト結果

#### 6. [subscription-issues-analysis.md](./subscription-issues-analysis.md) ⭐
**役割**: 問題の詳細分析
**いつ使う**: 特定のバグについて詳しく知りたい時
**内容**:
- 根本原因の分析
- 発見された問題の一覧（優先度別）
- 根本的な解決策の提案
- 修正の優先順位と実行計画

---

#### 7. [subscription-test-report.md](./subscription-test-report.md) ⭐
**役割**: テスト結果の記録
**いつ使う**: 過去のテスト結果を確認したい時
**内容**:
- 前提条件の確認（DB、Webhook、環境変数）
- 機能テスト（UI動作、新規登録、プラン変更）
- エラーログ
- テスト結果サマリー

---

### 📝 個別機能の詳細

#### 8. [phase2-bookmark-feature.md](./phase2-bookmark-feature.md)
**役割**: ブックマーク機能の実装計画
**内容**: サービス層、UI実装、テスト手順

#### 9. [phase5-lesson-progress.md](./phase5-lesson-progress.md)
**役割**: レッスン進捗管理の実装計画
**内容**: 進捗計算ロジック、UI更新、データベース連携

---

## 📊 ドキュメントの関連図

```
subscription-README.md (このファイル)
    ↓
    ├── 【実装作業】
    │   ├── subscription-fix-plan.md ⭐⭐⭐
    │   │   └── 具体的な6ステップの修正手順
    │   │
    │   └── subscription-implementation-summary.md ⭐⭐⭐
    │       └── 現状と問題点の全体像
    │
    ├── 【背景・仕様】
    │   ├── progress-and-subscription-plan.md
    │   │   └── 7フェーズの全体計画
    │   │
    │   ├── subscription-page-specification.md
    │   │   └── /subscriptionページの詳細仕様
    │   │
    │   └── phase6-premium-content-implementation.md
    │       └── プレミアムコンテンツ実装計画
    │
    ├── 【問題分析】
    │   ├── subscription-issues-analysis.md
    │   │   └── バグの詳細分析
    │   │
    │   └── subscription-test-report.md
    │       └── テスト結果の記録
    │
    └── 【個別機能】
        ├── phase2-bookmark-feature.md
        └── phase5-lesson-progress.md
```

---

## 🎯 シチュエーション別ガイド

### ケース1: 今すぐバグを修正したい
1. このファイル（README）で問題の概要を把握
2. `subscription-fix-plan.md` を開く
3. ステップ1から順に実施
4. 各ステップの完了条件をチェック

---

### ケース2: プロジェクトに新しく参加した
1. `subscription-implementation-summary.md` で全体を把握
2. `progress-and-subscription-plan.md` で7フェーズの計画を理解
3. `subscription-fix-plan.md` で現在の作業内容を確認

---

### ケース3: 特定の機能（プレミアムコンテンツ）を実装したい
1. `subscription-implementation-summary.md` で現状確認
2. `phase6-premium-content-implementation.md` で詳細な手順を確認
3. 必要に応じて `subscription-fix-plan.md` のバグ修正を先に実施

---

### ケース4: テストで問題が見つかった
1. `subscription-test-report.md` で過去のテスト結果を確認
2. `subscription-issues-analysis.md` で同じ問題がないか確認
3. `subscription-fix-plan.md` で修正方法を確認

---

## 📋 実装の推奨フロー

### ステップ1: 現状把握（15分）
- [ ] `subscription-implementation-summary.md` を読む
- [ ] 完了済みの機能を確認
- [ ] 現在の問題点を把握

### ステップ2: 緊急バグ修正（2-3時間）
- [ ] `subscription-fix-plan.md` を開く
- [ ] フェーズ1の6ステップを実施
- [ ] 各ステップの完了条件を確認

### ステップ3: 根本修正（1-2時間）
- [ ] フェーズ2のオプションを選択
- [ ] 実装とテスト
- [ ] テスト結果を記録

### ステップ4: プレミアムコンテンツ（次のフェーズ）
- [ ] `phase6-premium-content-implementation.md` を確認
- [ ] Step 1-10を順に実施

---

## 🔧 よくある質問

### Q1: どのドキュメントから読めばいい？
**A**:
- **今すぐ実装したい** → `subscription-fix-plan.md`
- **まず全体を理解したい** → `subscription-implementation-summary.md`

### Q2: バグ修正にどのくらい時間がかかる？
**A**:
- フェーズ1（緊急バグ修正）: 2-3時間
- フェーズ2（根本修正）: 1-2時間
- 合計: 3-5時間

### Q3: どの順番で実装すべき？
**A**:
1. フェーズ1: 緊急バグ修正（必須）
2. フェーズ2: 二重課金の根本修正（必須）
3. Phase 6: プレミアムコンテンツ（重要）
4. Phase 2-5: 進捗管理機能（次フェーズ）

### Q4: テストはどこに記録する？
**A**:
- `subscription-fix-plan.md` の「進捗記録」セクション
- 問題が見つかったら `subscription-test-report.md` も更新

---

## 📞 困ったときは

1. **エラーが発生した**
   - `subscription-issues-analysis.md` で同じ問題を探す
   - `subscription-fix-plan.md` の該当ステップを再確認

2. **どうやって実装するかわからない**
   - `subscription-fix-plan.md` のコード例を参照
   - `phase6-premium-content-implementation.md` の詳細な手順を確認

3. **全体像がわからなくなった**
   - `subscription-implementation-summary.md` で現状を再確認
   - このREADMEの「ドキュメントの関連図」を見る

---

**作成者**: Claude Code
**作成日**: 2025-11-16
**目的**: サブスクリプション関連ドキュメントのナビゲーション
