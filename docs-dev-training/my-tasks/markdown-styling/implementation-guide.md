# MdxPreview.tsx 実装ガイド

## 実装手順

### Step 1: react-markdownにcomponentsプロップを追加

現在のコード:
```tsx
<Markdown>
  {displayContent}
</Markdown>
```

修正後:
```tsx
<Markdown components={markdownComponents}>
  {displayContent}
</Markdown>
```

### Step 2: markdownComponentsオブジェクトの定義

SimpleMarkdownRenderer.tsxを参考に以下のコンポーネントを定義:

```tsx
const markdownComponents = {
  // 箇条書きスタイリング
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside space-y-2 mb-4 ml-4" {...props}>
      {children}
    </ul>
  ),
  li: ({ children, ...props }: any) => (
    <li className="text-gray-700 leading-relaxed" {...props}>
      {children}
    </li>
  ),
  
  // リンクスタイリング
  a: ({ href, children, ...props }: any) => (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 underline transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
};
```

### Step 3: (オプション) 追加のタイポグラフィー要素

```tsx
// 見出し
h2: ({ children, ...props }: any) => (
  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4" {...props}>
    {children}
  </h2>
),
h3: ({ children, ...props }: any) => (
  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3" {...props}>
    {children}
  </h3>
),

// 段落
p: ({ children, ...props }: any) => (
  <p className="text-gray-700 leading-relaxed mb-4" {...props}>
    {children}
  </p>
),

// コード
code: ({ children, ...props }: any) => (
  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props}>
    {children}
  </code>
),
```

## テスト内容

1. 箇条書きが適切に表示されること
2. リンクがクリック可能で外部リンクが新しいタブで開くこと
3. 既存のプレミアムコンテンツバナー機能が正常に動作すること

## 確認ページ
- `/training/info-odai-book-rental/introduction` で動作確認