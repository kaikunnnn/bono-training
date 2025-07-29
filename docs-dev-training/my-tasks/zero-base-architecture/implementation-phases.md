# 実装フェーズ計画

## 全体ロードマップ

<lov-mermaid>
gantt
    title ゼロベーストレーニングサービス実装計画
    dateFormat  YYYY-MM-DD
    section Phase 1: 基盤構築
    型定義・スキーマ設計    :phase1-1, 2024-08-01, 3d
    データローダー実装      :phase1-2, after phase1-1, 2d
    バリデーション実装      :phase1-3, after phase1-2, 2d
    
    section Phase 2: コア機能
    コンテンツサービス      :phase2-1, after phase1-3, 4d
    アクセス制御システム    :phase2-2, after phase2-1, 3d
    進捗管理システム        :phase2-3, after phase2-2, 4d
    
    section Phase 3: UI・最適化
    UI コンポーネント       :phase3-1, after phase2-3, 5d
    パフォーマンス最適化    :phase3-2, after phase3-1, 3d
    テスト・ドキュメント    :phase3-3, after phase3-2, 2d
</lov-mermaid>

## Phase 1: 基盤構築 (1週間)

### 目標
- 型安全なデータ管理基盤の構築
- 設定ベースのコンテンツ管理システム
- 実行時バリデーションの実装

### Day 1-3: 型定義・スキーマ設計

#### 作業内容
1. **基底型定義の作成**
   - `src/types/base.ts` - プリミティブ型・共通型
   - `src/types/content.ts` - コンテンツ関連型
   - `src/types/subscription.ts` - サブスクリプション型
   - `src/types/progress.ts` - 進捗管理型

2. **Zodスキーマ実装**
   - `src/schemas/training.ts` - トレーニング・タスクスキーマ
   - `src/schemas/config.ts` - 設定ファイルスキーマ
   - `src/schemas/validation.ts` - バリデーション関数

3. **設定ファイル構造の確立**
   ```
   content/
   ├── config/
   │   ├── trainings.yml
   │   ├── skills.yml
   │   └── categories.yml
   ```

#### チェックポイント
- [ ] すべての型定義が完了している
- [ ] Zodスキーマが全型をカバーしている
- [ ] 設定ファイルのサンプルが動作する
- [ ] TypeScriptコンパイルエラーが0件

### Day 4-5: データローダー実装

#### 作業内容
1. **ローダークラス実装**
   - `ConfigLoader` - 設定ファイル読み込み
   - `TrainingLoader` - トレーニングデータ読み込み
   - `TaskLoader` - タスクデータ読み込み

2. **キャッシュ機構実装**
   - メモリキャッシュ
   - 無効化戦略
   - エラーハンドリング

3. **並行処理最適化**
   - Promise.all による並行読み込み
   - 依存関係の管理
   - パフォーマンス測定

#### チェックポイント
- [ ] 全ローダーが正常に動作する
- [ ] キャッシュが適切に機能する
- [ ] エラー時の適切な fallback が動作する
- [ ] パフォーマンステストをパスする

### Day 6-7: バリデーション実装

#### 作業内容
1. **バリデーション関数実装**
   - 個別データ検証
   - 整合性チェック
   - カスタムバリデーション

2. **エラーハンドリング**
   - 詳細なエラーメッセージ
   - 開発者向けデバッグ情報
   - ユーザー向けエラー表示

3. **テスト実装**
   - ユニットテスト
   - 統合テスト
   - エラーケーステスト

#### チェックポイント
- [ ] 全バリデーションが適切に動作する
- [ ] エラーメッセージが分かりやすい
- [ ] テストカバレッジ90%以上
- [ ] パフォーマンス要件を満たす

## Phase 2: コア機能実装 (1-2週間)

### 目標
- コンテンツ配信システムの実装
- アクセス制御機能の実装
- ユーザー進捗管理システムの構築

### Day 8-11: コンテンツサービス実装

#### 作業内容
1. **ContentService 実装**
   ```typescript
   // src/services/content/ContentService.ts
   - getTrainings()
   - getTrainingDetail()
   - getTaskDetail()
   ```

2. **ContentProcessor 実装**
   ```typescript
   // src/services/content/ContentProcessor.ts
   - processMarkdown()
   - processPremiumSections()
   - generatePreviewContent()
   ```

3. **Edge Functions 実装**
   ```typescript
   // supabase/functions/get-training-content/
   - コンテンツ取得API
   - アクセス制御統合
   - キャッシュ戦略
   ```

#### 成果物
- [ ] トレーニング一覧取得機能
- [ ] トレーニング詳細表示機能
- [ ] タスク詳細表示機能
- [ ] Markdownレンダリング機能
- [ ] プレミアムコンテンツ制御

### Day 12-14: アクセス制御システム

#### 作業内容
1. **SubscriptionService 拡張**
   ```typescript
   // src/services/subscription/SubscriptionService.ts
   - getUserSubscription()
   - validateStripeSubscription()
   - syncSubscriptionStatus()
   ```

2. **AccessService 実装**
   ```typescript
   // src/services/subscription/AccessService.ts
   - hasContentAccess()
   - hasTaskAccess()
   - checkUnlockCondition()
   ```

3. **React Guards 実装**
   ```typescript
   // src/components/subscription/ContentGuard.tsx
   - アクセス制御コンポーネント
   - プレミアムバナー
   - アンロック条件表示
   ```

#### 成果物
- [ ] サブスクリプション状況取得
- [ ] コンテンツレベルアクセス制御
- [ ] タスクアンロック条件実装
- [ ] UI レベルでの権限表示

### Day 15-18: 進捗管理システム

#### 作業内容
1. **ProgressService 実装**
   ```typescript
   // src/services/progress/ProgressService.ts
   - updateTaskProgress()
   - getUserProgress()
   - calculateProgressSummary()
   ```

2. **SkillService 実装**
   ```typescript
   // src/services/progress/SkillService.ts
   - addSkillExperience()
   - getUserSkills()
   - calculateSkillLevel()
   ```

3. **データベース実装**
   ```sql
   -- Database migrations
   - user_progress テーブル
   - training_completions テーブル
   - skill_progress テーブル
   - learning_sessions テーブル
   ```

#### 成果物
- [ ] タスク進捗管理
- [ ] スキル進捗計算
- [ ] 学習セッション記録
- [ ] リアルタイム進捗同期

## Phase 3: UI実装・最適化 (1週間)

### 目標
- ユーザーインターフェースの実装
- パフォーマンス最適化
- テスト・ドキュメント整備

### Day 19-23: UI コンポーネント実装

#### 作業内容
1. **Training 関連コンポーネント**
   ```typescript
   // src/components/training/
   - TrainingGrid
   - TrainingDetail
   - TaskPage
   - ProgressIndicator
   ```

2. **Progress 関連コンポーネント**
   ```typescript
   // src/components/progress/
   - ProgressDashboard
   - SkillProgress
   - SessionTimer
   - AchievementBadge
   ```

3. **Subscription 関連コンポーネント**
   ```typescript
   // src/components/subscription/
   - PremiumBanner
   - UnlockBanner
   - SubscriptionStatus
   ```

#### 成果物
- [ ] 完全なUIコンポーネント群
- [ ] レスポンシブデザイン対応
- [ ] アクセシビリティ対応
- [ ] デザインシステム統合

### Day 24-26: パフォーマンス最適化

#### 作業内容
1. **コード分割実装**
   ```typescript
   // React.lazy() による遅延読み込み
   - Training ページ群
   - Progress ダッシュボード
   - Subscription 管理
   ```

2. **キャッシュ戦略最適化**
   ```typescript
   // src/services/cache/
   - React Query 統合
   - Service Worker キャッシュ
   - CDN キャッシュ設定
   ```

3. **パフォーマンス測定**
   ```typescript
   // パフォーマンス指標測定
   - Core Web Vitals
   - Bundle サイズ最適化
   - 読み込み時間分析
   ```

#### 成果物
- [ ] 初回読み込み時間 < 3秒
- [ ] インタラクション応答時間 < 100ms
- [ ] Bundle サイズ最適化
- [ ] PWA 対応

### Day 27-28: テスト・ドキュメント

#### 作業内容
1. **テスト実装**
   ```typescript
   // __tests__/
   - ユニットテスト (Jest)
   - 統合テスト (React Testing Library)
   - E2Eテスト (Playwright)
   ```

2. **ドキュメント作成**
   ```markdown
   // docs/
   - API ドキュメント
   - コンポーネントドキュメント
   - デプロイメントガイド
   ```

3. **品質保証**
   ```typescript
   // 品質チェック
   - TypeScript strict mode
   - ESLint/Prettier
   - アクセシビリティチェック
   ```

#### 成果物
- [ ] テストカバレッジ90%以上
- [ ] 完全なドキュメント
- [ ] 品質ガイドライン準拠
- [ ] デプロイメント自動化

## 実装優先順位

### 🔥 Critical (最優先)
1. **型定義・スキーマ設計** - すべての基盤となる
2. **データローダー実装** - コンテンツ取得の中核
3. **基本的なContentService** - 最小限の機能実装

### ⚡ High (高優先度)
4. **アクセス制御システム** - 収益に直結
5. **基本的なUI実装** - ユーザー体験の基盤
6. **進捗管理基本機能** - ユーザー継続率に影響

### 📈 Medium (中優先度)
7. **高度な進捗分析** - ユーザーエンゲージメント向上
8. **パフォーマンス最適化** - スケーラビリティ確保
9. **詳細なアナリティクス** - データドリブンな改善

### 🎨 Low (低優先度)
10. **アニメーション・演出** - ユーザー体験向上
11. **ソーシャル機能** - コミュニティ形成
12. **高度なゲーミフィケーション** - エンゲージメント強化

## リスク管理

### 技術的リスク
1. **データ移行の複雑性** → 段階的移行戦略
2. **パフォーマンス劣化** → 早期ベンチマーク実装
3. **型安全性の破綻** → 厳格なレビュープロセス

### スケジュールリスク
1. **要件変更** → アジャイル開発手法採用
2. **品質問題** → 自動テスト・CI/CD 早期導入
3. **リソース不足** → MVP 優先・段階的機能追加

### 対策
- **毎日の進捗確認** - スタンドアップミーティング
- **週次デモ** - ステークホルダー向け進捗共有
- **品質ゲート** - フェーズ間の品質チェック
- **ロールバック計画** - 問題発生時の復旧手順

## 成功指標

### Phase 1 完了時
- [ ] TypeScript エラー 0件
- [ ] 全設定ファイルが正常読み込み
- [ ] バリデーション機能動作確認

### Phase 2 完了時
- [ ] 全APIエンドポイント動作
- [ ] アクセス制御が期待通り動作
- [ ] 進捗データの正常な記録・取得

### Phase 3 完了時
- [ ] ユーザー受け入れテスト合格
- [ ] パフォーマンス要件クリア
- [ ] プロダクション環境デプロイ準備完了

## 次のステップ

### 短期 (1-2ヶ月)
- 機能の安定化・バグ修正
- ユーザーフィードバック収集・反映
- A/Bテストによる最適化

### 中期 (3-6ヶ月)
- 高度なアナリティクス実装
- AI推奨システム導入
- モバイルアプリ検討

### 長期 (6ヶ月+)
- マルチテナント対応
- 国際化対応
- エンタープライズ機能追加