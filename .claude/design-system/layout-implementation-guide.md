# Layout実装ガイド

**最終更新**: 2026-04-05

---

## 🎯 重要な原則

### 全てのページで必須
- **グローバルナビゲーション（サイドバー）**: 常に表示
- **ヘッダーグラデーション**: 常に表示（ページに応じて種類を選択）
- これらは`Layout`コンポーネントで提供される

---

## 📐 Layout コンポーネント

### 基本構造

```tsx
import Layout from '@/components/layout/Layout';

export default function YourPage() {
  return (
    <Layout headerGradient="default">
      {/* ページコンテンツ */}
    </Layout>
  );
}
```

### Props

| Prop | 型 | デフォルト | 説明 |
|------|-----|-----------|------|
| `children` | ReactNode | - | ページコンテンツ（必須） |
| `className` | string | - | 追加のクラス名 |
| `headerGradient` | 'default' \| 'top' \| 'none' | 'default' | ヘッダーグラデーションの種類 |

### ヘッダーグラデーションの種類

#### `'default'` - 標準グラデーション
- 高さ: 148px
- カラー: 青紫 → クリーム → 透明
- 使用場所: ほとんどのページ（ロードマップ、レッスン、マイページなど）

```css
background: linear-gradient(
  180deg,
  rgb(230, 230, 239) 0%,
  rgb(250, 242, 237) 44.3%,
  rgb(249, 248, 246) 84.3%,
  rgba(249, 248, 246, 0) 100%
);
```

#### `'top'` - トップページ専用グラデーション
- 高さ: 600px〜800px（レスポンシブ）
- カラー: 緑系の淡いグラデーション
- 使用場所: **トップページ（/）のみ**

```css
background: linear-gradient(
  180deg,
  rgba(226, 232, 228, 0.6) 0%,
  rgba(242, 243, 240, 0.3) 50%,
  transparent 100%
);
```

#### `'none'` - グラデーションなし
- 使用場所: 特殊なデザインが必要な場合のみ（通常は使用しない）

---

## 🖼️ 背景色システム

### デフォルト背景色

プロジェクト全体のデフォルト背景色:

```css
/* ライトモード */
--bg-base: #F9F9F7;

/* ダークモード */
--bg-base: #0a0a0a;
```

Tailwindクラス: `bg-base`

### 使い分け

| 要素 | 背景色 | 説明 |
|------|--------|------|
| `<Layout>` | `bg-base` | ページ全体の基本背景 |
| セクション内カード | `bg-white` | コンテンツを際立たせる白背景 |
| モーダル・ダイアログ | `bg-white` | 白背景で明確に分離 |
| アラート・通知 | カラー別 | `bg-blue-50`, `bg-green-50`など |

---

## 📱 レスポンシブレイアウト

### デスクトップ（1280px以上、xl:）
- サイドバー: 固定表示（200px幅）
- メインコンテンツ: `xl:ml-[200px]`でサイドバー分のマージン

### タブレット・モバイル（1280px未満）
- サイドバー: ハンバーガーメニューで開閉
- ヘッダー: 固定ヘッダーバー（高さ56px、pt-14でマージン確保）

### コンテンツ幅の考慮

**デスクトップでサイドバーがある場合の幅計算:**

```
画面幅 1920px の場合:
- サイドバー: 200px
- 利用可能な幅: 1920px - 200px = 1720px

コンテンツの最大幅を設定する場合:
max-w-[950px]  → 中央配置される
max-w-[1200px] → 中央配置される
max-w-7xl      → 中央配置される（1280px）
```

---

## ✅ 実装チェックリスト

新しいページを作成する際の確認事項:

- [ ] `Layout`コンポーネントでラップしている
- [ ] 適切な`headerGradient`を指定している
  - [ ] トップページ → `headerGradient="top"`
  - [ ] その他のページ → `headerGradient="default"`
- [ ] 背景色は`bg-base`（Layoutが提供）
- [ ] コンテンツが左に寄りすぎていないか確認
  - [ ] デスクトップでサイドバー200px分のマージンが確保されている
  - [ ] 中央配置が必要な場合は`mx-auto`と`max-w-*`を使用
- [ ] モバイルでハンバーガーメニューが正しく機能するか確認

---

## 🚫 やってはいけないこと

### ❌ Layoutを使わずにページを作成
```tsx
// ❌ NG
export default function MyPage() {
  return <div>コンテンツ</div>;
}
```

```tsx
// ✅ OK
export default function MyPage() {
  return (
    <Layout>
      <div>コンテンツ</div>
    </Layout>
  );
}
```

### ❌ 背景色を`bg-white`で上書き
```tsx
// ❌ NG: Layoutの背景色を無効化してしまう
<Layout className="bg-white">
```

```tsx
// ✅ OK: セクション内で白背景を使う
<Layout>
  <section className="bg-white">
    {/* 白背景が必要な部分 */}
  </section>
</Layout>
```

### ❌ グラデーションを独自に追加
```tsx
// ❌ NG: Layoutのグラデーションと競合する
<Layout>
  <div style={{ background: 'linear-gradient(...)' }}>
```

```tsx
// ✅ OK: LayoutのheaderGradientを使う
<Layout headerGradient="top">
```

---

## 📝 例: トップページ

```tsx
import Layout from '@/components/layout/Layout';
import TrainingCard, { TRAINING_CARDS_DATA } from '@/components/top/TrainingCard';

export default function TopPage() {
  return (
    <Layout headerGradient="top">
      {/* ヒーローセクション */}
      <section className="relative pt-0 pb-0">
        <div className="relative h-auto min-h-[900px] sm:min-h-[1100px] lg:h-[1186px]">
          {/* コンテンツ */}
        </div>
      </section>

      {/* パートナーシップセクション */}
      <section className="border-b border-[#dfdfdf] py-6 px-4 sm:px-6">
        {/* コンテンツ */}
      </section>
    </Layout>
  );
}
```

---

## 🔧 トラブルシューティング

### コンテンツが左に寄ってしまう

**原因**: デスクトップでサイドバー（200px）の分だけ左にマージンが取られている

**解決策**:
1. `mx-auto`と`max-w-*`で中央配置
2. コンテンツの幅を調整して中央に配置

```tsx
// 中央配置の例
<div className="max-w-[950px] mx-auto px-4">
  {/* コンテンツ */}
</div>
```

### グラデーションが表示されない

**原因**: `headerGradient`が指定されていない、または`'none'`になっている

**解決策**:
```tsx
<Layout headerGradient="default"> {/* または "top" */}
```

### モバイルでヘッダーバーとコンテンツが重なる

**原因**: モバイルヘッダー（56px）の分のマージンが確保されていない

**解決策**: Layoutが自動的に`pt-14`を適用しているため、通常は問題なし。カスタムレイアウトの場合は手動で`pt-14 xl:pt-0`を追加

---

## 📚 関連ドキュメント

- [Layout.tsx](/Users/kaitakumi/Documents/bono-training/src/components/layout/Layout.tsx)
- [Sidebar.tsx](/Users/kaitakumi/Documents/bono-training/src/components/layout/Sidebar.tsx)
- [index.css（背景色定義）](/Users/kaitakumi/Documents/bono-training/src/index.css)
