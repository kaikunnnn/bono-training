# サイドナビゲーション Figma 仕様

## 概要

記事詳細ページの左サイドナビゲーション。レッスン情報とクエスト/記事リストを表示。

---

## 1. サイドナビ全体（ArticleSideNav）

### Figma CSS

```css
/* ここにFigmaからコピーしたCSSを貼り付け */
```

### 現在の実装

- ファイル: `src/components/article/sidebar/ArticleSideNav.tsx`
- 幅: 320px
- 背景: gray-200 border-r

---

## 2. ロゴ部分（LogoBlock）

### Figma CSS

```css
/* ここにFigmaからコピーしたCSSを貼り付け */
→グローバルナビゲーションのロコ部分と全く同じブロックです。その内容でお願いします。

```

### 現在の実装

- ファイル: `src/components/article/sidebar/LogoBlock.tsx`

---

## 3. レッスン情報カード（LessonSection）

### Figma CSS

### 詳細を記す

```css
# LessonDetailCard コンポーネント仕様書

## 概要

レッスンの進捗状況を表示するカード。ArticleDetailページのサイドバーで使用。
アイコン、タイトル、プログレスバーを表示。

---

## annotation（実装メモ）

| 要素 | 説明 |
|------|------|
| icon | lessonのicon情報がここに来ます |
| タイトル | lessonのタイトルがここに |

---

## 構造

```

LessonDetailCard (w-[304px])
├── content (h-[140px], gap-16px)
│ ├── Icon（レッスンアイコン画像）
│ └── InfoArea (gap-9px)
│ ├── Title（レッスンタイトル）※下線付き
│ └── ProgressBar
│ ├── Bar（プログレスバー本体）
│ └── Percentage（25%）

````

---

## Props

```tsx
interface LessonDetailCardProps {
  iconUrl: string;    // lessonのicon情報
  title: string;      // lessonのタイトル
  progress: number;   // 進捗率 0-100
  href?: string;      // クリック時の遷移先
}
````

---

## スタイル詳細

### カード全体

```tsx
className =
  "w-[304px] bg-white border border-[rgba(0,0,0,0.08)] rounded-[20px] overflow-hidden pt-[24px] pb-[20px] px-[20px] flex flex-col items-start";
```

| プロパティ   | 値                         | Tailwind                           |
| ------------ | -------------------------- | ---------------------------------- |
| 幅           | 304px                      | `w-[304px]`                        |
| 背景         | #FFFFFF                    | `bg-white`                         |
| border       | 1px solid rgba(0,0,0,0.08) | `border border-[rgba(0,0,0,0.08)]` |
| 角丸         | 20px                       | `rounded-[20px]`                   |
| padding 上   | 24px                       | `pt-[24px]` または `pt-6`          |
| padding 下   | 20px                       | `pb-[20px]` または `pb-5`          |
| padding 左右 | 20px                       | `px-[20px]` または `px-5`          |
| overflow     | hidden                     | `overflow-hidden`                  |

---

### コンテンツエリア

```tsx
className =
  "w-full h-[140px] flex flex-col items-center justify-center gap-[16px]";
```

| プロパティ | 値    | Tailwind                    |
| ---------- | ----- | --------------------------- |
| 幅         | 100%  | `w-full`                    |
| 高さ       | 140px | `h-[140px]`                 |
| gap        | 16px  | `gap-[16px]` または `gap-4` |

---

### アイコン

```tsx
className =
  "aspect-[276/417] flex-1 bg-black rounded-tr-[4px] rounded-br-[4px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.19)]";
```

| プロパティ   | 値                           | Tailwind                                    |
| ------------ | ---------------------------- | ------------------------------------------- |
| アスペクト比 | 276:417                      | `aspect-[276/417]`                          |
| 角丸         | 右上・右下 4px               | `rounded-tr-[4px] rounded-br-[4px]`         |
| shadow       | 0px 1px 4px rgba(0,0,0,0.19) | `shadow-[0px_1px_4px_0px_rgba(0,0,0,0.19)]` |

---

### 情報エリア

```tsx
className = "w-full flex flex-col items-center gap-[9px]";
```

| プロパティ | 値   | Tailwind    |
| ---------- | ---- | ----------- |
| 幅         | 100% | `w-full`    |
| gap        | 9px  | `gap-[9px]` |

---

### タイトル

```tsx
className =
  "w-full text-center text-black text-[14px] font-bold font-['Rounded_Mplus_1c_Bold'] underline leading-[1.28]";
```

| プロパティ | 値                 | Tailwind                         |
| ---------- | ------------------ | -------------------------------- |
| 幅         | 100%               | `w-full`                         |
| 配置       | 中央               | `text-center`                    |
| 色         | #000000            | `text-black`                     |
| サイズ     | 14px               | `text-[14px]`                    |
| Weight     | Bold               | `font-bold`                      |
| フォント   | Rounded M+ 1c Bold | `font-['Rounded_Mplus_1c_Bold']` |
| 装飾       | 下線               | `underline`                      |
| 行高       | 1.28               | `leading-[1.28]`                 |

---

### プログレスバーエリア

```tsx
className = "w-full px-[32px] flex items-center gap-[9px]";
```

| プロパティ   | 値   | Tailwind                  |
| ------------ | ---- | ------------------------- |
| 幅           | 100% | `w-full`                  |
| padding 左右 | 32px | `px-[32px]` または `px-8` |
| gap          | 9px  | `gap-[9px]`               |

---

### プログレスバー本体

```tsx
// 背景
className="flex-1 h-[7px] bg-[#eaeaea] rounded-[1000px] overflow-hidden"

// 進捗
className="h-full bg-black rounded-[40px]"
style={{ width: `${progress}%` }}
```

| 要素 | プロパティ | 値                  | Tailwind                                 |
| ---- | ---------- | ------------------- | ---------------------------------------- |
| 背景 | 高さ       | 7px                 | `h-[7px]`                                |
| 背景 | 色         | #EAEAEA             | `bg-[#eaeaea]`                           |
| 背景 | 角丸       | 1000px（pill 形状） | `rounded-[1000px]` または `rounded-full` |
| 進捗 | 色         | #000000             | `bg-black`                               |
| 進捗 | 角丸       | 40px                | `rounded-[40px]`                         |

---

### パーセント表示

```tsx
// コンテナ
className =
  "flex items-end text-black font-bold font-['Rounded_Mplus_1c_Bold']";

// 数字
className = "text-[24px] tracking-[-0.48px] leading-none";

// %記号
className = "text-[10px] leading-none";
```

| 要素  | プロパティ | 値      | Tailwind                        |
| ----- | ---------- | ------- | ------------------------------- |
| 数字  | サイズ     | 24px    | `text-[24px]` または `text-2xl` |
| 数字  | tracking   | -0.48px | `tracking-[-0.48px]`            |
| 数字  | 行高       | なし    | `leading-none`                  |
| %記号 | サイズ     | 10px    | `text-[10px]`                   |
| %記号 | 行高       | なし    | `leading-none`                  |

---

## 実装コード

```tsx
interface LessonDetailCardProps {
  iconUrl: string;
  title: string;
  progress: number;
  href?: string;
}

export function LessonDetailCard({
  iconUrl,
  title,
  progress,
  href,
}: LessonDetailCardProps) {
  const content = (
    <div className="w-[304px] bg-white border border-[rgba(0,0,0,0.08)] rounded-[20px] overflow-hidden pt-6 pb-5 px-5 flex flex-col items-start">
      <div className="w-full h-[140px] flex flex-col items-center justify-center gap-4">
        {/* アイコン */}
        <img
          src={iconUrl}
          alt={title}
          className="aspect-[276/417] flex-1 rounded-tr-[4px] rounded-br-[4px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.19)] object-cover"
        />

        {/* 情報エリア */}
        <div className="w-full flex flex-col items-center gap-[9px]">
          {/* タイトル */}
          <p className="w-full text-center text-black text-[14px] font-bold font-['Rounded_Mplus_1c_Bold'] underline leading-[1.28]">
            {title}
          </p>

          {/* プログレスバー */}
          <div className="w-full px-8 flex items-center gap-[9px]">
            {/* バー */}
            <div className="flex-1 h-[7px] bg-[#eaeaea] rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-[40px]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* パーセント */}
            <div className="flex items-end text-black font-bold font-['Rounded_Mplus_1c_Bold']">
              <span className="text-2xl tracking-[-0.48px] leading-none">
                {progress}
              </span>
              <span className="text-[10px] leading-none">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return href ? <a href={href}>{content}</a> : content;
}
```

---

## 使用例

```tsx
<LessonDetailCard
  iconUrl="/images/lessons/3structure.png"
  title="「3構造」ではじめるUIデザイン入門"
  progress={25}
  href="/lessons/3structure"
/>
```

---

## デザイントークン

### カラー

| 用途               | HEX              | Tailwind                    |
| ------------------ | ---------------- | --------------------------- |
| カード背景         | #FFFFFF          | `bg-white`                  |
| カード border      | rgba(0,0,0,0.08) | `border-[rgba(0,0,0,0.08)]` |
| タイトル           | #000000          | `text-black`                |
| プログレスバー背景 | #EAEAEA          | `bg-[#eaeaea]`              |
| プログレスバー進捗 | #000000          | `bg-black`                  |

### タイポグラフィ

| 要素           | フォント           | サイズ | Weight |
| -------------- | ------------------ | ------ | ------ |
| タイトル       | Rounded M+ 1c Bold | 14px   | Bold   |
| パーセント数字 | Rounded M+ 1c Bold | 24px   | Bold   |
| パーセント記号 | Rounded M+ 1c Bold | 10px   | Bold   |

### スペーシング

| 要素                       | 値                              |
| -------------------------- | ------------------------------- |
| カード幅                   | 304px ※固定というかレスポンシブ |
| カード padding             | 24px / 20px / 20px              |
| コンテンツ高さ             | 140px                           |
| コンテンツ gap             | 16px                            |
| 情報エリア gap             | 9px                             |
| プログレスバー左右 padding | 32px                            |
| プログレスバー高さ         | 7px                             |

### 角丸

| 要素               | 値            |
| ------------------ | ------------- |
| カード             | 20px          |
| アイコン右側       | 4px           |
| プログレスバー背景 | 1000px (pill) |
| プログレスバー進捗 | 40px          |

### シャドウ

| 要素     | 値                           |
| -------- | ---------------------------- | ---- |
| アイコン | 0px 1px 4px rgba(0,0,0,0.19) | ```` |

### 構成要素

- サムネイル画像
- レッスンタイトル
- 進捗バー（%表示）

### 現在の実装

- ファイル: `src/components/article/sidebar/LessonSection.tsx`

## 4. クエストタイトル（QuestTitle）

### Figma CSS

これはブロックの中に表示されますよね？記事リストと一緒に
なのでクエストブロックのセクションに記載しました。

```css
/* ここにFigmaからコピーしたCSSを貼り付け */
```

### 構成要素

- 番号（1, 2, 3...）
- クエストタイトルテキスト

### 現在の実装

- ファイル: `src/components/article/sidebar/QuestTitle.tsx`

---

## 5. クエストブロック（QuestBlock）

これはなんですか？どこの話？

### Figma CSS

#### どこの指定かわからないので、とりあえず１クエスト単体のサイドの内容を貼ります。

```css
# QuestItem コンポーネント仕様書

## 概要

クエスト（学習単元）を表示するカードコンポーネント。見出しと記事一覧で構成。

---

## 構造

```

QuestItem (w-72)
├── HeadingQuest（見出し部分）
│ ├── QuestNumber（番号バッジ）
│ └── QuestTitle（タイトル）
└── ArticleList（記事一覧）
└── ArticleListItem × n
├── CheckIcon（完了状態）
├── Tag（記事タイプ）
└── Title（記事タイトル）

````

---

## 1. QuestItem（親コンテナ）

### スタイル

```tsx
className="w-72 bg-white rounded-[20px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-black/5 inline-flex flex-col items-center overflow-hidden"
````

| プロパティ | 値                           | Tailwind                                    |
| ---------- | ---------------------------- | ------------------------------------------- |
| 幅         | 288px                        | `w-72`                                      |
| 背景       | #FFFFFF                      | `bg-white`                                  |
| 角丸       | 20px                         | `rounded-[20px]`                            |
| shadow     | 0px 0px 4px rgba(0,0,0,0.08) | `shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)]` |
| border     | 1px solid rgba(0,0,0,0.05)   | `outline outline-1 outline-black/5`         |
| overflow   | hidden                       | `overflow-hidden`                           |

### Props

```tsx
interface QuestItemProps {
  questNumber: number;
  questTitle: string;
  articles: ArticleItem[];
  activeArticleId?: string;
}

interface ArticleItem {
  id: string;
  title: string;
  tag: TagType;
  isCompleted: boolean;
  href: string;
}
```

### 実装

```tsx
export function QuestItem({
  questNumber,
  questTitle,
  articles,
  activeArticleId,
}: QuestItemProps) {
  return (
    <div className="w-72 bg-white rounded-[20px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-black/5 flex flex-col items-center overflow-hidden">
      <HeadingQuest number={questNumber} title={questTitle} />
      <ArticleList articles={articles} activeArticleId={activeArticleId} />
    </div>
  );
}
```

---

## 2. HeadingQuest

### スタイル

```tsx
className =
  "w-72 p-3.5 border-b border-black/5 inline-flex justify-start items-center gap-2";
```

| プロパティ    | 値                         | Tailwind                  |
| ------------- | -------------------------- | ------------------------- |
| 幅            | 288px                      | `w-72`                    |
| padding       | 14px                       | `p-3.5`                   |
| border-bottom | 1px solid rgba(0,0,0,0.05) | `border-b border-black/5` |
| gap           | 8px                        | `gap-2`                   |

### Props

```tsx
interface HeadingQuestProps {
  number: number;
  title: string;
}
```

### 実装

```tsx
export function HeadingQuest({ number, title }: HeadingQuestProps) {
  return (
    <div className="w-72 p-3.5 border-b border-black/5 inline-flex items-center gap-2">
      <QuestNumber number={number} />
      <span className="w-60 text-gray-900 text-xs font-normal font-['Hiragino_Maru_Gothic_Pro'] leading-3">
        {title}
      </span>
    </div>
  );
}
```

---

## 3. QuestNumber（番号バッジ）

### スタイル

```tsx
className =
  "w-5 h-5 px-1.5 py-1 bg-white rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-zinc-100 flex justify-center items-center";
```

| プロパティ | 値                           | Tailwind                                    |
| ---------- | ---------------------------- | ------------------------------------------- |
| サイズ     | 20x20px                      | `w-5 h-5`                                   |
| padding    | 6px / 4px                    | `px-1.5 py-1`                               |
| 背景       | #FFFFFF                      | `bg-white`                                  |
| 角丸       | 5px                          | `rounded-[5px]`                             |
| shadow     | 0px 1px 2px rgba(0,0,0,0.08) | `shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)]` |
| border     | 1px solid #EFEFEF            | `outline outline-1 outline-zinc-100`        |

### テキストスタイル

```tsx
className =
  "text-neutral-500 text-xs font-normal font-['Dela_Gothic_One'] leading-3 [text-shadow:_0px_1px_1px_rgb(0_0_0_/_0.10)]";
```

| プロパティ  | 値                          | Tailwind                                       |
| ----------- | --------------------------- | ---------------------------------------------- |
| フォント    | Dela Gothic One             | `font-['Dela_Gothic_One']`                     |
| サイズ      | 12px                        | `text-xs`                                      |
| 色          | #747474                     | `text-neutral-500`                             |
| text-shadow | 0px 1px 1px rgba(0,0,0,0.1) | `[text-shadow:_0px_1px_1px_rgb(0_0_0_/_0.10)]` |

### 実装

```tsx
export function QuestNumber({ number }: { number: number }) {
  return (
    <div className="w-5 h-5 px-1.5 py-1 bg-white rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-zinc-100 flex justify-center items-center">
      <span className="text-neutral-500 text-xs font-normal font-['Dela_Gothic_One'] leading-3 [text-shadow:_0px_1px_1px_rgb(0_0_0_/_0.10)]">
        {number}
      </span>
    </div>
  );
}
```

---

## 4. ArticleList

### スタイル

```tsx
className = "self-stretch py-1 border-t flex flex-col items-start";
```

| プロパティ   | 値   | Tailwind   |
| ------------ | ---- | ---------- |
| padding 上下 | 4px  | `py-1`     |
| border-top   | あり | `border-t` |

### 実装

```tsx
export function ArticleList({
  articles,
  activeArticleId,
}: {
  articles: ArticleItem[];
  activeArticleId?: string;
}) {
  return (
    <div className="self-stretch py-1 border-t flex flex-col items-start">
      {articles.map((article) => (
        <ArticleListItem
          key={article.id}
          title={article.title}
          tag={article.tag}
          isCompleted={article.isCompleted}
          isActive={article.id === activeArticleId}
          href={article.href}
        />
      ))}
    </div>
  );
}
```

---

## 5. ArticleListItem

### Props

```tsx
interface ArticleListItemProps {
  title: string;
  tag: TagType;
  isCompleted: boolean;
  isActive?: boolean;
  href: string;
}
```

### 状態別スタイル

| 状態    | 背景           | 左 border                    | テキスト色       | Weight |
| ------- | -------------- | ---------------------------- | ---------------- | ------ |
| Default | なし           | なし                         | text-gray-600    | normal |
| Hover   | bg-slate-400/5 | なし                         | text-gray-600    | normal |
| Active  | bg-slate-400/5 | border-l-2 border-indigo-500 | text-neutral-900 | bold   |

### Default スタイル

```tsx
className = "w-72 px-4 py-0.5 flex flex-col items-start gap-2.5";
```

### Hover スタイル

```tsx
className = "w-72 px-4 py-0.5 bg-slate-400/5 flex flex-col items-start gap-2.5";
```

### Active スタイル

```tsx
className =
  "w-72 px-4 py-0.5 bg-slate-400/5 border-l-2 border-indigo-500 flex flex-col items-start gap-2.5";
```

### 内部構造

```tsx
// 内部ラッパー
className =
  "self-stretch py-2 rounded-md inline-flex justify-between items-center";

// コンテンツ部分（CheckIcon右側）
className = "flex-1 pl-2 border-l flex items-center gap-0.5";
```

### タイトルスタイル

**1 行のみ表示、超過分は省略（...）**

```tsx
// Default / Hover
className =
  "self-stretch h-5 text-gray-600 text-xs font-normal font-['Noto_Sans_JP'] leading-5 truncate";

// Active
className =
  "self-stretch h-5 text-neutral-900 text-xs font-bold font-['Noto_Sans_JP'] leading-5 truncate";
```

### 実装

```tsx
export function ArticleListItem({
  title,
  tag,
  isCompleted,
  isActive = false,
  href,
}: ArticleListItemProps) {
  const containerClasses = isActive
    ? "w-72 px-4 py-0.5 bg-slate-400/5 border-l-2 border-indigo-500 flex flex-col items-start gap-2.5"
    : "w-72 px-4 py-0.5 flex flex-col items-start gap-2.5 hover:bg-slate-400/5";

  const titleClasses = isActive
    ? "flex-1 h-5 text-neutral-900 text-xs font-bold font-['Noto_Sans_JP'] leading-5 truncate"
    : "flex-1 h-5 text-gray-600 text-xs font-normal font-['Noto_Sans_JP'] leading-5 truncate";

  return (
    <a href={href} className={containerClasses}>
      <div className="self-stretch py-2 rounded-md inline-flex justify-between items-center">
        <CheckIcon isCompleted={isCompleted} />
        <div className="flex-1 pl-2 border-l flex items-center gap-0.5">
          <Tag type={tag} />
          <span className={titleClasses}>{title}</span>
        </div>
      </div>
    </a>
  );
}
```

---

## 6. CheckIcon

### 状態

| 状態    | 説明                   |
| ------- | ---------------------- |
| default | 未完了                 |
| done    | 完了（グラデーション） |

### Default（未完了）

```tsx
className =
  "w-4 h-4 rounded-full outline outline-1 outline-offset-[-1px] outline-black/5 backdrop-blur-[2px] flex justify-center items-center";
```

内部チェックマーク:

```tsx
className = "w-1.5 h-1 outline outline-[0.83px] outline-neutral-300";
// 色: #D4D4D4
```

### Done（完了）

```tsx
className =
  "w-4 h-4 rounded-full bg-gradient-to-br from-[#ECBFFF] to-[#81D4FA] flex justify-center items-center";
```

内部チェックマーク:

```tsx
className = "w-1.5 h-1 outline outline-[0.83px] outline-white";
// 色: #FFFFFF
```

### 実装

```tsx
export function CheckIcon({ isCompleted }: { isCompleted: boolean }) {
  if (isCompleted) {
    return (
      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#ECBFFF] to-[#81D4FA] flex justify-center items-center">
        <CheckMark className="w-2.5 h-2.5 text-white" />
      </div>
    );
  }

  return (
    <div className="w-4 h-4 rounded-full outline outline-1 outline-offset-[-1px] outline-black/5 backdrop-blur-[2px] flex justify-center items-center">
      <CheckMark className="w-2.5 h-2.5 text-neutral-300" />
    </div>
  );
}
```

---

## 7. Tag（記事タイプ）

### タイプ

```tsx
type TagType = "explain" | "intro" | "practice" | "challenge";

const tagLabels: Record<TagType, string> = {
  explain: "解説",
  intro: "イントロ",
  practice: "実践",
  challenge: "チャレンジ",
};
```

### 共通スタイル（色は後で種類別に設定予定）

```tsx
className =
  "px-1 py-0.5 bg-zinc-100 rounded-md flex justify-center items-center";

// テキスト
className =
  "text-slate-500 text-[10px] font-medium font-['Noto_Sans_JP'] leading-[10px]";
```

| プロパティ     | 値            | Tailwind                |
| -------------- | ------------- | ----------------------- |
| padding        | 4px / 2px     | `px-1 py-0.5`           |
| 背景           | #F4F4F5（仮） | `bg-zinc-100`           |
| 角丸           | 6px           | `rounded-md`            |
| テキストサイズ | 10px          | `text-[10px]`           |
| テキスト色     | #64748B（仮） | `text-slate-500`        |
| フォント       | Noto Sans JP  | `font-['Noto_Sans_JP']` |
| Weight         | Medium        | `font-medium`           |

### 実装（拡張可能な設計）

```tsx
// 将来的に色を追加する想定
const tagStyles: Record<TagType, { bg: string; text: string }> = {
  explain: { bg: "bg-zinc-100", text: "text-slate-500" },
  intro: { bg: "bg-zinc-100", text: "text-slate-500" }, // 未定
  practice: { bg: "bg-zinc-100", text: "text-slate-500" }, // 未定
  challenge: { bg: "bg-zinc-100", text: "text-slate-500" }, // 未定
};

export function Tag({ type }: { type: TagType }) {
  const style = tagStyles[type];

  return (
    <div
      className={`px-1 py-0.5 rounded-md flex justify-center items-center ${style.bg}`}
    >
      <span
        className={`text-[10px] font-medium font-['Noto_Sans_JP'] leading-[10px] ${style.text}`}
      >
        {tagLabels[type]}
      </span>
    </div>
  );
}
```

---

## 8. デザイントークン追加

### グラデーションパターン

```ts
// tokens.ts に追加
export const gradients = {
  // サービスのグラデーションパターン1（CheckIcon完了状態で使用）
  primary: "linear-gradient(135deg, #ECBFFF 0%, #81D4FA 100%)",
};

// Tailwind使用時
// bg-gradient-to-br from-[#ECBFFF] to-[#81D4FA]
```

### 新規カラー

| 用途                 | HEX     | Tailwind            |
| -------------------- | ------- | ------------------- |
| グラデーション開始   | #ECBFFF | `from-[#ECBFFF]`    |
| グラデーション終了   | #81D4FA | `to-[#81D4FA]`      |
| Active 左 border     | #6366F1 | `border-indigo-500` |
| QuestNumber 色       | #747474 | `text-neutral-500`  |
| QuestNumber ボーダー | #EFEFEF | `outline-zinc-100`  |

### 新規フォント

| フォント                 | 用途        |
| ------------------------ | ----------- |
| Dela Gothic One          | QuestNumber |
| Hiragino Maru Gothic Pro | QuestTitle  |

---

## 使用例

```tsx
const questData = {
  questNumber: 1,
  questTitle: "UIデザインの基本：3構造",
  articles: [
    {
      id: "1",
      title: "実践理解!3構造でYouTubeをUIトレース",
      tag: "explain" as TagType,
      isCompleted: true,
      href: "/articles/1",
    },
    {
      id: "2",
      title: "【初心者】UIデザインはこの3つで決まる！『3構造』を徹底解説",
      tag: "explain" as TagType,
      isCompleted: false,
      href: "/articles/2",
    },
    // ...
  ],
};

<QuestItem
  questNumber={questData.questNumber}
  questTitle={questData.questTitle}
  articles={questData.articles}
  activeArticleId="2"
/>;
```

```

### 現在の実装
- ファイル: `src/components/article/sidebar/QuestBlock.tsx`

---

## 6. 記事アイテム（ContentItem）

### Figma CSS
#### 以下詳細な情報です
```

# ArticleListItem コンポーネント仕様書

## 概要

クエスト内の記事アイテム。完了状態、記事タイプ、タイトルを表示。
3 つの状態（Default / Hover / Active）を持つ。

---

## 構造

```
ArticleListItem
├── CheckIcon（完了状態アイコン）
├── border-l（区切り線）
└── Content
    ├── Tag（記事タイプ）
    └── Title（記事タイトル）※1行省略
```

---

## Props

```tsx
interface ArticleListItemProps {
  title: string;
  tag: TagType;
  isCompleted: boolean;
  isActive?: boolean;
  href: string;
}

type TagType = "explain" | "intro" | "practice" | "challenge";
```

---

## 状態別スタイル

### 1. コンテナ

| 状態        | 背景              | 左 border                      | Tailwind                                                                                                              |
| ----------- | ----------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Default** | なし              | なし                           | `w-72 px-4 py-0.5 inline-flex flex-col justify-start items-start gap-2.5`                                             |
| **Hover**   | `bg-slate-400/20` | なし                           | `w-72 px-4 py-0.5 bg-slate-400/20 inline-flex flex-col justify-start items-start gap-2.5`                             |
| **Active**  | `bg-slate-400/5`  | `border-l-2 border-indigo-500` | `w-72 px-4 py-0.5 bg-slate-400/5 border-l-2 border-indigo-500 inline-flex flex-col justify-start items-start gap-2.5` |

### 2. タイトル

| 状態        | 色                           | Weight   | Tailwind                             |
| ----------- | ---------------------------- | -------- | ------------------------------------ |
| **Default** | `text-gray-600` (#4B5563)    | normal   | `text-gray-600 text-xs font-normal`  |
| **Hover**   | `text-gray-600` (#4B5563)    | **bold** | `text-gray-600 text-xs font-bold`    |
| **Active**  | `text-neutral-900` (#171717) | bold     | `text-neutral-900 text-xs font-bold` |

---

## 完全な CSS（Figma からコピー）

### Default

```tsx
// コンテナ
className =
  "w-72 px-4 py-0.5 inline-flex flex-col justify-start items-start gap-2.5";

// 内部ラッパー
className =
  "self-stretch py-2 rounded-md inline-flex justify-between items-center";

// コンテンツエリア
className = "flex-1 pl-2 border-l flex justify-start items-center gap-0.5";

// タイトル
className =
  "self-stretch h-5 text-justify justify-start text-gray-600 text-xs font-normal font-['Noto_Sans_JP'] leading-5";
```

### Active

```tsx
// コンテナ
className =
  "w-72 px-4 py-0.5 bg-slate-400/5 border-l-2 border-indigo-500 inline-flex flex-col justify-start items-start gap-2.5";

// タイトル
className =
  "self-stretch h-5 text-justify justify-start text-neutral-900 text-xs font-bold font-['Noto_Sans_JP'] leading-5";
```

### Hover

```tsx
// コンテナ
className =
  "w-72 px-4 py-0.5 bg-slate-400/20 inline-flex flex-col justify-start items-start gap-2.5";

// タイトル
className =
  "self-stretch h-5 text-justify justify-start text-gray-600 text-xs font-bold font-['Noto_Sans_JP'] leading-5";
```

---

## スタイル定義オブジェクト

```tsx
// styles.ts
export const articleListItemStyles = {
  // コンテナ
  container: {
    base: "w-72 px-4 py-0.5 inline-flex flex-col justify-start items-start gap-2.5",
    default: "",
    hover: "bg-slate-400/20",
    active: "bg-slate-400/5 border-l-2 border-indigo-500",
  },

  // 内部ラッパー
  inner:
    "self-stretch py-2 rounded-md inline-flex justify-between items-center",

  // コンテンツエリア（CheckIcon右側）
  content: "flex-1 pl-2 border-l flex justify-start items-center gap-0.5",

  // タイトル
  title: {
    base: "self-stretch h-5 text-justify text-xs font-['Noto_Sans_JP'] leading-5 truncate",
    default: "text-gray-600 font-normal",
    hover: "text-gray-600 font-bold",
    active: "text-neutral-900 font-bold",
  },
};
```

---

## 実装コード

```tsx
import clsx from "clsx";

interface ArticleListItemProps {
  title: string;
  tag: TagType;
  isCompleted: boolean;
  isActive?: boolean;
  href: string;
}

export function ArticleListItem({
  title,
  tag,
  isCompleted,
  isActive = false,
  href,
}: ArticleListItemProps) {
  // コンテナクラス
  const containerClasses = clsx(
    // 共通ベース
    "group w-72 px-4 py-0.5 inline-flex flex-col justify-start items-start gap-2.5",
    {
      // Active状態
      "bg-slate-400/5 border-l-2 border-indigo-500": isActive,
      // Default → Hover
      "hover:bg-slate-400/20": !isActive,
    }
  );

  // タイトルクラス
  const titleClasses = clsx(
    // 共通ベース
    "self-stretch h-5 text-justify text-xs font-['Noto_Sans_JP'] leading-5 truncate",
    {
      // Active状態
      "text-neutral-900 font-bold": isActive,
      // Default → Hover で font-bold に変化
      "text-gray-600 font-normal group-hover:font-bold": !isActive,
    }
  );

  return (
    <a href={href} className={containerClasses}>
      <div className="self-stretch py-2 rounded-md inline-flex justify-between items-center">
        {/* 完了状態アイコン */}
        <CheckIcon isCompleted={isCompleted} />

        {/* コンテンツエリア */}
        <div className="flex-1 pl-2 border-l flex justify-start items-center gap-0.5">
          {/* 記事タイプタグ */}
          <Tag type={tag} />

          {/* タイトル（1行省略） */}
          <span className={titleClasses}>{title}</span>
        </div>
      </div>
    </a>
  );
}
```

---

## CheckIcon（完了状態アイコン）

### 2 つの状態

| 状態    | 説明   | 見た目                           |
| ------- | ------ | -------------------------------- |
| default | 未完了 | グレーのチェック、透明背景       |
| done    | 完了   | 白のチェック、グラデーション背景 |

### Default（未完了）

```tsx
className =
  "w-4 h-4 rounded-full outline outline-1 outline-offset-[-1px] outline-black/5 backdrop-blur-[2px] flex justify-center items-center";

// 内部チェックマーク
className =
  "w-1.5 h-1 outline outline-[0.83px] outline-offset-[-0.42px] outline-neutral-300";
```

### Done（完了）

```tsx
className =
  "w-4 h-4 rounded-full bg-gradient-to-br from-[#ECBFFF] to-[#81D4FA] flex justify-center items-center";

// 内部チェックマーク
className =
  "w-1.5 h-1 outline outline-[0.83px] outline-offset-[-0.42px] outline-white";
```

### CheckIcon 実装

```tsx
export function CheckIcon({ isCompleted }: { isCompleted: boolean }) {
  if (isCompleted) {
    // Done（完了）
    return (
      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#ECBFFF] to-[#81D4FA] flex justify-center items-center">
        <div className="flex justify-center items-center gap-2.5">
          <div className="w-2.5 h-2.5 relative overflow-hidden">
            <div className="w-1.5 h-1 left-[2.50px] top-[3.23px] absolute outline outline-[0.83px] outline-offset-[-0.42px] outline-white" />
          </div>
        </div>
      </div>
    );
  }

  // Default（未完了）
  return (
    <div className="w-4 h-4 rounded-full outline outline-1 outline-offset-[-1px] outline-black/5 backdrop-blur-[2px] flex justify-center items-center">
      <div className="flex justify-center items-center gap-2.5">
        <div className="w-2.5 h-2.5 relative overflow-hidden">
          <div className="w-1.5 h-1 left-[2.50px] top-[3.23px] absolute outline outline-[0.83px] outline-offset-[-0.42px] outline-neutral-300" />
        </div>
      </div>
    </div>
  );
}
```

---

## Tag（記事タイプ）

### 4 つのタイプ

| タイプ    | ラベル     | 背景色        | テキスト色       |
| --------- | ---------- | ------------- | ---------------- |
| explain   | 解説       | `bg-zinc-100` | `text-slate-500` |
| intro     | イントロ   | （未定）      | （未定）         |
| practice  | 実践       | （未定）      | （未定）         |
| challenge | チャレンジ | （未定）      | （未定）         |

※ 4 種類のスタイルは後で個別に設定予定

### 共通スタイル

```tsx
// コンテナ
className =
  "px-1 py-0.5 bg-zinc-100 rounded-md flex justify-center items-center gap-2.5";

// テキスト
className =
  "text-justify justify-center text-slate-500 text-[10px] font-medium font-['Noto_Sans_JP'] leading-[10px]";
```

### Tag 実装（拡張可能な設計）

```tsx
type TagType = "explain" | "intro" | "practice" | "challenge";

const tagLabels: Record<TagType, string> = {
  explain: "解説",
  intro: "イントロ",
  practice: "実践",
  challenge: "チャレンジ",
};

// 将来的に色を追加する想定
const tagStyles: Record<TagType, { bg: string; text: string }> = {
  explain: { bg: "bg-zinc-100", text: "text-slate-500" },
  intro: { bg: "bg-zinc-100", text: "text-slate-500" }, // 未定
  practice: { bg: "bg-zinc-100", text: "text-slate-500" }, // 未定
  challenge: { bg: "bg-zinc-100", text: "text-slate-500" }, // 未定
};

export function Tag({ type }: { type: TagType }) {
  const style = tagStyles[type];

  return (
    <div
      className={`px-1 py-0.5 rounded-md flex justify-center items-center gap-2.5 ${style.bg}`}
    >
      <span
        className={`text-justify text-[10px] font-medium font-['Noto_Sans_JP'] leading-[10px] ${style.text}`}
      >
        {tagLabels[type]}
      </span>
    </div>
  );
}
```

---

## デザイントークン

### カラー

| 用途             | HEX                    | Tailwind              |
| ---------------- | ---------------------- | --------------------- |
| タイトル Default | #4B5563                | `text-gray-600`       |
| タイトル Active  | #171717                | `text-neutral-900`    |
| 背景 Hover       | rgba(148,163,184,0.2)  | `bg-slate-400/20`     |
| 背景 Active      | rgba(148,163,184,0.05) | `bg-slate-400/5`      |
| 左 border Active | #6366F1                | `border-indigo-500`   |
| CheckIcon 未完了 | #D4D4D4                | `outline-neutral-300` |
| Tag 背景         | #F4F4F5                | `bg-zinc-100`         |
| Tag テキスト     | #64748B                | `text-slate-500`      |

### グラデーション（CheckIcon 完了時）

```tsx
// サービスのグラデーションパターン1
className = "bg-gradient-to-br from-[#ECBFFF] to-[#81D4FA]";
// CSS: linear-gradient(135deg, #ECBFFF 0%, #81D4FA 100%)
```

### フォント

| フォント     | 用途          |
| ------------ | ------------- |
| Noto Sans JP | タイトル、Tag |

---

## 使用例

```tsx
// Default状態（未完了）
<ArticleListItem
  title="実践理解!3構造でYouTubeをUIトレース"
  tag="explain"
  isCompleted={false}
  isActive={false}
  href="/articles/1"
/>

// Active状態（現在閲覧中）
<ArticleListItem
  title="実践理解!3構造でYouTubeをUIトレース"
  tag="explain"
  isCompleted={false}
  isActive={true}
  href="/articles/2"
/>

// 完了状態
<ArticleListItem
  title="実践理解!3構造でYouTubeをUIトレース"
  tag="explain"
  isCompleted={true}
  isActive={false}
  href="/articles/3"
/>
```

---

## 注意事項

1. **タイトル省略**: 1 行のみ表示、超過分は `truncate` で省略（...）
2. **Hover 時の font-bold**: Tailwind では `group` + `group-hover:font-bold` を使用
3. **Tag 色**: 4 種類のスタイルは後で個別に設定予定、現在は共通スタイル
4. **CheckIcon のチェックマーク**: SVG アイコンに置き換え推奨（現在は CSS で描画）

````

### 構成要素
- 完了チェックアイコン（丸 or チェック）
- ラベル（「解説」など）
- 記事タイトル

### 状態
- 未完了
- 完了済み
- 現在閲覧中（アクティブ）
- hover

### 現在の実装
- ファイル: `src/components/article/sidebar/ContentItem.tsx`

---

## 7. 戻るナビゲーション（BackNavigation）

### Figma CSS

#### 以下詳細な内容
```css
/* ここにFigmaからコピーしたCSSを貼り付け */

````

### 現在の実装

- ファイル: `src/components/article/sidebar/BackNavigation.tsx`

---

## 実装メモ

### 変更が必要な点

<!-- 仕様確認後に記入 -->

### カラートークン

| 用途 | Figma 値 | Tailwind クラス |
| ---- | -------- | --------------- |
|      |          |                 |

### タイポグラフィ

| 要素 | Font | Size | Weight |
| ---- | ---- | ---- | ------ |
|      |      |      |        |
