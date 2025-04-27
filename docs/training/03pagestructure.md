## 3. ページ構造 ── BONO Training

### 3.0 ルート階層

```
/training
|-- index                    # Training Home（一覧・タグ絞り込み）
|-- tags/[tag]               # タグ別フィルタ
|-- [trainingSlug]           # Training 詳細（Task 一覧）
|   |-- index
|   └-- [taskSlug]          # Task（お題）ページ
|-- _fallback
```

> **Layout スコープ**  
> `/training/*` 以下は `<TrainingLayout>`―独自ヘッダー / フッター / テーマを適用。  
> `<RootLayout>` 配下に配置することで **Auth / Billing Context** を継承。

### 3.1 ページ詳細

| Route                                              | コンポーネント       | 主な責務                                                                                                                        |
| -------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **/training**                                      | `<TrainingHome>`     | - Challenge / Skill タブ切替<br>- `<TagFilter>` `<SearchBox>`<br>- `<ChallengeGrid>`: card(Thumb, Title, Difficulty, isPremium) |
| **/training/tags/[tag]**                           | `<TrainingTagList>`  | - タグ別一覧（同 Grid）<br>- `tag` param でメタ情報変更                                                                         |
| **/training/search**                               | `<TrainingSearch>`   | - キーワード検索結果<br>- `?q=` で FlexSearch インデックス参照                                                                  |
| **/training/[trainingSlug]**                       | `<TrainingDetail>`   | - Training 概要（Title, Description, Difficulty）<br>- `<TaskList>` (Step 1…n) <br>- `<ProgressBar>` (完了率)                   |
| **/training/[trainingSlug]/progress** _(optional)_ | `<TrainingProgress>` | - Task ごとの完了チェック編集<br>- シェアボタン（作品まとめツイート）                                                           |
| **/training/[trainingSlug]/[taskSlug]**            | `<TaskPage>`         | - MDX 本文 & Video <br>- `<GateBanner>` for premium lock <br>- `<Checkbox onComplete>` 更新 + SNS share                         |
| **/training/\_fallback**                           | `<Training404>`      | - Training 専用 404 / 301 ヒント                                                                                                |

### プログレス機能とは？

| 観点                       | 内容                                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **機能概要**               | 各 _Task_（お題）を「✓ 完了」チェックすると、Training 詳細ページで **進捗バー** が更新されるシンプルな仕組み。                                |
| **ユーザーストーリー**     | _As a_ 学習者<br>_I want_ 完了したお題が一目で分かり、残りが把握できる<br>_So that_ 翌日どこから再開すればよいか迷わず学習を続けられる。      |
| **最小 MVP 実装**          | - Task ページ右上に ✅ チェックボックス<br>- クリックで `status = done` を Supabase に保存<br>- Training 詳細で「3/5 完了」「進捗 60%」を表示 |
| **なぜ“リッチ過ぎない”か** | - ゲーミフィケーションはバッジのみ（レベル計算は後回しでも可）<br>- チャート・通知・カレンダー等は入れない                                    |

> **要するに**「自分の _今_ を可視化」できれば学習継続のモチベになる ── これだけに絞ります。

### 各スラッグに対応する MDX ファイル：

`content/training/ui-todo/build-home-ui.mdx`

---

### 3. `tags` の扱い

| 目的                 | 例                                                                       |
| -------------------- | ------------------------------------------------------------------------ |
| **分類（カテゴリ）** | `ui`, `ux`, `figma`, `layout`, `accessibility` …                         |
| **利用シーン**       | - Training Home でタグフィルタ<br>- `/training/tags/ux` ルートに一覧表示 |
| **front-matter**     | `yaml<br>tags: ["ui", "easy"]<br>`                                       |

> 要は「カテゴリー兼フィルタキー」です。必要最低限の数から始め、コンテンツが増えたら拡張する方針で OK です。
