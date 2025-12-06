# ブログコンポーネント一覧表示ページ - 開発計画書

## 目的
- ブログ用コンポーネントの見た目を一覧で確認
- bonoSite-mainとのデザイン統一性をチェック
- 各コンポーネントの状態（normal、hover、selected等）を確認
- レスポンシブ対応とアニメーションの確認

## ページ仕様

### URL
- `/blog/components-preview` （デバッグ用）

### ページ構成
```
Components Preview Page
├── ページヘッダー
├── コンポーネントセクション群
│   ├── BlogCard セクション
│   ├── CategoryFilter セクション
│   ├── Pagination セクション
│   ├── BlogPostHeader セクション
│   ├── BlogList セクション
│   └── その他コンポーネント
└── フッター
```

## 各セクション詳細

### 1. BlogCard セクション
**表示内容:**
- 通常状態のBlogCard
- Featured状態のBlogCard
- 各カテゴリ色のバリエーション
- ホバー状態のプレビュー
- 異なる画像サイズでの表示
- 長いタイトル・説明文での表示

**表示パターン:**
```
BlogCard Components
├── Normal Cards (Grid 3x2)
├── Featured Cards (Grid 2x1)
├── Category Variations (4 colors)
├── Content Variations (長いタイトル等)
└── State Variations (hover, loading)
```

### 2. CategoryFilter セクション
**表示内容:**
- 全カテゴリ表示
- 選択状態のフィルター
- レスポンシブ動作確認

**表示パターン:**
```
CategoryFilter Components
├── Default State (全て表示)
├── Selected State (各カテゴリ選択)
└── Responsive Behavior
```

### 3. Pagination セクション
**表示内容:**
- 各ページ数でのパターン
- 前へ・次へボタンの状態
- アクティブページの表示

**表示パターン:**
```
Pagination Components
├── Page 1 (最初のページ)
├── Page 5 (中間ページ)
├── Last Page (最後のページ)
└── Single Page (1ページのみ)
```

### 4. BlogPostHeader セクション
**表示内容:**
- 各カテゴリでの表示
- 長いタイトル・短いタイトル
- タグ数の違い

**表示パターン:**
```
BlogPostHeader Components
├── Tech Category Header
├── Design Category Header
├── Long Title Header
└── Multiple Tags Header
```

### 5. BlogList セクション
**表示内容:**
- グリッドレイアウト
- 異なる記事数での表示
- アニメーション確認

## 実装仕様

### ファイル構成
```
src/pages/blog/
├── components-preview.tsx          # メインページ
└── components/
    ├── PreviewSection.tsx          # セクション用ラッパー
    ├── StateToggle.tsx            # 状態切り替えボタン
    └── ResponsiveContainer.tsx     # レスポンシブ確認用
```

### 機能要件
1. **状態切り替え機能**
   - Normal / Hover / Selected の表示切り替え
   - アニメーション再生ボタン

2. **レスポンシブ確認機能**
   - 画面サイズシミュレーション
   - Mobile / Tablet / Desktop 表示切り替え

3. **コンポーネント設定変更**
   - props の動的変更
   - リアルタイムプレビュー

4. **bonoSite-main 比較機能**
   - 参考画像の表示
   - デザイン差分の確認

### デザインガイドライン
- **コンテナ**: 既存の container クラスを使用
- **背景**: bg-Top を適用してメインサイトと統一
- **間隔**: セクション間は 4rem のマージン
- **カード配置**: 各セクションは Card コンポーネントで囲む

## 開発順序

### Phase 1: 基本構造作成
1. PreviewSection コンポーネント作成
2. メインページの骨格作成
3. 基本レイアウトの確認

### Phase 2: コンポーネント作成と統合
1. BlogCard コンポーネント作成
2. BlogCard セクション追加
3. CategoryFilter コンポーネント作成
4. CategoryFilter セクション追加
5. Pagination コンポーネント作成
6. Pagination セクション追加
7. BlogPostHeader コンポーネント作成
8. BlogPostHeader セクション追加
9. BlogList コンポーネント作成
10. BlogList セクション追加

### Phase 3: 機能強化
1. 状態切り替え機能実装
2. レスポンシブ確認機能実装
3. アニメーション制御機能実装

## 品質チェックポイント

### デザイン統一性
- [ ] フォントファミリーの一致
- [ ] カラーパレットの一致
- [ ] 余白・マージンの一致
- [ ] ボーダー・シャドウの一致

### レスポンシブ対応
- [ ] Mobile (375px-640px) での表示
- [ ] Tablet (640px-1024px) での表示
- [ ] Desktop (1024px+) での表示

### アニメーション
- [ ] Framer Motion アニメーションの動作
- [ ] ホバーエフェクトの動作
- [ ] トランジション効果の確認

### アクセシビリティ
- [ ] キーボードナビゲーション
- [ ] フォーカス表示
- [ ] ARIA ラベルの設定

## 最終成果物
- 完全に動作するコンポーネントプレビューページ
- 各コンポーネントの全状態を確認可能
- bonoSite-mainとの視覚的な統一性を確認済み
- レスポンシブ対応完了
- アニメーション動作確認完了