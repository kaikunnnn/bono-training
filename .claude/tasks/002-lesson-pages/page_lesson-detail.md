# レッスン詳細ページ

## レッスン詳細について

- レッスンは様々なものを作成していきます
- デザインのカテゴリごとに一覧ページでまとめて表示したり、特別な括り（初心者はこれをやるべし、など）でも表示したりしたいです。
- 実装のことは私は詳しくないですが CMS を使って管理したほうがよいかもしれない？です。そのあたりも相談したいので議論させてっください
- レッスン一覧ページで実装している item_lesson はこの詳細の情報を表示するものになります。

## レッスン詳細ページ（/lessons/[lessonSlug]）の詳細イメージ

1. 情報構造（IA）

ヘッダー（Hero）
• レッスンタイトル
• ディスクリプション（短文）
• レッスンアイコン（象徴画像）
• 背景 SVG（装飾, レイヤー分離で重ねる）
• 所属カテゴリー（ピル）
• 所属ロードマップ（任意表示：ピル＋リンク）
• 主要 CTA：「はじめる」（= クエスト 1 の最初のコンテンツへ遷移）

概要セクション
• 概要（ディスクリプションより長いリッチテキスト/プレーンテキスト可）
• 目的（複数可：1/3/5…の箇条書き）
例：
• UI における配色の役割を説明できる
• コンポーネントごとに適切な色を選定できる
• 配色のコントラストと優先度設計を実践できる

クエスト一覧（目次）
• Quest1…n（タイトル、ゴール、所要時間、進捗バッジ）
• 各クエスト内のコンテンツ（動画/記事）リストをプレビュー表示
• 種別アイコン、想定時間、完了状態
• クリックで /lessons/[lesson]/quests/[quest] へ

（任意）関連情報
• 所属ロードマップの該当ステップへの導線
• 同カテゴリーの関連レッスン

⸻

2. URL / 遷移
   • レッスン詳細（このページ）：/lessons/[lessonSlug]
   • クエスト詳細：→ 不要。クエストはコンテンツではなく「ブロック」の概念にまずはしたい。
   • クエスト内コンテンツ個別（任意）：/lessons/[lessonSlug]/quests/[questSlug]/[contentSlug]

「はじめる」ボタンの遷移ルール
• 既に学習履歴がある場合：最後に未完了のコンテンツへ
• 未学習の場合：Quest1 の先頭コンテンツへ
例：/lessons/ui-color-basics/quests/role-of-color/intro

⸻

3. データモデル（TypeScript / Headless CMS 想定）

type ImageAsset = {
url: string;
alt: string;
width?: number;
height?: number;
};

type SVGAsset = {
// インライン SVG 文字列 or ファイル URL
inline?: string;
url?: string;
// 配置用メタデータ（任意）
position?: 'top' | 'center' | 'bottom';
opacity?: number;
};

type CategoryRef = {
slug: string;
name: string;
};

type RoadmapRef = {
slug: string;
name: string;
level?: string; // Lv0〜Lv5 など（任意）
stepSlug?: string; // 紐づくステップがあれば
};

type ContentType = 'video' | 'article';

type Content = {
slug: string;
type: ContentType;
title: string;
estTimeMins?: number;
isRequired: boolean; // クエスト完了条件に含めるか
// 表示用
videoUrl?: string; // type=video
articleBodyMdx?: string; // type=article
};

type Quest = {
slug: string;
title: string;
goal: string;
estTimeMins?: number;
contents: Content[];
};

type Lesson = {
slug: string;
title: string; // レッスンタイトル
description: string; // 短い説明（Hero 用）
icon: ImageAsset; // 象徴画像
backgroundSvg?: SVGAsset; // 背景素材
categories: CategoryRef[]; // 所属カテゴリー
roadmap?: RoadmapRef; // 所属ロードマップ（任意）
overview?: string; // 長文の解説（リッチテキスト/MDX 可）
objectives: string[]; // 目的（複数可）
quests: Quest[]; // クエストとその中のコンテンツ
};

進捗モデル（ストレージ例）

type Progress = {
lessonSlug: string;
completedContentSlugs: string[]; // /lessons/..../[contentSlug] ベースで一意
completedQuestSlugs: string[];
updatedAt: string;
};

⸻

4. UI コンポーネント（Next.js + TS + shadcn）
   • LessonHero：タイトル / ディスクリプション / アイコン / 背景 SVG / カテゴリピル / ロードマップピル / 「はじめる」
   • LessonObjectives：目的リスト（チェックアイコン付き）
   • LessonOverview：長文テキスト（MDX 対応）
   • QuestIndex：クエストカード（タイトル・ゴール・所要時間・進捗）
   • QuestPreview：クエスト内コンテンツのプレビュー（type, 時間, 必須バッジ）
   • StickyStart（SP）：「はじめる / 続きから」固定ボタン
   • RelatedBlock（任意）：ロードマップや関連レッスン導線

アクセシビリティ
• 背景 SVG は aria-hidden="true"、装飾扱い
• 見出し階層：h1=レッスン名、以降 h2=概要/目的/クエスト など
• 目的リストは<ul>、コンテンツ種別はアイコン＋テキスト併記

⸻

5. 完了ロジック（デフォルト）
   • コンテンツ完了：
   • 動画：再生 80%到達で自動完了（手動チェックも可）
   • 記事：90%スクロールで自動完了（手動チェックも可）
   • クエスト完了：そのクエストの必須コンテンツ（isRequired）を全完了
   • レッスン完了：全クエスト完了

「はじめる/続きから」の出し分け
• Progress を見て、未学習なら「はじめる」、途中なら「続きから」
• ボタンのリンク先は未完了の最初のコンテンツを解決して指定

⸻

6. 計測（GA イベント例）
   • lesson_open（{ lessonSlug }）
   • lesson_start_click（{ lessonSlug, targetPath }）
   • content_complete（{ lessonSlug, questSlug, contentSlug, type }）
   • quest_complete（{ lessonSlug, questSlug }）
   • lesson_complete（{ lessonSlug }）
   • objective_view（{ lessonSlug }）※概要の可視領域到達で

⸻

7. 受け入れ基準（抜粋）
   • /lessons/[slug] でヘッダー（タイトル/説明/アイコン/背景 SVG/カテゴリ/ロードマップ/CTA）が表示される
   • 目的リストが複数件レンダリング可能（1/3/5…）
   • クエスト一覧と、その中のコンテンツプレビューが閲覧できる
   • 「はじめる」→ Quest1 の先頭コンテンツへ遷移（学習履歴ありなら「続きから」で未完了の最初へ）
   • 動画/記事で自動完了が発火し、進捗バーとボタン表記が更新される
   • 構造化データ（BreadcrumbList / Article 任意）を出力

⸻

8. サンプル（UI 配色の基礎）

{
"slug": "ui-color-basics",
"title": "UI 配色の基礎",
"description": "UI で色が果たす役割から、実務で使える配色の選び方までを短時間で身につけます。",
"icon": { "url": "/img/lessons/color-basics.png", "alt": "カラーパレット" },
"backgroundSvg": { "url": "/svg/bg/color-waves.svg", "position": "top", "opacity": 0.25 },
"categories": [{ "slug": "ui", "name": "UI" }],
"roadmap": { "slug": "ui-foundations", "name": "UI 基礎ロードマップ", "level": "Lv1", "stepSlug": "visual-basics" },
"overview": "このレッスンでは、UI における色の役割（情報の区別、階層、状態表現、行動誘導）を理解した上で、ボタン/テキスト/ボーダーなど用途別の配色原則を学び、実務で再現可能な配色決定プロセスを体得します。",
"objectives": [
"UI で色が果たす 4 つの役割を説明できる",
"用途別に色を選ぶ基準（ボタン/リンク/ボーダー/文字）を適用できる",
"コントラスト比と優先度を踏まえ、配色を意図的に設計できる"
],
"quests": [
{
"slug": "role-of-color",
"title": "配色の役割を知ろう",
"goal": "色の役割と使い分けの全体像を理解する",
"estTimeMins": 20,
"contents": [
{ "slug": "intro", "type": "video", "title": "UI で色が担う役割（概観）", "estTimeMins": 6, "isRequired": true, "videoUrl": "https://..." },
{ "slug": "action-colors", "type": "article", "title": "アクション用の配色（CTA/リンク）", "estTimeMins": 7, "isRequired": true, "articleBodyMdx": "...mdx..." },
{ "slug": "border-text-colors", "type": "article", "title": "ボーダー/テキストの配色とコントラスト", "estTimeMins": 7, "isRequired": true, "articleBodyMdx": "...mdx..." }
]
},
{
"slug": "apply-colors",
"title": "配色を実践してみよう",
"goal": "用途別の配色を実 UI に当てはめる",
"estTimeMins": 25,
"contents": [
{ "slug": "button-colors", "type": "video", "title": "ボタン色の選び方（優先度 × 状態）", "estTimeMins": 8, "isRequired": true, "videoUrl": "https://..." },
{ "slug": "exercise-buttons", "type": "article", "title": "演習：3 種類の CTA を設計する", "estTimeMins": 10, "isRequired": true, "articleBodyMdx": "...mdx..." },
{ "slug": "review-checklist", "type": "article", "title": "チェックリスト：配色の最終確認", "estTimeMins": 7, "isRequired": false, "articleBodyMdx": "...mdx..." }
]
}
]
}

⸻

これで、あなたが追加する具体テキスト（概要/目的）や実動画リンク/MDX をはめ込めば、そのまま動く形にできます。
続けて、他のレッスンでもこのスキーマを共通利用できます（カテゴリ＆ロードマップ参照は任意）。
