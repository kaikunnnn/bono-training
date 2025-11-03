# 要件定義: コンポーネント・カラーリファレンスページ

## 機能要件

### 1. ページアクセス制御

**FR-1.1: 開発環境のみアクセス可能**
- `import.meta.env.DEV` が `true` の場合のみページ表示
- 本番環境では404ページにリダイレクト、またはアクセス不可メッセージ表示

**FR-1.2: ルーティング**
- パス: `/dev/components`
- ナビゲーションメニューには表示しない（直接URLアクセスのみ）

### 2. カラーパレット表示

**FR-2.1: テーマカラー表示**
- すべてのCSS変数カラーを表示
- 各カラーに対して:
  - カラー名
  - HSL値
  - 実際の表示色（カラーボックス）
  - HEX値（変換後）

**FR-2.2: カスタムカラー表示**
- trainingカラーパレット
- 各バリエーション（DEFAULT, background, dark, text, gradient）

**FR-2.3: ライト/ダークモード対応**
- モード切り替えボタン
- 各モードでのカラー表示

### 3. タイポグラフィ表示

**FR-3.1: フォントファミリーサンプル**
- 定義されているすべてのフォント表示
- 各フォントで:
  - フォント名
  - サンプルテキスト（日本語 + 英語）
  - ウェイトバリエーション

**FR-3.2: テキストスタイル**
- h1, h2, h3, h4, h5, h6
- p, small, lead
- code, pre

### 4. アニメーション表示

**FR-4.1: 定義済みアニメーション**
- すべてのカスタムアニメーションをデモ
- 各アニメーションに:
  - アニメーション名
  - 再生ボタン
  - アニメーション設定（duration, easing）

**FR-4.2: アニメーションリスト**
- accordion-down, accordion-up
- fade-in
- gradient-fade-in
- gradient-slide
- gradient-scale-slide

### 5. コンポーネントライブラリ

**FR-5.1: shadcn/ui コンポーネント**
- 47個のshadcn/uiコンポーネントを分類表示
- カテゴリ:
  - Forms (Button, Input, Select, Checkbox, etc.)
  - Layout (Card, Separator, Tabs, etc.)
  - Overlay (Dialog, Sheet, Popover, etc.)
  - Navigation (Menubar, Navigation Menu, etc.)
  - Feedback (Alert, Toast, Progress, etc.)
  - Data Display (Table, Avatar, Badge, etc.)

**FR-5.2: カスタムコンポーネント**
- カテゴリ別に整理:
  - Authentication
  - Common
  - Content
  - Layout
  - Training
  - Guide
  - Subscription

**FR-5.3: コンポーネント表示**
- 各コンポーネントに:
  - コンポーネント名
  - ライブプレビュー（インタラクティブな例）
  - 説明（オプション）
  - Props一覧（オプション）

### 6. UI/UX要件

**FR-6.1: ナビゲーション**
- サイドバーまたはタブでセクション切り替え
- セクション:
  1. Colors
  2. Typography
  3. Animations
  4. UI Components
  5. Custom Components

**FR-6.2: 検索機能（オプション）**
- コンポーネント名で検索
- カラー名で検索

**FR-6.3: レスポンシブデザイン**
- モバイル、タブレット、デスクトップ対応
- グリッドレイアウトで表示

## 非機能要件

### NFR-1: パフォーマンス
- ページロード時間 < 2秒
- 遅延読み込み（コンポーネントプレビュー）

### NFR-2: 保守性
- コンポーネント追加時に自動反映される仕組み
- 設定ファイルから動的に読み込み

### NFR-3: アクセシビリティ
- キーボードナビゲーション対応
- 適切なARIAラベル

## 想定ユーザー

- 開発者（デザイナー、フロントエンドエンジニア）
- コンポーネントの使用方法を確認したい人
- デザイントークンを参照したい人

## 成功基準

1. すべてのカラー、タイポグラフィ、アニメーションが表示される
2. 47個のshadcn/uiコンポーネントが分類され表示される
3. カスタムコンポーネントがカテゴリ別に表示される
4. 開発環境でのみアクセス可能
5. レスポンシブで使いやすいUI
