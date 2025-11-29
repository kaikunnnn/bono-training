# Webflow Series Collection フィールド一覧

## Basic info

| フィールド名 | 型 | 必須 | Sanity対応 | 備考 |
|------------|-----|-----|-----------|------|
| Name | Plain text | ✅ | `title` | レッスンタイトル |
| Slug | Plain text | ✅ | `slug` | URL用スラッグ |

## Custom fields

| フィールド名 | 型 | 必須 | Sanity対応 | 備考 |
|------------|-----|-----|-----------|------|
| Thumbnail | Image | ✅ | `coverImage` | サムネイル画像 → Sanityのカバー画像 |
| LightDescriptions | Plain text | ❌ | `description` | 軽い説明文 → Sanityの説明文 |
| SeriesWhy - Goal | Plain text | ❌ | ❌ 不要？ | シリーズの目標 |
| ExplainWhyThisSeries - Description | Rich text | ❌ | `overview` | シリーズの詳細説明 → Sanityの概要 |
| Text_acquiredskills | Plain text | ❌ | `purposes` | 獲得スキルテキスト → Sanityの目的 |
| AcquiredSkill - やるメリット | Switch | ❌ | ❌ 不要 | スキル獲得フラグ |
| AboutThisSeries | Rich text | ❌ | ❌ 不要？ | シリーズについて |
| シリーズのチャンネルリンク | Link | ❌ | ❌ 不要 | 外部リンク |
| SeriesTime | Plain text | ❌ | ❌ 不要 | シリーズの所要時間 |
| Intro Video | Video link | ❌ | ❌ 不要 | イントロ動画 |
| IntroSlideURL | Plain text | ❌ | ❌ 不要 | スライドURL |
| Series BG Color | Color | ❌ | ❌ 不要 | 背景色 |
| CategoriesMd-DesignFlow | Reference | ✅ | `category` | カテゴリ参照 → Sanityのカテゴリ |
| CategorySm | Reference | ❌ | ❌ 不要 | サブカテゴリ |
| Contents Type | Multi-reference | ❌ | ❌ 不要 | コンテンツタイプ |
| 必須かどうか | Switch | ❌ | ❌ 不要 | 必須フラグ |
| OGPイメージ | Image | ❌ | `iconImage` | OGP画像 → Sanityのアイコン画像 |
| イントロビデオ | Link | ❌ | ❌ 不要 | イントロビデオリンク |
| ImageBGparts | Image | ❌ | ❌ 不要 | 背景パーツ画像 |
| Course | Reference | ❌ | ❌ 不要 | コース参照 |
| CourseSeriesNumber | Plain text | ❌ | ❌ 不要 | コース内シリーズ番号 |
| CourseTypeBasicOrBoss | Switch | ❌ | ❌ 不要 | コースタイプ |
| RecommendLists - おすすめシリーズに並ぶかどうか | Switch | ❌ | ❌ 不要 | おすすめフラグ |
| CourseSeriesItemBG | Color | ❌ | ❌ 不要 | コースアイテム背景色 |
| Video Count | Number | ❌ | ❌ 不要 | 動画数（参考情報） |
| Is this free series? | Switch | ❌ | `isPremium` | 無料シリーズか → Sanityの有料フラグ（論理反転） |

---

## Sanityマッピング（推奨）

### 自動取得すべきフィールド

| Webflowフィールド | Sanityフィールド | 優先度 | 備考 |
|-----------------|----------------|-------|------|
| Name | `title` | 🔴 必須 | 既に実装済み |
| Slug | `slug` | 🔴 必須 | 既に実装済み |
| Thumbnail | `coverImage` | 🟡 推奨 | サムネイル画像 |
| LightDescriptions | `description` | 🟡 推奨 | 説明文 |
| CategoriesMd-DesignFlow | `category` | 🟡 推奨 | カテゴリ（Referenceなので解決が必要） |
| OGPイメージ | `iconImage` | 🟢 任意 | アイコン画像 |
| ExplainWhyThisSeries | `overview` | 🟢 任意 | 詳細説明（Rich textの変換が必要） |
| Text_acquiredskills | `purposes` | 🟢 任意 | 獲得スキル |
| Is this free series? | `isPremium` | 🟢 任意 | 論理反転（false → true） |

### Sanityのみで管理するフィールド

- `webflowSource` - Webflow Series IDを保存
- `contentHeading` - コンテンツ見出し
- `quests` - クエストの参照（Webflowソースがない場合のみ）

---

## 注意事項

### 1. Referenceフィールドの扱い

**CategoriesMd-DesignFlow** は Reference型なので：
- Webflow APIでは参照先IDが返される
- 参照先コレクション（CategoriesMd-DesignFlow）の内容も取得する必要がある
- または、Sanityで手動設定する方が簡単

### 2. Rich textの変換

**ExplainWhyThisSeries** は Rich text なので：
- Webflow APIではHTMLまたは独自形式で返される
- SanityのPortable Text形式に変換する必要がある
- 変換が複雑なので、Sanityで手動管理する方が簡単

### 3. 画像URLの扱い

**Thumbnail** と **OGPイメージ** は Image型なので：
- Webflow APIでは画像URLが返される
- Sanity Studioでは直接画像をアップロードする必要がある
- または、Sanity Studio上でURLから画像を参照する実装が必要

---

## 実装推奨度

### 優先度 HIGH（すぐ実装すべき）

1. ✅ **Name** → `title` （既に実装済み）
2. ✅ **Slug** → `slug` （既に実装済み）
3. ⬜ **Thumbnail** → `coverImage` （画像URL取得、Sanityで表示）
4. ⬜ **LightDescriptions** → `description` （テキスト取得）

### 優先度 MEDIUM（あると便利）

5. ⬜ **CategoriesMd-DesignFlow** → `category` （Reference解決が必要）
6. ⬜ **OGPイメージ** → `iconImage` （画像URL取得）

### 優先度 LOW（手動管理でOK）

7. ⬜ **ExplainWhyThisSeries** → `overview` （Rich text変換が複雑）
8. ⬜ **Text_acquiredskills** → `purposes` （配列変換が必要）
9. ⬜ **Is this free series?** → `isPremium` （論理反転のみ）
