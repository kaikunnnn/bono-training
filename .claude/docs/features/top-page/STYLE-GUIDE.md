# BONOトップページ スタイルガイド

---

## 1. カラーパレット

### プライマリ
```css
--primary: #1a1a1a;      /* メインテキスト、ボタン */
--primary-light: #374151; /* サブテキスト */
```

### アクセント
```css
--accent: #6366f1;        /* インディゴ - CTA、リンク */
--accent-hover: #4f46e5;  /* ホバー状態 */
```

### 背景
```css
--bg-base: #f9fafb;       /* ページ背景 */
--bg-card: #ffffff;       /* カード背景 */
--bg-dark: #111827;       /* ダークセクション */
```

### グラデーション
```css
--gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-subtle: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
```

---

## 2. タイポグラフィ

### フォントファミリー
```css
font-family: 'Inter', 'Noto Sans JP', sans-serif;
```

### スケール
| 用途 | サイズ | ウェイト | 行高 |
|------|--------|---------|------|
| Hero H1 | 56px / 3.5rem | 700 | 1.1 |
| Section H2 | 40px / 2.5rem | 700 | 1.2 |
| Card H3 | 24px / 1.5rem | 600 | 1.3 |
| Body | 16px / 1rem | 400 | 1.6 |
| Small | 14px / 0.875rem | 400 | 1.5 |
| Caption | 12px / 0.75rem | 500 | 1.4 |

---

## 3. スペーシング

### セクション間
```css
--section-gap: 120px;  /* デスクトップ */
--section-gap-mobile: 64px;
```

### コンテナ
```css
--container-max: 1280px;
--container-padding: 24px;
```

### グリッド
```css
--grid-gap: 24px;
--card-padding: 32px;
```

---

## 4. コンポーネントスタイル

### カード
```css
.card {
  background: var(--bg-card);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}
```

### ボタン（プライマリ）
```css
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: var(--primary-light);
}
```

### ボタン（セカンダリ）
```css
.btn-secondary {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 12px 24px;
  border-radius: 12px;
}
```

### 統計数字
```css
.stat-number {
  font-size: 48px;
  font-weight: 700;
  color: var(--primary);
}
.stat-label {
  font-size: 14px;
  color: var(--primary-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## 5. グリッドシステム

### 3カラム（デスクトップ）
```css
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 1024px) {
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .grid-3 { grid-template-columns: 1fr; }
}
```

### 4カラム統計
```css
.grid-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 48px;
  text-align: center;
}
```

---

## 6. アニメーション

### フェードイン
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}
```

### スクロールトリガー
```css
.scroll-animate {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s, transform 0.6s;
}
.scroll-animate.visible {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 7. レスポンシブブレークポイント

```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```
