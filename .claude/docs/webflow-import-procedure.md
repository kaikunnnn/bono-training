# Webflowインポート手順書

**作成日**: 2025-11-14
**対象**: Webflow CMS → Sanity CMS へのデータインポート

---

## 🎯 概要

WebflowのシリーズデータをSanityにインポートする際の標準手順を定義します。

---

## 📋 前提条件

- Webflow APIトークンが設定されている
- Sanity認証トークンが設定されている
- WebflowのシリーズIDを把握している

---

## 🔄 インポート手順

### ケース1: 新規シリーズのインポート（初回）

**状況**: Sanityに存在しないシリーズをWebflowから初めてインポートする

**手順**:
```bash
# 1. シリーズIDを確認
# 例: 684a8fd0ff2a7184d2108210

# 2. インポート実行
SANITY_AUTH_TOKEN=your_token \
WEBFLOW_TOKEN=your_token \
npm run import-webflow -- --series-id=684a8fd0ff2a7184d2108210
```

**期待結果**:
- ✅ Lesson作成: `webflow-series-{シリーズID}`
- ✅ Quest作成: `webflow-quest-{番号}-{タイムスタンプ}` (lesson参照あり)
- ✅ Article作成: `webflow-video-{ビデオID}`
- ✅ Lesson → Quest → Article の参照が正しく設定される

---

### ケース2: 既存シリーズの再インポート（更新）

**状況**: Webflow側でコンテンツを更新したので、Sanityに反映したい

**⚠️ 現在の問題**:
- `createOrReplace`を使っているため、**重複データが作成される**
- 古いQuestは削除されずに残る（孤立状態）
- Articleも重複する可能性がある

**現状の動作**:
```bash
# 再インポート実行
npm run import-webflow -- --series-id=684a8fd0ff2a7184d2108210

# 結果:
# - Lesson: 上書き更新される（新しいQuestを参照）
# - Quest: 新規作成される（タイムスタンプが異なるため別ID）
# - Article: 上書き更新される（同じビデオIDなら）
# - 古いQuest: 孤立状態で残る ❌
```

---

## 🛠️ 推奨される解決策

### オプションA: 再インポート前に古いデータを削除（手動）

**手順**:
```bash
# 1. 削除対象を確認
SANITY_AUTH_TOKEN=your_token npx tsx scripts/check-webflow-quest.ts

# 2. 古いQuestを手動削除（Sanity Studioで削除）
# または削除スクリプトを実行

# 3. 再インポート実行
npm run import-webflow -- --series-id=684a8fd0ff2a7184d2108210
```

**メリット**: シンプル、確実
**デメリット**: 手動作業が必要、ミスの可能性

---

### オプションB: インポートスクリプトに削除機能を追加（自動化）

**改善案**:
```typescript
// import-from-webflow.ts に追加

async function deleteOldWebflowData(seriesId: string) {
  const lessonId = `webflow-series-${seriesId}`;

  // 既存のLessonを取得
  const existingLesson = await client.fetch(
    `*[_type == "lesson" && _id == $lessonId][0] {
      _id,
      "oldQuests": quests[]._ref
    }`,
    { lessonId }
  );

  if (existingLesson && existingLesson.oldQuests) {
    console.log('🗑️  Deleting old Quests...');

    // 古いQuestを削除
    for (const questId of existingLesson.oldQuests) {
      await client.delete(questId);
      console.log(`  ✅ Deleted Quest: ${questId}`);
    }
  }
}

// importFromWebflow関数内で呼び出し
async function importFromWebflow(seriesId: string) {
  // ...

  // 2. 既存データを削除（再インポートの場合）
  await deleteOldWebflowData(seriesId);

  // 3. Lessonを作成
  const lessonId = `webflow-series-${seriesId}`;

  // ...
}
```

**メリット**: 自動化、データクリーン
**デメリット**: スクリプト修正が必要

---

### オプションC: Quest IDを固定して上書き更新（最も安全）

**改善案**:
```typescript
// Quest IDをタイムスタンプではなく、questNumberで固定
async function createQuest(
  questNumber: number,
  title: string,
  articleIds: string[],
  lessonId: string,
  seriesId: string  // 追加
): Promise<string> {
  const questDoc = {
    _type: 'quest',
    _id: `webflow-series-${seriesId}-quest-${questNumber}`,  // 固定ID
    questNumber: questNumber,
    title: title,
    // ...
  };

  const result = await client.createOrReplace(questDoc);
  return result._id;
}
```

**Quest ID例**:
- `webflow-series-684a8fd0ff2a7184d2108210-quest-1`
- `webflow-series-684a8fd0ff2a7184d2108210-quest-2`

**メリット**:
- 再インポートで自動的に上書き更新される
- 重複データが作成されない
- 古いデータ削除が不要

**デメリット**:
- スクリプト修正が必要
- 既存の古いQuestは手動削除が必要（一度だけ）

---

## 🎯 推奨手順（オプションC採用）

### 今回（古いQuest削除 + スクリプト修正）

**Step 1**: 古い孤立Questを削除
```bash
# 削除スクリプトを実行
SANITY_AUTH_TOKEN=your_token npx tsx scripts/delete-old-webflow-quests.ts
```

**Step 2**: import-from-webflow.ts を修正（Quest IDを固定）

**Step 3**: 動作確認
```bash
# 再インポートして動作確認
npm run import-webflow -- --series-id=684a8fd0ff2a7184d2108210
```

---

### 今後（新規または更新インポート）

**常にこの1コマンドでOK**:
```bash
SANITY_AUTH_TOKEN=your_token \
WEBFLOW_TOKEN=your_token \
npm run import-webflow -- --series-id={シリーズID}
```

**動作**:
- 新規シリーズ: 新規作成
- 既存シリーズ: 上書き更新（重複なし）

---

## ⚠️ 注意事項

1. **Article IDは既に固定されている**
   - `webflow-video-{ビデオID}` なので重複しない ✅

2. **Lesson IDは固定されている**
   - `webflow-series-{シリーズID}` なので重複しない ✅

3. **Quest IDだけが問題**
   - 現在: `webflow-quest-{番号}-{タイムスタンプ}` → 毎回異なるID ❌
   - 修正後: `webflow-series-{シリーズID}-quest-{番号}` → 固定ID ✅

---

## 🚨 重要：Sanityで手動編集した内容について

### 現在の動作（問題あり）

**`createOrReplace`の動作**:
- ドキュメント全体を**完全に上書き**する
- Sanityで手動編集した内容は**すべて消える** ❌

**例**:
```typescript
// import-from-webflow.ts (line 554)
await client.createOrReplace(lessonDoc);
// ↑ lessonDoc に含まれないフィールドはすべて削除される
```

### 具体例

**シナリオ**:
1. Webflowからインポート → Lessonタイトル「3構造ではじめるUIデザイン入門」
2. Sanity Studioで手動編集 → タイトルを「【初心者向け】3構造ではじめるUIデザイン入門」に変更
3. Webflowで動画を追加 → 再インポート実行
4. **結果**: タイトルが「3構造ではじめるUIデザイン入門」に戻る ❌

### 影響を受けるフィールド

**現在のインポートスクリプトが設定するフィールド**:
- `title` ← Webflowの値で上書き ❌
- `slug` ← Webflowの値で上書き ❌
- `description` ← Webflowの値で上書き ❌
- `overview` ← Webflowの値で上書き ❌
- `coverImageUrl` ← Webflowの値で上書き ❌
- `iconImageUrl` ← Webflowの値で上書き ❌
- `quests` ← Webflowの値で上書き ❌

**Sanityで追加したフィールド**:
- `category` → インポート後に消える ❌
- `iconImage` → インポート後に消える ❌
- `coverImage` → インポート後に消える ❌

---

## 💡 解決策：patch を使った部分更新

### オプションD: createOrReplace → patch に変更（最も柔軟）

**改善案**:
```typescript
async function createLesson(
  series: WebflowSeries,
  questIds: string[]
): Promise<void> {
  const lessonId = `webflow-series-${series.id}`;

  // 既存のLessonを確認
  const existingLesson = await client.fetch(
    `*[_type == "lesson" && _id == $lessonId][0] {_id}`,
    { lessonId }
  );

  if (existingLesson) {
    // 既存の場合: Webflow由来のフィールドのみ更新（patch）
    console.log(`🔄 Updating existing lesson: ${lessonId}`);
    await client
      .patch(lessonId)
      .set({
        // Webflow由来のフィールドのみ更新
        description: description,
        overview: overview,
        coverImageUrl: coverImageUrl || null,
        iconImageUrl: iconImageUrl || null,
        quests: questIds.map(id => ({
          _type: 'reference',
          _ref: id,
        })),
      })
      .commit();
  } else {
    // 新規の場合: 全フィールドを設定（createOrReplace）
    console.log(`✨ Creating new lesson: ${lessonId}`);
    const lessonDoc = {
      _type: 'lesson',
      _id: lessonId,
      title: name,
      slug: { _type: 'slug', current: slug },
      description: description,
      overview: overview,
      coverImageUrl: coverImageUrl || null,
      iconImageUrl: iconImageUrl || null,
      webflowSource: series.id,
      quests: questIds.map(id => ({
        _type: 'reference',
        _ref: id,
      })),
    };
    await client.createOrReplace(lessonDoc);
  }
}
```

**メリット**:
- ✅ 新規インポート：全フィールドを設定
- ✅ 再インポート：Webflow由来のフィールドのみ更新
- ✅ Sanityで手動編集した`title`, `category`, `iconImage`などは保持される

**デメリット**:
- インポートスクリプトが少し複雑になる

---

### 運用ルール（推奨）

**パターンA: Webflowをマスターとする**
- Webflowで編集 → 再インポート
- Sanityでは編集しない
- 現状のスクリプトでOK

**パターンB: Sanityで一部カスタマイズする**
- Webflowでベースを作成 → インポート
- Sanityで`title`, `category`, `iconImage`などをカスタマイズ
- 再インポート時にカスタマイズを保持したい
- **→ オプションD（patch使用）が必要**

**パターンC: ハイブリッド運用**
- Webflow由来のフィールド：Webflowで管理（description, overview, quests など）
- Sanity独自のフィールド：Sanityで管理（category, iconImage など）
- **→ オプションD（patch使用）が必要**

---

## 📝 次のアクション

1. ⏳ ユーザーに手順を確認してもらう
2. ⏳ オプションC（Quest ID固定）で進めるか決定
3. ⏳ 古いQuest削除スクリプト作成
4. ⏳ import-from-webflow.ts 修正
5. ⏳ 動作確認
