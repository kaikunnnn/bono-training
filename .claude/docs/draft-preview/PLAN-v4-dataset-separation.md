# 下書きプレビュー機能 実装計画 v4（Dataset Separation）

**作成日**: 2025-12-13
**ステータス**: ✅ 実装完了

---

## 概要

Sanityの標準機能である「複数データセット」を使用して、開発環境と本番環境を完全に分離する。

### 要件

- **開発環境**: `development` データセットを使用
- **本番環境**: `production` データセットを使用
- **運用**: 開発で確認後、本番に反映

---

## なぜこのアプローチ？

| アプローチ | メリット | デメリット |
|-----------|---------|-----------|
| **Dataset Separation** | Sanity標準機能、完全分離、Unpublish可能 | データ同期が必要 |
| Article-level Control | 細かい制御 | GROQクエリ変更が複雑、nullエラーのリスク |
| Lesson-level Control | シンプル | 記事単位の制御不可 |

---

## 実装フェーズ

### Phase 1: developmentデータセット作成

```bash
cd sanity-studio
npx sanity dataset create development
```

### Phase 2: 既存データのコピー

```bash
# productionからエクスポート
npx sanity dataset export production production-backup.tar.gz

# developmentにインポート
npx sanity dataset import production-backup.tar.gz development
```

### Phase 3: ローカル環境の設定

**`.env.local`** を更新:

```bash
# Development dataset for local
VITE_SANITY_DATASET=development
```

**`.env.production`** (本番用):

```bash
# Production dataset for production build
VITE_SANITY_DATASET=production
```

### Phase 4: Sanity Studio の設定更新

**`sanity-studio/sanity.config.ts`**:

```typescript
import {defineConfig} from 'sanity'

// 環境変数またはデフォルト値
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'default',
  title: 'BONO',
  projectId: 'cqszh4up',
  dataset: dataset,
  // ...
})
```

**`sanity-studio/sanity.cli.ts`**:

```typescript
import {defineCliConfig} from 'sanity/cli'

const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineCliConfig({
  api: {
    projectId: 'cqszh4up',
    dataset: dataset
  },
})
```

### Phase 5: package.json スクリプト追加

```json
{
  "scripts": {
    "sanity:dev": "cd sanity-studio && SANITY_STUDIO_DATASET=development npm run dev",
    "sanity:prod": "cd sanity-studio && SANITY_STUDIO_DATASET=production npm run dev",
    "sanity:sync": "cd sanity-studio && npx sanity dataset export development dev-export.tar.gz && npx sanity dataset import dev-export.tar.gz production --replace"
  }
}
```

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `.env.local` | VITE_SANITY_DATASET=development |
| `.env.production` | VITE_SANITY_DATASET=production |
| `sanity-studio/sanity.config.ts` | 環境変数でdataset切り替え |
| `sanity-studio/sanity.cli.ts` | 環境変数でdataset切り替え |
| `package.json` | sanity:dev, sanity:prod スクリプト追加 |

---

## 運用フロー

### 新しいレッスン/記事を作成する場合

1. `npm run sanity:dev` でStudio起動（developmentに接続）
2. レッスン/Quest/記事を作成
3. `npm run dev` でローカル確認（developmentを参照）
4. OKなら `npm run sanity:sync` で本番に反映

### 既存コンテンツを編集する場合

#### 開発環境で試す場合
1. `npm run sanity:dev` で編集
2. ローカルで確認
3. `npm run sanity:sync` で本番反映

#### 直接本番を編集する場合
1. `npm run sanity:prod` で編集
2. 保存すれば即座に本番反映

---

## データセットの使い分け

| 操作 | 使用データセット |
|-----|----------------|
| 新規コンテンツ作成 | development |
| 既存コンテンツの小修正 | production |
| 大幅な変更・リストラクチャ | development |
| 本番確認 | production |

---

## テスト計画

### Phase 2完了後

- [ ] developmentデータセットにデータが存在することを確認

### Phase 3完了後

- [ ] `npm run dev` でdevelopmentデータが表示されることを確認
- [ ] `npm run build && npm run preview` でproductionデータが表示されることを確認

### Phase 4完了後

- [ ] `npm run sanity:dev` でdevelopmentデータセットに接続することを確認
- [ ] `npm run sanity:prod` でproductionデータセットに接続することを確認

---

## ロールバック

問題が発生した場合:

```bash
# .env.local を元に戻す
VITE_SANITY_DATASET=production

# Sanity Studio設定を元に戻す
git restore sanity-studio/sanity.config.ts sanity-studio/sanity.cli.ts
```

---

## 次のステップ

1. [ ] Phase 1: developmentデータセット作成
2. [ ] Phase 2: データコピー
3. [ ] Phase 3: 環境設定
4. [ ] Phase 4: Sanity Studio設定
5. [ ] Phase 5: スクリプト追加
6. [ ] テスト実行
