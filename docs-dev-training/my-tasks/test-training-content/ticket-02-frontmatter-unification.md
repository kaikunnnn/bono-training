# 🚨 [緊急度：高] フロントマターフィールド統一

## 問題の詳細

### 現象
- Edge Function が期待するフィールド名と実際の `index.md` のフィールド名が不整合
- 具体例：`thumbnail` vs `thumbnail_url`
- この不整合により、正しい表示データが取得できていない

### 発見された不整合

#### ec-product-catalog/index.md
```yaml
# 現在
thumbnail_url: "/assets/backgrounds/ui-basic-training-bg.svg"

# Edge Function期待値
thumbnail: "/assets/backgrounds/ui-basic-training-bg.svg"
```

### 影響範囲
- トレーニングカードの画像表示
- メタデータの取得・表示
- UI での情報不整合

## 調査手順

### 1. 全 index.md のフィールド調査
```bash
# 各トレーニングのフロントマター確認
- content/training/ec-product-catalog/index.md
- content/training/info-odai-book-rental/index.md  
- content/training/todo-app/index.md
- content/training/ux-basics/index.md
```

### 2. Edge Function期待フィールドの確認
```typescript
// supabase/functions/get-training-list/index.ts 分析
// parseFrontmatter() 関数の処理内容
// 最終レスポンスで使用されるフィールド名
```

### 3. フロントエンド期待値の確認
```typescript
// src/types/training.ts の Training interface
// TrainingCard, PortfolioTrainingCard で使用されるプロパティ
```

## 解決策の実装内容

### A. 統一フィールド仕様の決定

#### 画像関連
```yaml
# 統一後の標準仕様
thumbnail: "画像パス"           # サムネイル画像
backgroundImage: "画像パス"     # 背景画像（option）
background_svg: "SVGパス"      # 背景SVG（option）
```

#### メタデータ
```yaml
# 必須フィールド
title: "タイトル"
description: "説明文"
type: "challenge | skill | portfolio"
difficulty: "normal | 中級 | 上級"
tags: ["タグ1", "タグ2"]

# オプションフィールド  
icon: "アイコンURL or emoji"
category: "カテゴリ名"
estimated_total_time: "推定時間"
task_count: タスク数
is_premium: boolean
```

### B. 各 index.md の修正

#### ec-product-catalog/index.md
```yaml
---
title: "ECサイト商品カタログをデザインしよう"
description: "ユーザーが商品を見つけやすいカタログ設計を学ぶ"
type: "challenge"
difficulty: "中級"
tags: ["情報設計", "UX", "EC", "カタログ"]
thumbnail: "/assets/backgrounds/ui-basic-training-bg.svg"  # 修正
category: "情報設計"
estimated_total_time: "4-6時間"
task_count: 3
is_premium: false
---
```

#### 他のファイルも同様に統一

### C. Edge Function の対応
```typescript
// フィールドマッピング対応（後方互換性）
const normalizeFields = (frontmatter: any) => {
  return {
    ...frontmatter,
    thumbnail: frontmatter.thumbnail || frontmatter.thumbnail_url,
    backgroundImage: frontmatter.backgroundImage || frontmatter.background_image,
    // 他の必要なマッピング
  };
};
```

## テスト方法

### 1. フロントマター構文テスト
```javascript
// 各 index.md の YAML パース確認
import yaml from 'js-yaml';
import fs from 'fs';

const testFrontmatter = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (match) {
    try {
      const parsed = yaml.load(match[1]);
      console.log('✅', filePath, parsed);
    } catch (error) {
      console.error('❌', filePath, error);
    }
  }
};
```

### 2. Edge Function レスポンステスト
```bash
# 修正後のレスポンス確認
curl -X POST "https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/get-training-list" \
  -H "Authorization: Bearer [ANON_KEY]" | jq '.data[].thumbnail'
```

### 3. UI表示テスト
- `/training` ページでのサムネイル画像表示確認
- トレーニングカードの情報表示確認
- 各メタデータの正確性確認

## 完了基準

- [ ] 全 `index.md` のフロントマターが統一フィールド仕様に準拠
- [ ] Edge Function が全フィールドを正しく解析・返却
- [ ] フロントエンドで全トレーニングの画像・メタデータが正しく表示
- [ ] YAML構文エラーが発生していない
- [ ] 後方互換性が維持されている（既存フィールドも動作）

## 関連ファイル

### 直接修正対象
- `content/training/ec-product-catalog/index.md`
- `content/training/info-odai-book-rental/index.md`
- `content/training/todo-app/index.md` 
- `content/training/ux-basics/index.md`

### 確認・調整対象
- `supabase/functions/get-training-list/index.ts`
- `src/types/training.ts`

### UI確認対象
- `src/components/training/TrainingCard.tsx`
- `src/components/training/PortfolioTrainingCard.tsx`
- `src/pages/Training/index.tsx`

## 技術的詳細

### フィールド優先順位
1. **必須フィールド**: title, description, type, difficulty, tags
2. **推奨フィールド**: thumbnail, category, estimated_total_time
3. **オプションフィールド**: icon, background_svg, is_premium

### 画像パス仕様
```yaml
# 相対パス（推奨）
thumbnail: "/assets/backgrounds/training-bg.svg"

# 外部URL
thumbnail: "https://assets.st-note.com/..."

# 動的生成
thumbnail: "https://source.unsplash.com/random/200x100"
```

### 型安全性
```typescript
// Zod スキーマで厳密な型チェック
const TrainingFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(['challenge', 'skill', 'portfolio']),
  // ...
});
```

### マイグレーション戦略
1. **Phase 1**: 後方互換性を維持しながら新フィールド対応
2. **Phase 2**: 全ファイルの新フィールド移行
3. **Phase 3**: 古いフィールドサポート廃止（将来）

## 優先度・緊急度
**緊急度：高** - データ表示の根本的な問題のため