# 実装計画チケット

## 🗓️ 全体スケジュール

### 推定期間: **3-5日**
### 担当者: **きかく**

```
Day 1    Day 2    Day 3    Day 4    Day 5
├────────┼────────┼────────┼────────┼────────┤
│Jest環境 │ESLint  │ESLint  │バリデ   │総合テスト│
│修正     │Critical│High    │ーション │・仕上げ  │
│(0.5日)  │修正    │修正    │修正     │(0.5日)  │
│         │(1日)   │(1-2日) │(1日)    │         │
└────────┴────────┴────────┴────────┴────────┘
```

## 🎯 実装フェーズ

### Phase 1: 基盤修正（Day 1前半）
**目標**: テスト・ビルド環境の安定化

#### ✅ Jest環境修正
- **工数**: 0.5日
- **依存**: なし
- **リスク**: 低
- **成功条件**: `npm test` が正常実行

```bash
# 実行内容
npm install --save-dev jest-environment-jsdom
npm test  # 動作確認
```

### Phase 2: Critical修正（Day 1後半）
**目標**: サービス動作に影響する重大エラーの解消

#### ✅ React Hooks修正（3件）
- **工数**: 1日
- **依存**: なし
- **リスク**: 中（動作への影響可能性）
- **成功条件**: React Hooksエラー 0件

**修正対象**:
- `ContentGuard.tsx` - useEffect条件付き呼び出し
- `TaskDetailPage.tsx` - useTaskDetail条件付き呼び出し
- `TrainingDetail.tsx` - useTrainingDetail, useEffect条件付き呼び出し

### Phase 3: 型安全性改善（Day 2-3）
**目標**: TypeScript型エラーの段階的解消

#### 🔄 TypeScript Any型修正（58件）
- **工数**: 2-3日（ファイル毎に段階的）
- **依存**: Phase 2完了
- **リスク**: 中（型定義の複雑性）
- **成功条件**: any型エラー < 10件

**修正順序（優先度順）**:
1. **Markdownレンダリング系** (Day 2前半)
   - `ContentSection.tsx` (6件)
   - `MarkdownRenderer.tsx` (8件)
   - `MdxPreview.tsx` (8件)

2. **サービス層** (Day 2後半)
   - `src/services/auth.ts` (6件)
   - `src/services/training/` (8件)

3. **Edge Functions** (Day 3前半)
   - `supabase/functions/` (15件)

### Phase 4: コード品質向上（Day 4前半）
**目標**: 残りのエラー・警告の解消

#### ⚡ その他修正（31件）
- **工数**: 1日
- **依存**: Phase 3完了
- **リスク**: 低
- **成功条件**: 全エラー 0件

**修正内容**:
- useEffect依存配列修正 (5件)
- Import方式統一 (2件)
- 空インターフェース修正 (2件)
- Fast Refresh警告解消 (10件)

### Phase 5: バリデーション修正（Day 4後半）
**目標**: CI/CDパイプラインの完全復旧

#### 🔧 バリデーションスクリプト修正
- **工数**: 1日
- **依存**: Phase 2完了（スクリプトの並列実行可能）
- **リスク**: 中（環境固有の問題可能性）
- **成功条件**: 全バリデーション通過

### Phase 6: 総合テスト（Day 5）
**目標**: 修正内容の最終確認

#### ✅ 統合テスト・仕上げ
- **工数**: 0.5日
- **依存**: 全Phase完了
- **リスク**: 低
- **成功条件**: CI/CD完全通過

## 📊 進捗管理

### デイリー進捗確認
```
□ Day 1 AM: Jest環境修正完了
□ Day 1 PM: React Hooks修正完了
□ Day 2 AM: Markdownレンダリング型修正完了
□ Day 2 PM: サービス層型修正完了
□ Day 3 AM: Edge Functions型修正完了
□ Day 3 PM: その他修正開始
□ Day 4 AM: その他修正完了
□ Day 4 PM: バリデーション修正完了
□ Day 5: 総合テスト・仕上げ完了
```

### 修正完了の判定指標
```bash
# Phase 1完了確認
npm test                    # Jest正常実行

# Phase 2完了確認  
npm run lint | grep "react-hooks"  # 0件確認

# Phase 3完了確認
npm run lint | grep "no-explicit-any"  # <10件確認

# Phase 4完了確認
npm run lint                # 全エラー0件確認

# Phase 5完了確認
./scripts/run-all-validations.sh  # 正常終了確認

# Phase 6完了確認
# CI/CDパイプライン全通過確認
```

## ⚠️ リスク管理

### 高リスク要因と対策

#### 1. React Hooks修正の複雑性（Phase 2）
**リスク**: 条件付きHooks呼び出しの修正が複雑化
**対策**: 
- 各ファイル毎に動作確認必須
- 修正前にコンポーネントの動作パターンを整理
- バックアップブランチ作成

#### 2. 型定義の波及影響（Phase 3）
**リスク**: any型修正が他ファイルに波及
**対策**:
- 段階的修正（ファイル毎に完結）
- 各修正後に`npm run build`で確認
- TypeScript strict modeの段階的適用

#### 3. Edge Functions動作影響（Phase 3）
**リスク**: Edge Functions修正がAPI動作に影響
**対策**:
- ローカル環境でSupabase Functions実行テスト
- /trainingページでのデータ取得確認
- 修正前後でのレスポンス比較

### 緊急時のロールバック計画

#### ロールバック判断基準
- `/training`ページが表示されない
- データ取得（Edge Functions）が失敗
- ビルドが失敗する

#### ロールバック手順
```bash
# 1. 現在の作業をステージング
git add .
git stash

# 2. 安定版に戻す
git checkout main
git pull origin main

# 3. デプロイ確認
npm run build
npm run dev  # /trainingページ確認

# 4. 問題分析と再計画
```

## 🔄 修正フロー

### 各Phase共通の作業手順
```bash
# 1. 作業ブランチ作成
git checkout -b fix/phase-X-description

# 2. 修正実装
# ... ファイル修正

# 3. ローカル確認
npm run lint          # エラー確認
npm run build         # ビルド確認  
npm run dev          # 動作確認（/training）

# 4. コミット
git add .
git commit -m "fix: Phase X - 修正内容の要約"

# 5. プッシュ・PR作成
git push origin fix/phase-X-description
# GitHubでPR作成、CI/CD確認

# 6. マージ
# CI/CD通過後にmainにマージ
```

## 📈 品質指標

### 修正前ベースライン
- ESLintエラー: 92件
- ESLint警告: 10件
- Jestテスト: 失敗
- バリデーション: 失敗
- CI/CD: ❌ 失敗

### 目標指標
- ESLintエラー: 0件
- ESLint警告: 0件
- Jestテスト: ✅ 通過
- バリデーション: ✅ 通過  
- CI/CD: ✅ 完全通過

### 中間指標（Phase毎）
- Phase 1後: Jestテスト通過
- Phase 2後: React Hooksエラー 0件
- Phase 3後: TypeScriptエラー < 10件
- Phase 4後: 全エラー 0件
- Phase 5後: バリデーション通過

## 🔗 関連ドキュメント

- [Jest環境修正詳細](./jest-environment.md)
- [ESLint修正詳細](./eslint-fixes.md)
- [バリデーション修正詳細](./validation-scripts.md)
- [テストチェックリスト](./testing-checklist.md)

---
**作成日**: 2025-08-05  
**担当者**: きかく  
**ステータス**: 🟡 実装待ち

**重要**: 各Phase完了時に必ず`/training`ページの動作確認を実施