# テスト・検証チェックリスト

## 🎯 全体テスト戦略

### テストレベル
1. **ユニットテスト**: 個別修正の動作確認
2. **統合テスト**: 複数修正の相互作用確認
3. **システムテスト**: 全体動作の最終確認
4. **CI/CDテスト**: パイプライン全体の通過確認

## 📋 Phase別テストチェックリスト

### Phase 1: Jest環境修正テスト

#### ✅ 基本動作確認
- [ ] `npm install --save-dev jest-environment-jsdom`が成功
- [ ] `package.json`に依存関係が追加されている
- [ ] `npm test`が正常に実行される
- [ ] エラーメッセージ`jest-environment-jsdom cannot be found`が解消

#### ✅ テスト実行確認
```bash
# 実行確認コマンド
npm test
npx jest src/__tests__/edge-functions/ --passWithNoTests --verbose
npx jest src/__tests__/integration/ --passWithNoTests --verbose
```

#### 🎯 成功条件
- [ ] 全テストコマンドがエラー終了しない
- [ ] Jest設定が正常に読み込まれる
- [ ] テスト環境が`jsdom`で動作する

---

### Phase 2: React Hooks修正テスト

#### ✅ コンポーネント動作確認

**ContentGuard.tsx**
- [ ] `/training`ページでコンポーネントが正常レンダリング
- [ ] 条件分岐ロジックが正しく動作
- [ ] useEffectが適切なタイミングで実行

**TaskDetailPage.tsx**  
- [ ] `/training/[slug]/[taskSlug]`ページが表示される
- [ ] データ取得が正常に行われる
- [ ] エラー状態の表示が適切

**TrainingDetail.tsx**
- [ ] `/training/[slug]`ページが表示される
- [ ] トレーニング詳細データが取得される
- [ ] ナビゲーションが正常動作

#### 🎯 成功条件
- [ ] React Hooksエラーが0件
- [ ] 全トレーニング関連ページが正常表示
- [ ] データ取得・表示に問題なし

---

### Phase 3: TypeScript型修正テスト

#### ✅ Markdownレンダリング系テスト

**ContentSection.tsx, MarkdownRenderer.tsx, MdxPreview.tsx**
- [ ] Markdownコンテンツが正常にレンダリング
- [ ] 型エラーが解消されている
- [ ] カスタムMarkdownコンポーネントが動作
- [ ] コードブロック、リンクなどの要素が正常表示

#### ✅ サービス層テスト

**auth.ts, training services**
- [ ] 認証機能が正常動作（ログイン状態の確認のみ）
- [ ] トレーニングデータ取得が正常動作
- [ ] エラーハンドリングが適切に動作
- [ ] 型エラーが解消されている

#### ✅ Edge Functionsテスト

**supabase/functions/**
```bash
# ローカルEdge Functions確認（可能であれば）
npx supabase functions serve
curl -X POST 'http://localhost:54321/functions/v1/get-training-list'
```

- [ ] Edge Functions型エラーが解消
- [ ] レスポンスデータ構造が正しい
- [ ] `/training`ページでデータが正常取得される

#### 🎯 成功条件
- [ ] TypeScript any型エラーが10件以下
- [ ] ビルドが正常に完了（`npm run build`）
- [ ] 全ページで型関連のランタイムエラーなし

---

### Phase 4: コード品質向上テスト

#### ✅ useEffect依存配列修正確認
- [ ] 関連コンポーネントで不要な再レンダリングが発生しない
- [ ] useEffectが適切なタイミングで実行される
- [ ] メモリリークが発生しない

#### ✅ Import方式統一確認
- [ ] ビルドが正常に完了
- [ ] 動的import（code splitting）が適切に動作
- [ ] バンドルサイズに大きな変化がない

#### 🎯 成功条件
- [ ] 全ESLintエラーが0件
- [ ] パフォーマンスに悪影響がない
- [ ] Fast Refresh警告が解消

---

### Phase 5: バリデーション修正テスト

#### ✅ スクリプト個別テスト
```bash
# 各スクリプトの個別実行テスト
./scripts/validate-training-content.sh
./scripts/validate-frontmatter.sh
./scripts/validate-data-consistency.sh
./scripts/check-image-resources.sh
```

#### ✅ 統合バリデーションテスト
```bash
# 全バリデーションスクリプト実行
./scripts/run-all-validations.sh
```

#### 🎯 成功条件
- [ ] 全バリデーションスクリプトが正常終了
- [ ] コンテンツ構造チェックが通過
- [ ] 画像リソースチェックが通過

---

## 🚀 最終統合テスト

### システム全体動作確認

#### ✅ フロントエンド動作テスト
```bash
# 開発環境起動
npm run dev
```

**主要ページ動作確認**
- [ ] `/training` - トレーニング一覧が表示される
- [ ] `/training/weekly-goal-tracker` - トレーニング詳細が表示される
- [ ] `/training/weekly-goal-tracker/explain` - タスク詳細が表示される
- [ ] アイコン画像が正しくローカルSVGで表示される

#### ✅ データ取得確認
- [ ] Edge Functions（get-training-list）からデータ取得
- [ ] Edge Functions（get-training-detail）からデータ取得
- [ ] Edge Functions（get-training-content）からデータ取得
- [ ] エラー時のフォールバック機能が動作

#### ✅ ビルド・デプロイテスト
```bash
# プロダクションビルド
npm run build

# 静的ファイル確認
npm run preview
```

- [ ] ビルドがエラーなしで完了
- [ ] 本番環境でページが正常表示（Vercel）
- [ ] 全アセット（画像、CSS、JS）が正常読み込み

---

## 🔄 CI/CDパイプラインテスト

### GitHub Actions完全通過確認

#### ✅ 全ワークフロー通過
- [ ] **CI Workflow**: ESLint、Jest、ビルドチェック全通過
- [ ] **Quality Gate**: コード品質チェック全通過  
- [ ] **Content Sync**: トレーニングコンテンツ同期成功
- [ ] **Image Resources**: 画像リソースチェック通過

#### ✅ Pull Request自動チェック
- [ ] PR作成時の自動チェックが全通過
- [ ] レビュー時の品質ゲートが機能
- [ ] マージ後のデプロイ自動実行

---

## 📊 品質指標の最終確認

### コマンド実行結果の確認

```bash
# ESLint完全通過確認
npm run lint
# Expected: ✨ All files pass linting! ✨

# TypeScript型チェック通過確認  
npx tsc --noEmit
# Expected: No errors found

# Jest全テスト通過確認
npm test
# Expected: All test suites passed

# ビルド成功確認
npm run build  
# Expected: ✓ built in Xs (no errors)

# バリデーション全通過確認
./scripts/run-all-validations.sh
# Expected: ✅ 全検証完了
```

### 最終品質指標
- [ ] ESLintエラー: **0件**
- [ ] ESLint警告: **0件**  
- [ ] TypeScriptエラー: **0件**
- [ ] Jestテスト: **全通過**
- [ ] バリデーション: **全通過**
- [ ] CI/CD: **全通過**

---

## ⚠️ 問題発生時の対応

### テスト失敗時のトラブルシューティング

#### Phase別問題対応

**Jest環境問題**
```bash
# 依存関係再インストール
rm -rf node_modules package-lock.json
npm install
```

**React Hooks問題**
- [ ] コンポーネントのレンダリング順序確認
- [ ] 条件分岐ロジックの再確認
- [ ] Hooksの呼び出し順序検証

**型定義問題**  
- [ ] TypeScriptバージョン確認
- [ ] 型定義ファイル（.d.ts）確認
- [ ] tsconfig.json設定確認

**バリデーション問題**
- [ ] スクリプト実行権限確認
- [ ] ファイルパス確認
- [ ] 環境変数設定確認

### 緊急時ロールバック判断
以下の場合は即座にロールバック：
- [ ] `/training`ページが表示されない
- [ ] データ取得が完全に失敗
- [ ] ビルドが失敗する
- [ ] Vercelデプロイが失敗

---

## 📝 テスト完了報告

### 完了報告フォーマット
```markdown
## CI/CDエラー修正 - テスト完了報告

### 修正完了項目
- ✅ Jest環境修正: 完了
- ✅ React Hooks修正: 完了（3件）
- ✅ TypeScript型修正: 完了（58件）
- ✅ その他修正: 完了（31件）
- ✅ バリデーション修正: 完了

### 品質指標
- ESLintエラー: 92件 → 0件
- ESLint警告: 10件 → 0件
- CI/CDパイプライン: ❌ → ✅

### 動作確認済みページ  
- /training: ✅
- /training/weekly-goal-tracker: ✅
- /training/weekly-goal-tracker/explain: ✅

### 備考
[特記事項があれば記載]
```

---
**作成日**: 2025-08-05  
**担当者**: きかく  
**ステータス**: 🟡 実装待ち

**重要**: 各Phaseテスト完了後、次Phase開始前に必ず中間報告を実施