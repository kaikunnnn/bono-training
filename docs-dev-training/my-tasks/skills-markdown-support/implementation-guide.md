# Skills マークダウン箇条書き実装ガイド

## 実装手順

### Step 1: convertSkillsToHtml関数の修正

現在のコード (`src/utils/simplifiedSkillGuideParser.ts`):
```typescript
let result = `<div class="skill-item">

#### ■ ${skill.title}

- ${skill.description}
${referenceLink}

</div>`;
```

修正後:
```typescript
let result = `<div class="skill-item">

#### ■ ${skill.title}

${skill.description}
${referenceLink}

</div>`;
```

### 変更点の詳細
1. **ハードコードされた「- 」プレフィックスの削除**
   - 現在: `- ${skill.description}` 
   - 修正後: `${skill.description}`

2. **マークダウン箇条書きの自動処理**
   - `description`がマークダウン箇条書きの場合、そのまま活かす
   - 単一行テキストの場合も引き続き正常に表示

### Step 2: 後方互換性の確保

既存の単一行descriptionも正常に動作するよう、以下を確認:
```yaml
# 従来通りの書き方（引き続きサポート）
- title: "既存のスキル"
  description: 単一行の説明文

# 新しい書き方（箇条書き対応）
- title: "新しいスキル" 
  description: |
    - 箇条書き項目1
    - 箇条書き項目2
```

## テスト方法

### 1. 既存コンテンツのテスト
- `/training/info-odai-book-rental`で既存の表示が正常か確認

### 2. 新しいマークダウン箇条書きのテスト
以下のYAMLを`info-odai-book-rental/index.md`で試す:
```yaml
skills:
  - title: "テストスキル"
    description: |
      - 箇条書き項目1
      - 箇条書き項目2
      - 箇条書き項目3
```

## 確認ページ
- `/training/info-odai-book-rental` - Skillsセクションの表示確認