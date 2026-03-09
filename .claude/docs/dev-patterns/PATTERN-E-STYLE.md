# Pattern E スタイルガイド

TopPagePatternE.tsx から抽出したデザインシステム

## カラーパレット

```typescript
const colors = {
  // 背景
  bg: '#F9F9F7',           // メイン背景
  bgCard: '#FFFFFF',        // カード背景
  bgMuted: '#F5F5F5',       // ミュート背景
  bgPlaceholder: '#E8E8E8', // プレースホルダー

  // テキスト
  text: '#1a1a1a',          // メインテキスト
  textMuted: '#666666',     // サブテキスト
  textLight: '#999999',     // ライトテキスト

  // アクセント
  accent: '#2563eb',        // リンク・アクセント
  training: '#FF9900',      // トレーニング用

  // ボーダー
  border: 'rgba(0, 0, 0, 0.06)',
};
```

## フォント

```typescript
const fonts = {
  heading: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', sans-serif",
  body: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', sans-serif",
};
```

## レイアウト

- **最大幅**: `1200px`
- **セクション padding**: `80px 24px`
- **カード角丸**: `16px` / `20px`
- **グリッド gap**: `20px` / `24px`

## セクションヘッダー

```tsx
<h2 style={{
  fontSize: '24px',
  fontWeight: 700,
  marginBottom: '8px',
  fontFamily: fonts.heading,
}}>
  セクションタイトル
</h2>
<p style={{
  fontSize: '14px',
  color: colors.textMuted,
  marginBottom: '16px',
}}>
  サブタイトル
</p>
<Link style={{
  fontSize: '14px',
  color: colors.accent,
  textDecoration: 'underline',
  marginBottom: '32px',
}}>
  一覧をみる
</Link>
```

## カードスタイル

### 基本カード

```tsx
style={{
  backgroundColor: colors.bgCard,
  borderRadius: '16px',
  padding: '20px',
  border: `1px solid ${colors.border}`,
}}
```

### サムネイル

```tsx
style={{
  backgroundColor: colors.bgPlaceholder,
  borderRadius: '16px',
  aspectRatio: '16/10', // または '4/3'
}}
```

## ボタン

### プライマリボタン（黒）

```tsx
style={{
  width: '100%',
  padding: '14px',
  backgroundColor: colors.text,
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
}}
```

### ピルボタン

```tsx
style={{
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  backgroundColor: colors.bgCard,
  border: `1px solid ${colors.border}`,
  borderRadius: '100px',
  fontSize: '14px',
  fontWeight: 500,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}}
```

## グリッドパターン

| 用途 | カラム数 | gap |
|------|----------|-----|
| ロードマップカード | 3列 | 20px |
| ガイドカード | 2列 | 24px |
| レッスンカード | 3列 | 24px |
| 新着カード | 4列 | 20px |

## 背景グラデーション（ヒーロー用）

```tsx
style={{
  background: 'linear-gradient(180deg, #e0e5f8 0%, #faf4f0 36.7%, #F9F9F7 100%)',
}}
```

---

## ページ構成指示

以下のページ構成は別ファイルで管理：

- [TOP-PAGE.md](./TOP-PAGE.md) - トップページ
- [ROADMAP.md](./ROADMAP.md) - ロードマップ
- [LESSON-DETAIL.md](./LESSON-DETAIL.md) - レッスン詳細
- [FEEDBACK-DETAIL.md](./FEEDBACK-DETAIL.md) - フィードバック詳細
