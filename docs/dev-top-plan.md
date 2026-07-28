# /dev/top 新トップページ実装プラン

Figma: `PRD🏠_topUI_newBONO2026`（fileKey: `43rIPBQ9lm2b4DO2gElXCO`）

Linear / rebono/issues がこのリポジトリに存在しないため、このファイルで進捗・コンポーネント設計・未決事項を一元管理する。ブロックを1つ実装するたびに必ずこのファイルを更新する。

## 着手手順（新ブロックが来たら必ずこの順で）

1. Figma `get_design_context` / `get_metadata` でノード取得。まず「header-block」（バッジ/カテゴリ+見出し+説明+リンク）と「banner-inner」（text-area+visual-area のカード/バナー枠）の2パターンのどちらかに当てはまらないか照合する（このページはこの2パターンの反復が多い）
2. 下記「コンポーネント台帳」と `src/components/top/home/*.tsx` を読み、再利用可否を次の3分類で判定してユーザーに一言確認する
   - **A: 既存のまま再利用**（差分ゼロ）
   - **B: 既存部品にvariant/propsを追加して再利用**
   - **C: 新規コンポーネント**（propsを3つ以上足さないと表現できない/レイアウト軸が既存に収まらない場合のみ）
3. B の場合は既存の使用箇所が壊れないか（tsc + 該当セクション目視）を必ず確認する
4. 実装は implementer に委譲。完了後は下記「完了チェックリスト」を実施
5. このファイルの「ブロック台帳」「コンポーネント台帳」「未決事項」を更新する

## 完了チェックリスト（ブロックごとの定型）

- [ ] Figma生成コードとの数値突合: gap / padding / font-size / weight / line-height / radius / 色（トークン名まで）
- [ ] トークン照合: 生hexが混入していないか、`.claude/design-system/colors_and_type.css` の変数に置換されているか
- [ ] URL照合: href が `src/app/` の実ルートに存在するか（未定なら「未決事項」に記録し `#` は使わない）
- [ ] アセット照合: 参照画像が `/public/images/top/` に存在するか
- [ ] `npx tsc --noEmit` / `npm run build`
- [ ] Figmaスクショとローカル表示の目視比較（ユーザー確認）

## ブロック台帳

| # | ブロック名 | Figma node-id | 状態 | 使用コンポーネント | リンク先 | データソース |
|---|---|---|---|---|---|---|
| A | ヒーロー | 662-40038 | 実装済（未コミット） | `HeroSection` | `/subscription`(暫定), `/roadmap` | 静的（本文はダミー） |
| B | 訴求3ブロック（B-1 最新コンテンツ / B-2 機能訴求） | 689-6919 | 実装済（未コミット） | `HighlightPromoSection` → `CoursePromoCard`(spotlight) + `FeatureLinkGrid` | `/roadmap`, `/lessons`, `/guide`, `/feedbacks` | 静的（仮コピー） |
| 1 | アイキャッチ | (既存/未特定) | 実装済・コミット済 | `EyecatchSection` | - | モック |
| 2 | 新着コンテンツ一覧（= B-3） | 564-22162 / 671-7338 | 実装済・コミット済（aspect-video + line-clamp-1 修正） | `NewContentSection` | - | モック（`getLatestMixedContent()` 実装済・接続は未） |
| 3 | コース訴求バナー | 552-743 | 実装済・コミット済 | `CourseBannerSection` | - | モック |
| 4 | あなたにおすすめのコース | 671-7219 | 実装済・コミット済 | `CoursePromoSection` → `CoursePromoCard` | `/roadmap`, `/training` | モック |
| 5 | 課題解決のデザインをはじめる | 662-39727 | 実装済・コミット済 | `CourseHighlightSection` → `SectionBadgeHeading` + `CoursePromoCard` | `/roadmap`, `/training` | モック |
| C | 課題解決セクション2つ目「UIUXデザイナーに転職する」 | 671-6642 | 実装済（未コミット） | `CourseHighlightSection`(headingSize="md") → `SectionBadgeHeading`(28px) + `CoursePromoCard`(visual="og") | `/roadmap`, 外部 `kaikun.bo-no.design/career/beginner`(別タブ) | OGP画像（`getOgImageUrl`）＋仮コピー |
| D | デザインとキャリアを考える（ダーク背景） | 662-39684 | 実装済（未コミット） | `DesignCareerSection` → `SectionBadgeHeading`(inverse) + `DarkArticleItem`×3 | `/roadmap`(暫定×3) | OGP画像（`getOgImageUrl`）＋仮コピー |
| E | レッスン特集×2 | 679-7773 | 実装済（未コミット） | `LessonHighlightSection` → `LessonCardRenderer`(=`/lessons`と同一カード)×3×2行 | `/lessons/[slug]`（カード内リンク） | 実データ（`getAllLessonsWithArticleIds()`、行割当は暫定 slice） |
| F | みんなの実績 | 662-39795 | 実装済（未コミット） | `AchievementHighlightSection` → `AchievementCard`×3（統一カード） | `/stories/[slug]`（内部）/ アウトプット外部URL（別タブ） | 実データ（`getLatestAchievements(3)` = story + userOutput 混在・公開日順） |

## コンポーネント台帳（`src/components/top/home/`）

| コンポーネント | 役割 | 主なprops | 使用箇所 |
|---|---|---|---|
| `CoursePromoCard` | 汎用コース訴求カード（top固有の型に非依存） | `layout`("default"\|"title-first"), `visual`("collage"\|"single" + `gradientPreset`\|"spotlight"\|"og"), `categoryLabel`, `typeLabel`, `title`, `description`, `ctaLabel`, `href`, `external`(別タブ) | ブロック4, 5, B-1, C |
| `HeroSection` | ヒーロー（左テキスト+右画像プレースホルダー） | `className` | ブロックA |
| `HighlightPromoSection` | 訴求3ブロックの親（B-1 spotlight 3枚 + B-2 機能訴求） | `className` | ブロックB |
| `FeatureLinkGrid` | サービス機能訴求4項目グリッド（黄色アイコンボックス） | `className` | ブロックB-2 |
| `SectionBadgeHeading` | ピルバッジ + 見出し | `badgeLabel`, `heading`, `size`("lg"=32px\|"md"=28px), `inverse`(白系反転) | ブロック5, C, D |
| `CoursePromoSection` | ブロック4専用ラッパー（見出し+リンク型ヘッダー + カード2枚グリッド） | `heading`, `allCoursesLink`, `cards` | ブロック4 |
| `CourseHighlightSection` | 課題解決セクション用ラッパー（バッジ見出し型ヘッダー + カード2枚グリッド） | `badgeLabel`, `heading`, `headingSize`("lg"\|"md"), `cards` | ブロック5, C |
| `DarkArticleItem` | ダーク背景の記事アイテム（16:9サムネ+タイトル+説明+相談CTA、Link全体） | `title`, `description`, `thumbnailSrc`, `href`, `ctaLabel`, `size`("large"\|"default"), `external` | ブロックD |
| `DesignCareerSection` | ダーク背景「デザインとキャリアを考える」（async / OGP取得） | `badgeLabel`, `heading`, `largeItem`, `smallItems` | ブロックD |
| `LessonHighlightSection` | レッスン特集（メイン見出し + サブ見出し行×N、各行カード3枚）。カードは `/lessons` と同じ `LessonCardRenderer` を流用しデザイン再実装しない。見出し・余白のみ Figma 準拠 | `heading`, `rows`({ `subheading`, `lessons`: `LessonWithArticleIds[]` }[]) | ブロックE |
| `AchievementHighlightSection` | みんなの実績（見出し1つ + 統一カード3枚グリッド）。外側 `py-[120px]` / 見出し→カード `gap-[48px]` / カード間 `gap-[24px]`。Figma の2行構成ではなく story+output 混在の1行に統合 | `heading?`, `items`: `AchievementCardProps[]`（= `getLatestAchievements` の返り値） | ブロックF |
| `AchievementCard` | みんなの実績の統一カード（story/output 共通）。16:9サムネ + タイプラベル + タイトル(`line-clamp-2`) + 著者名。story は内部 `Link`、output は外部 `<a target="_blank">`。ホバーは `opacity-90` | `type`("story"\|"output"), `title`, `thumbnailUrl`, `authorName?`, `href`, `className?` | ブロックF |
| `EyecatchSection` | アイキャッチ | - | ブロック1 |
| `NewContentSection` | 新着コンテンツ一覧 | `items` | ブロック2 |
| `CourseBannerSection` | コース訴求バナー | - | ブロック3 |

グラデーションプリセット（`CoursePromoCard` の `gradientPreset`）: `ui-visual` / `career-change` / `ui-beginner` / `info-arch` / `ux-design`（`.claude/design-system/colors_and_type.css` の `--grad-*` に対応、`ux-design`はまだ未使用）。

## /dev/top2・/dev/top3（再構築版）について

`/dev/top` でスタイル崩れ（font-weight不一致、共有コンポーネントへの副作用、パーセンテージサイズの誤動作等）が見つかったため、`.claude/skills/design/SKILL.md` の手順（コンポーネント単位→ブロック単位、スクリーンショット必須の視覚確認）で1から再構築したのが `/dev/top2`（Figma実測px通り）・`/dev/top3`（title/description等をFigma実測より2px小さくした版。ユーザー確認済みで、今後はこちらを正とする）。コンポーネントは `src/components/top2/` 配下に新規作成している（`src/components/top/home/` の旧実装とは別系統。ただし `LessonHighlightSection` と `AchievementHighlightSection` は品質に問題がなかったため top/home から流用し `compact` prop を追加）。

`/dev/top3` の構成（上から順）:

| ブロック | Figma node-id | コンポーネント | データソース |
|---|---|---|---|
| A アイキャッチ | 662-40038 | `EyecatchHero` | 静的（本文はダミー、右画像は実画像を試験採用） |
| B-1 最新コンテンツ訴求 | 662-40053 | `LatestContentPromo` → `SpotlightPromoCard` | 静的（仮コピー、サムネはグレープレースホルダー） |
| B-2 サービス機能訴求（見出し「目的から探す」込み） | 662-39676 | `FeatureLinkGrid` | 静的（Figma確定データ） |
| B-3 あたらしいコンテンツ | 671-7338 | `NewContentList` | 実データ（`getLatestMixedContent(3)`） |
| 5 課題解決のデザインをはじめる | 662-39727 | `CourseHighlightSection5` | 静的（仮コピー、サムネはグレープレースホルダー） |
| C 課題解決セクション「UIUXデザイナーに転職する」 | 671-6642 | `CourseHighlightSection2` → `CourseHighlightCard` | 静的（仮コピー） |
| D デザインとキャリアを考える（ダーク背景） | 662-39684 | `DesignCareerSection2` → `DarkGuideItem` | 静的（仮コピー、全リンク`/roadmap`暫定） |
| E レッスン特集×2 | 679-7773 | `LessonHighlightSection`（top/home流用） | 実データ（`getAllLessonsWithArticleIds()`、行割当は暫定slice） |
| F みんなの実績（転職インタビュー×3 + アウトプット×3、別グループ） | 662-39795 | `AchievementHighlightSection`（top/home流用） → `AchievementCard` | 実データ（`getAchievementGroups(3)`） |

**注意**: 「5」と「C」はFigma上で連続する別々のセクション（662-39727が先、671-6642が後）。一度「5」の実装を丸ごと忘れていたことがあるので、以後ブロックを数える時は必ずFigmaの実際の出現順を `get_metadata` で再確認してから「抜けがないか」チェックする。

## 未決事項

- `NewContentSection` のモックデータ → Sanity接続タイミング（プロトタイプ完了後に一括対応予定）。`getLatestMixedContent(limit)` は `src/lib/sanity.ts` に実装済み。接続時は page.tsx を Server Component 化し `MixedContentItem[]` を items に渡す
- 各ブロックの最終的なリンク先（`/roadmap`, `/training` 以外の遷移先が今後増える可能性）
- ブロック4(`CoursePromoSection`)とブロック5(`CourseHighlightSection`)のヘッダー型が異なる（見出し+リンク型 / バッジ+見出し型）。将来同じ見出し型を使うブロックが増えた場合、共通化するかは都度判断
- **【ブロックA】CTAリンク先要確認**: 「メンバーになってはじめる」の遷移先を暫定で `/subscription` にした（EyecatchSection の既存導線に合わせた）。`/signup` との使い分けを要確認
- **【ブロックA】** ヒーロー本文がダミー文言（住宅リース会社テンプレ）。実際のBONOコピーへ差し替え要。右画像もプレースホルダー（本画像未確定）
- **【ブロックB-1】** spotlight カード3枚は仮コピー・ダミー画像（course配下流用）。実データ差し替え要
- **【ブロックB-2】掲示板ルート未確定**: 掲示板の実ルートが見つからず暫定で `/guide` にリンク
- **【ブロックC / ブロックD】OGPサムネイル**: サムネイルは各リンク先の OGP 画像を `src/lib/og-image-fetch.ts` の `getOgImageUrl(url)` で取得（対象ページのHTMLを fetch し `<meta property="og:image">` を正規表現で抽出。内部パスは `NEXT_PUBLIC_SITE_URL` で絶対URL化、外部URLはそのまま。取得失敗時は null → `bg-muted-custom` フォールバック）。ファイル名は既存 `src/lib/og-image.tsx`（`generateOgImage`）との `@/lib/og-image` 解決衝突を避けるため `og-image-fetch.ts` とした。`next.config.ts` に `bo-no.design` / `*.bo-no.design` を `remotePatterns` 追加済み。ページは async Server Component 化（`/dev/top` は ƒ = dynamic）
- **【ブロックC】リンク先**: カード1は `/roadmap` 一覧（特定ロードマップのスラッグ未確定 → todo）。カード2は外部 `https://kaikun.bo-no.design/career/beginner`（別タブ）。仮コピーは todo に記録
- **【ブロックD】リンク先・コピー**: large + small×2 の3項目とも暫定で `/roadmap`。トップ専用の実コピー・リンク先は未定 → todo に記録
- **【ブロックE / レッスン特集】カード流用・行割当**: カードは Figma のデザインを追わず `/lessons` と同じ `LessonCardRenderer`（内部 `LessonCard`）をそのまま再利用（ユーザー指示「レッスンのコンポーネントは /lessons と同じものを使いたい、Figma のデザインは一旦スルー」）。`LessonHighlightSection` が担うのは見出し・余白（セクション全体のリズム）のみ。データは `getAllLessonsWithArticleIds()` の実データを使用。ただし各行 3 件の割当は「先頭から `slice(0,3)` / `slice(3,6)`」の暫定であり、Figma の「基本のデザインワークフロー」「UIデザインをはじめる」というテーマに沿ったキュレーションではない → Sanity のタグ／セクション整理後に `sections.ts` の `RECOMMENDED_SECTIONS` 相当のロジックで差し替え要（todo）
- **【新規トークン】**: `--bg-dark-section: #050423`（ダーク背景セクション用）を `colors_and_type.css` と `globals.css`（+ `--color-dark-section` で `bg-dark-section` ユーティリティ化）に追加
- **【ui/button 拡張】**: ダーク背景 pill 用 variant `dark-outline`（黒背景+白/20ボーダー+白文字+pill）を `ui/button.tsx` に追加（`DarkArticleItem` の「相談する」で使用）
- **【ブロックF / みんなの実績】最終仕様: 転職インタビュー×3 + アウトプット×3を別グループで表示**: Figma実データ（node 662-39795）は「体験談3枚」「アウトプット3枚」を別々の行・異なるカードデザインで表示していたが、ユーザー指示により①見出し1つ「みんなの実績」②カードデザインは統一(`AchievementCard`)③ただし**中身は混ぜず、story×3・output×3をそれぞれ別グループとして表示**という仕様に確定した（一時「混ぜて最新3件」という解釈で実装したが誤りだったため修正済み）。データは `getAchievementGroups(3)`（`getStoriesList(3)`＋`getOutputsList(3)` を別々に取得、混ぜない）。story は内部リンク `/stories/[slug]`、output は外部URL別タブ。サムネイルは16:9固定。**残る検討**: (1) output の `articleImage` の `remotePatterns` 制約（既存踏襲、既知の制約）。(2) 見出しコピー・カードラベル文言は仮。(3) 「すべて見る」導線は今回のスコープ外。
- **【ブロックB-3 / 新着コンテンツ】イベント・レッスン対応済み**: `getLatestMixedContent` に events と lessons を統合済み。
  - イベント: `getAllEvents()`（`src/lib/sanity.ts`）を新規実装。`*[_type == "event"] | order(publishedAt desc)` で一覧取得し、`publishedAt` でマージ。href は `/events/[slug]`（一覧ページは未実装だが詳細ページへのリンクとして機能）
  - レッスン: `publishedAt` は持たないが、Sanity システムフィールド `_createdAt` を `getAllLessons` のクエリに追加し publishedAt 代わりに利用してマージ。`_createdAt` が欠ける場合は lessonNumber から擬似日付（2000-01-01 起点、番号が大きいほど新しい扱い）を生成してフォールバック。href は `/lessons/[slug]`
  - 残る制約: イベントの一覧ページ（`/events`）は未実装のまま（詳細ページのみ）

---

## ページ全体構造の棚卸し（node 662-39669、ユーザーが「全体把握目的」で共有）

サイドナビゲーションは対象外（ユーザー確認済み）。上から順に以下のブロックが存在する。

| # | y位置 | ブロック名（仮） | Figma node-id | 状態 |
|---|---|---|---|---|
| A | -2〜544 | ヒーロー(Roof-1) | 662:40038 | 実装中 |
| B | 542〜1615 | 訴求3ブロック（命名要検討） | 689:6916 | 実装中 |
| C | 1618〜3326 | 課題解決セクション×2 | 662:39727(実装済=ブロック5), 671:6642(実装済=ブロックC) | 実装済（未コミット） |
| D | 3442〜4696 | GUIDE CONTENTS「デザインとキャリアを考える」 | 662:39684 | 実装済（未コミット） |
| E | 4696〜6069 | レッスン特集×2 | 679:7773 | 未着手 |
| F | 6014〜7427 | 体験談+アウトプット | 662:39795 | 未着手 |
| G | 7538〜8084 | GUIDE CONTENTS「BONOをはじめよう」 | 662:39885 | 未着手 |
| H | 8170〜9070 | ダークフッター刷新 | 662:39922 | 未着手・サイト全体スコープの別タスクの可能性（要相談） |

## ブロックA: ヒーロー（662:40038）

Figma実データ: 見出し「はじめよう!／キモチがうごく／ものづくり」(40px)、サブ見出し「ユーザーを軸にしたデザインを身につける」(24px)、本文「『初期費用』0円のリースもしくは一括購入。お客様のファイナンスプランに合わせて選択可能です。」(14px、住宅リース会社のダミー文言)、CTA「メンバーになってはじめる」/「ロードマップへ」、右画像はダミー（住宅の屋根写真）。

**ダミー文言リスト（本当の文章を後で教えてください）**:
- 本文パラグラフ「初期費用0円のリース...」→ BONO向けの実文言に差し替え要
- 右画像 → ダミーと分かる形で実装、後で本画像に差し替え

見出し2つ・CTAラベルはBONOのトンマナと一致するため実データとして採用。既存`EyecatchSection`(ブロック1)との関係（置き換えか併存か）は実装しながら判断し、必要なら報告する。

## ブロックB: 訴求3ブロック（689:6916）

1. **最新コンテンツ訴求**(662:40053, カード3枚): 既存`CoursePromoCard`と構造が異なる第3variant（角丸4px・単一センター画像・カテゴリラベルなし・タイトル20px）。ロードマップ/レッスン/記事のトップ向けコピーは実装時に仮コピーを入れ、後で差し替え依頼する
2. **サービス機能訴求**(662:39678): Figmaで4項目確定済み——「ロードマップ/スキルアップ計画を立てる」「フィードバック/プロに改善点をもらう」「レッスン/UI・UXのコンテンツ」「掲示板/質問・相談する」。黄色トークン(#f7f7ca)は design-system に無いため新規追加。アイコンは lucide-react から意味の合うものを選定
3. **新着コンテンツ訴求**(671:7338 = 既存ブロック2): 下記データ設計を参照

## 新着コンテンツのデータ設計（読み込み速度に関わるため丁寧に）

対象5種（記事・レッスン・掲示板スレッド・イベント・読み物）は全て Sanity 上に `publishedAt` を持つ（レッスンのみ要確認）。

- 横断的に日付順マージする関数が現状存在しない → `src/lib/sanity.ts` に `getLatestMixedContent(limit)` を新規実装
- イベントは一覧取得関数 `getAllEvents()` を新規実装済み（`getLatestMixedContent` に統合）。一覧ページ `/events` は未実装のまま（詳細取得`getEvent(slug)`＋詳細ページのみ）
- 記事`/articles`、レッスン`/lessons`、読み物`/guide`、ブログ`/blog`、ストーリー`/stories`、フィードバック`/feedbacks`の一覧ページは既存
- 現行`NewContentSection`のサムネイルは`aspect-[480/253]`(≒1.90:1)で16:9ではない → 修正必要
- タイトルに`line-clamp`指定なし → `line-clamp-1`追加必要
- 新着コンテンツ一覧ページ(SEO用)は新規作成が必要かどうか、既存の各カテゴリ一覧ページとの重複を見ながら判断

パフォーマンス観点: 5種横断クエリは全件取得ではなく各タイプ`limit`件+`publishedAt desc`のfetchをPromise.allで並行実行し、結合後にソート・スライスする設計にする（実装時に反映）。
