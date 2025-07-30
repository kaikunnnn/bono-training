# StepBlock マークダウン対応実装ガイド

## 実装手順

### Step 1: StepBlockコンポーネントの修正

現在のコード (`src/components/training/StepBlock.tsx`):
```typescript
<p className="text-base font-medium leading-[167.99%] text-[#0d0f18] whitespace-pre-line">
  {description}
  {referenceLink && (
    <>
      <br />
      参考リンク：
      <a 
        href={referenceLink.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        『{referenceLink.text}』
      </a>
    </>
  )}
</p>
```

修正後:
```typescript
import { SimpleMarkdownRenderer } from './SimpleMarkdownRenderer';

// description部分をマークダウンレンダリングに変更
<div className="text-base font-medium leading-[167.99%] text-[#0d0f18]">
  <SimpleMarkdownRenderer 
    content={description}
    className="prose prose-sm max-w-none"
  />
  {referenceLink && (
    <div className="mt-2">
      参考リンク：
      <a 
        href={referenceLink.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        『{referenceLink.text}』
      </a>
    </div>
  )}
</div>
```

### Step 2: インポートの追加

```typescript
import { SimpleMarkdownRenderer } from './SimpleMarkdownRenderer';
```

### Step 3: 後方互換性の確保

既存の単一行テキストも正常に動作するよう確認:
```yaml
# 従来通りの書き方（引き続きサポート）
steps:
  - title: "既存のステップ"
    description: 単一行の説明文

# 新しい書き方（マークダウン対応）
steps:
  - title: "新しいステップ" 
    description: |
      - 箇条書き項目1
      - 箇条書き項目2
      
      [リンクテキスト](https://example.com)
      
      ![画像](path/to/image.jpg)
```

## テスト方法

### 1. 既存コンテンツのテスト
- `/training/info-odai-book-rental`で既存のStepBlock表示が正常か確認

### 2. 新しいマークダウン記法のテスト
以下のYAMLを`info-odai-book-rental/index.md`で試す:
```yaml
guideContent:
  steps:
    - title: "テストステップ"
      description: |
        - 箇条書き項目1
        - 箇条書き項目2
        
        詳細は[こちら](https://example.com)をご覧ください。
```

## 確認ページ
- `/training/info-odai-book-rental` - StepBlockの表示確認