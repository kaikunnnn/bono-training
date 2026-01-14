# マイページ リファクタリング - 実装ステップ

## 概要

MyPage.tsx 内の UI パターンを整理する。

---

## Step 1: IconButton（ボタンコンポーネント）

### 目的

マイページヘッダーの「プロフィール」ボタンをボタンコンポーネントとして整理
※「アカウント情報」ボタンは削除し、グローバルナビゲーションの「設定」へ誘導

### 配置先

`src/components/ui/button/IconButton.tsx`

### 現在の実装箇所

`src/pages/MyPage.tsx` Lines 317-377

### デザイン仕様

#### コンテナ

| プロパティ    | 値                           | Tailwind                                    |
| ------------- | ---------------------------- | ------------------------------------------- |
| 背景色        | #FFFFFF                      | `bg-white`                                  |
| padding       | 10px / 5px                   | `px-[10px] py-[5px]`                        |
| border-radius | 12px                         | `rounded-[12px]`                            |
| shadow        | 0px 1px 1px rgba(0,0,0,0.04) | `shadow-[0px_1px_1px_0px_rgba(0,0,0,0.04)]` |
| gap           | 4px                          | `gap-[4px]`                                 |

#### アイコン部分

| プロパティ | 値      |
| ---------- | ------- |
| サイズ     | 20x20px |
| 背景色     | #E5E5E5 |
| padding    | 3px     |

#### テキスト

| プロパティ | 値                            | Tailwind         |
| ---------- | ----------------------------- | ---------------- |
| フォント   | Inter Bold, Noto Sans JP Bold | `font-bold`      |
| サイズ     | 13px                          | `text-[13px]`    |
| 色         | #020817                       | `text-[#020817]` |
| 行高       | 24px                          | `leading-[24px]` |

### 実装内容

1. `src/components/ui/button/IconButton.tsx` を作成
2. MyPage.tsx から「アカウント情報」ボタンを削除
3. 「プロフィール」ボタンを IconButton に置き換え

### 完了条件

- [x] IconButton コンポーネント作成
- [x] MyPage.tsx から「アカウント情報」ボタン削除
- [x] MyPage.tsx で IconButton 使用
- [x] /dev/components に Button カテゴリとして登録

---

## Step 2: EmptyState（空状態パターン）

### 目的

「進行中がない」「お気に入りがない」「閲覧履歴がない」の表示パターンを整理

### 配置先

<!-- 方針決定後に記載 -->

### 現在の実装箇所

- `src/pages/MyPage.tsx` Lines 462-514（進行中）
- `src/pages/MyPage.tsx` Lines 692-717（お気に入り）
- `src/pages/MyPage.tsx` Lines 743-768（閲覧履歴）

### デザイン仕様

<!-- ここにFigmaリンクやスクリーンショットを追加 -->

今実装されている空のパターンで大丈夫です。一旦後で変更するかもしれないのでちゃんとフラッシュデブのページにまとめてそこで変更できるようにしておいてください。進行中お気に入り閲覧履歴で若干表示が違う気がするんですけど、もしそうならばそれごとのものもまとめてもらえると良いかもしれません。それに頼りきるコンポーネントにしたいですともしそうならば

### 実装内容

<!-- 承認後に記載 -->

### 完了条件

- [x] 方針決定
- [x] 実装
- [x] MyPage.tsx で使用
- [x] /dev/components に Pattern カテゴリとして登録

---

## Step 3: LessonCard グループ（進捗カード）

### 目的

レッスンカードの状態変化をグループとして整理

- 進行中（ProgressLesson - 既存）
- 100%達成（ProgressLesson - 既存）
- 完了済み（CompletedLessonCard - 新規）

### 配置先

`src/components/progress/`

### 現在の実装箇所

- 完了カード: `src/pages/MyPage.tsx` Lines 561-611

### デザイン仕様

<!-- ここにFigmaリンクやスクリーンショットを追加 -->

### 実装内容

<!-- 承認後に記載 -->

### 完了条件

- [x] CompletedLessonCard 作成
- [x] /dev/components の Progress カテゴリに登録
- [x] MyPage.tsx で使用
- [x] ProgressLesson も Progress カテゴリに登録

---

## Step 4: SubSectionTitle（サブ見出し）

### 目的

「レッスン」「完了」「取り組み中」などのサブ見出しを Heading ブロックとして整理

### 配置先

`src/components/ui/sub-section-title.tsx`

### 現在の実装箇所

- `src/pages/MyPage.tsx` 内の h3 要素（3 箇所）

### デザイン仕様

<!-- ここにFigmaリンクやスクリーンショットを追加 -->

**成功！✅**

---

## HeadingSectionInner（セクション見出し）仕様

### 概要

セクションの見出し行。左にタイトル、右に「すべてみる」リンク（表示/非表示切替可能）

---

### 構造

```
HeadingSectionInner (w-[896px])
├── left: タイトル（例: レッスン）
└── right: リンク（例: すべてみる）← onoff で表示制御
```

---

### レイアウト

| 要素       | スタイル                                      |
| ---------- | --------------------------------------------- |
| コンテナ   | `w-[896px] flex items-center justify-between` |
| 内部ラップ | `flex-1 flex items-center justify-between`    |

---

### 左側: タイトル

| プロパティ | 値                 | Tailwind                              |
| ---------- | ------------------ | ------------------------------------- |
| フォント   | Rounded M+ 1c Bold | `font-['Rounded_Mplus_1c_Bold:Bold']` |
| サイズ     | 13px               | `text-[13px]`                         |
| 色         | #020817            | `text-[#020817]`                      |
| Weight     | Bold               | (フォント名に含まれる)                |
| 改行       | なし               | `text-nowrap`                         |

---

### 右側: リンク「すべてみる」

| プロパティ | 値                 | Tailwind                              |
| ---------- | ------------------ | ------------------------------------- |
| フォント   | Rounded M+ 1c Bold | `font-['Rounded_Mplus_1c_Bold:Bold']` |
| サイズ     | 12px               | `text-[12px]`                         |
| 色         | rgba(2,8,23,0.64)  | `text-[rgba(2,8,23,0.64)]`            |
| 行高       | 32px               | `leading-[32px]`                      |
| 配置       | center             | `text-center`                         |
| 改行       | なし               | `text-nowrap`                         |

---

### Props

```tsx
interface HeadingSectionInnerProps {
  title: string; // 左側タイトル
  showLink?: boolean; // 「すべてみる」表示（default: true）
  linkText?: string; // リンクテキスト（default: "すべてみる"）
  linkHref?: string; // リンク先URL
  onLinkClick?: () => void;
}
```

---

### 実装コード

```tsx
// HeadingSectionInner.tsx
interface HeadingSectionInnerProps {
  title: string;
  showLink?: boolean;
  linkText?: string;
  linkHref?: string;
  onLinkClick?: () => void;
}

export function HeadingSectionInner({
  title,
  showLink = true,
  linkText = "すべてみる",
  linkHref,
  onLinkClick,
}: HeadingSectionInnerProps) {
  return (
    <div className="w-full flex items-center justify-between">
      {/* 左側: タイトル */}
      <div className="flex items-center">
        <span className="font-['Rounded_Mplus_1c_Bold'] text-[13px] text-[#020817] whitespace-nowrap">
          {title}
        </span>
      </div>

      {/* 右側: リンク */}
      {showLink && (
        <div className="flex items-center">
          {linkHref ? (

              href={linkHref}
              className="font-['Rounded_Mplus_1c_Bold'] text-[12px] text-[rgba(2,8,23,0.64)] leading-[32px] text-center whitespace-nowrap hover:opacity-80"
            >
              {linkText}
            </a>
          ) : (
            <button
              onClick={onLinkClick}
              className="font-['Rounded_Mplus_1c_Bold'] text-[12px] text-[rgba(2,8,23,0.64)] leading-[32px] text-center whitespace-nowrap hover:opacity-80"
            >
              {linkText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### 使用例

```tsx
// 基本
<HeadingSectionInner title="レッスン" />

// リンクあり
<HeadingSectionInner
  title="進行中"
  linkHref="/lessons/all"
/>

// リンクなし
<HeadingSectionInner
  title="お知らせ"
  showLink={false}
/>

// カスタムリンクテキスト
<HeadingSectionInner
  title="お気に入り"
  linkText="もっと見る"
  onLinkClick={() => console.log('clicked')}
/>
```

---

### デザイントークン抽出

```ts
// tokens.ts に追加
export const colors = {
  text: {
    primary: "#020817",
    secondary: "rgba(2,8,23,0.64)",
  },
};

export const fonts = {
  heading: "font-['Rounded_Mplus_1c_Bold']",
};

export const fontSize = {
  sectionTitle: "text-[13px]",
  sectionLink: "text-[12px]",
};
```

---

この仕様で実装に迷いなく進められますか？他に確認したいコンポーネントがあれば共有してください。

### 実装内容

<!-- 承認後に記載 -->

### 完了条件

- [x] コンポーネント作成
- [x] /dev/components の Heading カテゴリに登録
- [x] MyPage.tsx で使用

---

## Step 5: ヘッダー要素の微調整

### 目的

マイページヘッダー（タイトル + タブ + ボタン）の余白・配置を調整

### 対象箇所

`src/pages/MyPage.tsx` のヘッダーセクション（div 862x129）

### デザイン仕様

以下に共有します。今のヘッダー要素との違いをまずは明確にして下さい。その後に実装です。

```## PageHeading コンポーネント - 詳細仕様

### 全体構造

```

PageHeading (w-[864px], レスポンシブ化推奨)
├── 上段 (justify-between)
│ ├── 左: タイトル「マイページ」
│ └── 右: プロフィールボタン
├── gap-6 (24px)
└── 下段: TabGroup

````

---

### 1. コンテナ

```tsx
className="w-full inline-flex flex-col justify-start items-start gap-6"
````

| プロパティ   | 値           | Tailwind   |
| ------------ | ------------ | ---------- |
| 幅           | レスポンシブ | `w-full`   |
| 方向         | 縦並び       | `flex-col` |
| 上下段間 gap | 24px         | `gap-6`    |

---

### 2. 上段（タイトル + プロフィール）

```tsx
className = "self-stretch inline-flex justify-between items-center";
```

#### タイトル

| プロパティ | 値                 | Tailwind                         |
| ---------- | ------------------ | -------------------------------- |
| フォント   | Rounded M+ 1c Bold | `font-['Rounded_Mplus_1c_Bold']` |
| サイズ     | 24px               | `text-2xl`                       |
| 色         | #020817            | `text-slate-950`                 |
| Weight     | Bold               | `font-bold`                      |
| 行高       | 24px               | `leading-6`                      |

#### プロフィールボタン

```tsx
className =
  "px-2.5 py-[5px] bg-white rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] flex justify-start items-center gap-1";
```

| プロパティ       | 値                           | Tailwind                                    |
| ---------------- | ---------------------------- | ------------------------------------------- |
| padding          | 10px / 5px                   | `px-2.5 py-[5px]`                           |
| 背景             | #FFFFFF                      | `bg-white`                                  |
| 角丸             | 12px                         | `rounded-xl`                                |
| shadow           | 0px 1px 1px rgba(0,0,0,0.04) | `shadow-[0px_1px_1px_0px_rgba(0,0,0,0.04)]` |
| border           | 1px solid (色は要確認)       | `outline outline-1 outline-offset-[-1px]`   |
| gap              | 4px                          | `gap-1`                                     |
| アイコンサイズ   | 20x20px                      | `w-5 h-5`                                   |
| テキストフォント | Inter Bold                   | `font-['Inter'] font-bold`                  |
| テキストサイズ   | 12px                         | `text-xs`                                   |
| テキスト色       | #020817                      | `text-slate-950`                            |
| テキスト行高     | 24px                         | `leading-6`                                 |

---

### 3. 下段（TabGroup）

#### TabGroup コンテナ

```tsx
className =
  "p-[3px] bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-black/5 inline-flex justify-start items-center gap-2";
```

| プロパティ | 値                         | Tailwind                                                  |
| ---------- | -------------------------- | --------------------------------------------------------- |
| padding    | 3px                        | `p-[3px]`                                                 |
| 背景       | #F4F4F5                    | `bg-zinc-100`                                             |
| 角丸       | 8px                        | `rounded-lg`                                              |
| border     | 1px solid rgba(0,0,0,0.05) | `outline outline-1 outline-offset-[-1px] outline-black/5` |
| タブ間 gap | 8px                        | `gap-2`                                                   |

#### Tab（Active 状態）

```tsx
className =
  "px-2 py-1.5 bg-white rounded-md shadow-[0px_2px_2px_0px_rgba(0,0,0,0.04)] flex justify-center items-center gap-2.5";
```

| プロパティ | 値                           | Tailwind                                    |
| ---------- | ---------------------------- | ------------------------------------------- |
| padding    | 8px / 6px                    | `px-2 py-1.5`                               |
| 背景       | #FFFFFF                      | `bg-white`                                  |
| 角丸       | 6px                          | `rounded-md`                                |
| shadow     | 0px 2px 2px rgba(0,0,0,0.04) | `shadow-[0px_2px_2px_0px_rgba(0,0,0,0.04)]` |
| テキスト色 | #000000                      | `text-black`                                |
| フォント   | Rounded M+ 1c Bold           | `font-['Rounded_Mplus_1c_Bold']`            |
| サイズ     | 12px                         | `text-xs`                                   |
| Weight     | Bold                         | `font-bold`                                 |
| 行高       | 12px                         | `leading-3`                                 |

#### Tab（Default 状態）

```tsx
className =
  "px-2 py-1.5 rounded-md shadow-[0px_2px_2px_0px_rgba(0,0,0,0.04)] flex justify-center items-center gap-2.5";
```

| プロパティ | 値                           | Tailwind                                    |
| ---------- | ---------------------------- | ------------------------------------------- |
| padding    | 8px / 6px                    | `px-2 py-1.5`                               |
| 背景       | **なし**                     | -                                           |
| 角丸       | 6px                          | `rounded-md`                                |
| shadow     | 0px 2px 2px rgba(0,0,0,0.04) | `shadow-[0px_2px_2px_0px_rgba(0,0,0,0.04)]` |
| テキスト色 | rgba(0,0,0,0.5)              | `text-black/50`                             |

---

### 4. 実装コード

```tsx
// PageHeading.tsx
interface PageHeadingProps {
  title: string;
  tabs: { id: string; label: string }[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onProfileClick?: () => void;
}

export function PageHeading({
  title,
  tabs,
  activeTabId,
  onTabChange,
  onProfileClick,
}: PageHeadingProps) {
  return (
    <div className="w-full flex flex-col items-start gap-6">
      {/* 上段: タイトル + プロフィール */}
      <div className="self-stretch flex justify-between items-center">
        <h1 className="text-slate-950 text-2xl font-bold font-['Rounded_Mplus_1c_Bold'] leading-6">
          {title}
        </h1>
        <ProfileButton onClick={onProfileClick} />
      </div>

      {/* 下段: タブ */}
      <TabGroup
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={onTabChange}
      />
    </div>
  );
}
```

```tsx
// TabGroup.tsx
interface TabGroupProps {
  tabs: { id: string; label: string }[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

export function TabGroup({ tabs, activeTabId, onTabChange }: TabGroupProps) {
  return (
    <div className="p-[3px] bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-black/5 inline-flex items-center gap-2">
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          label={tab.label}
          isActive={tab.id === activeTabId}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </div>
  );
}
```

```tsx
// Tab.tsx
interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function Tab({ label, isActive, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-2 py-1.5 rounded-md shadow-[0px_2px_2px_0px_rgba(0,0,0,0.04)]
        flex justify-center items-center
        text-xs font-bold font-['Rounded_Mplus_1c_Bold'] leading-3
        ${
          isActive ? "bg-white text-black" : "text-black/50 hover:text-black/70"
        }
      `}
    >
      {label}
    </button>
  );
}
```

---

### 5. 使用例

```tsx
const tabs = [
  { id: "all", label: "すべて" },
  { id: "progress", label: "進捗" },
  { id: "favorites", label: "お気に入り" },
  { id: "history", label: "閲覧履歴" },
];

<PageHeading
  title="マイページ"
  tabs={tabs}
  activeTabId="all"
  onTabChange={(id) => setActiveTab(id)}
  onProfileClick={() => router.push("/profile")}
/>;
```

---

````
### 調整内容

1. TabGroupコンポーネント作成 (`src/components/ui/tab-group.tsx`)
   - pill スタイルのタブ（bg-zinc-100, rounded-lg）
   - アクティブタブ: bg-white + shadow
   - 非アクティブタブ: text-black/50

2. MyPage.tsxヘッダー構造変更
   - 左右並び → 縦並び（gap-6）
   - 上段: タイトル(24px) + プロフィールボタン
   - 下段: TabGroup
   - TabNavigationからTabGroupに置き換え

### 完了条件

- [x] 余白調整
- [x] 配置確認

---

## Step 6: セクションの余白・ボーダー調整

### 目的

各セクション（進行中、お気に入り、閲覧履歴）の余白やボーダーを統一・調整

### 対象箇所

`src/pages/MyPage.tsx` の各 section 要素（862x243 など）

### デザイン仕様

以下のようにデスクトップの時のデザインを共有。

### 幅のルール

| プロパティ | 値                | Tailwind         |
| ---------- | ----------------- | ---------------- |
| 幅         | **レスポンシブ**  | `w-full`         |
| max-width  | 896px（親で制御） | 親コンテナで設定 |

---

### 修正後の実装

```tsx
// Section.tsx
export function Section({
  primaryHeading,
  primaryLink,
  secondaryHeading,
  secondaryLink,
  children,
  isLast = false,
}: SectionProps) {
  return (
    <section
      className={`
        w-full py-8 flex flex-col items-start gap-3
        ${isLast ? "" : "border-b border-black/10"}
      `}
    >
      {/* 親見出し */}
      <HeadingSectionInner
        title={primaryHeading}
        linkHref={primaryLink}
        size="primary"
      />

      {/* 子見出し（任意） */}
      {secondaryHeading && (
        <HeadingSectionInner
          title={secondaryHeading}
          linkHref={secondaryLink}
          size="secondary"
        />
      )}

      {/* コンテンツ */}
      {children}
    </section>
  );
}
````

### 親コンテナ側で幅制御

```tsx
// MyPage.tsx
<main className="flex-1">
  <div className="max-w-[896px] mx-auto px-4">
    <Section ... />
    <Section ... />
    <Section isLast ... />
  </div>
</main>
```

---

これで OK ですか？

### 調整内容

1. 各セクションにTailwindクラスを適用:
   - `w-full py-8 flex flex-col items-start gap-3`
   - 最後以外は `border-b border-black/10`

2. 対象セクション:
   - 進行中セクション（ボーダーあり）
   - その他の進捗セクション（ボーダーあり）
   - お気に入りセクション（ボーダーあり）
   - 閲覧履歴セクション（ボーダーなし）

### 完了条件

- [x] セクション間の余白統一
- [x] ボーダー追加/調整（必要な場合）

---

## Step 7: /dev/components 登録

### 登録するコンポーネント

| カテゴリ | コンポーネント         | 状態         |
| -------- | ---------------------- | ------------ |
| Button   | IconButton             | 新規         |
| Progress | ProgressLesson         | 既存・未登録 |
| Progress | ProgressLesson（100%） | 既存・未登録 |
| Progress | CompletedLessonCard    | 新規         |
| Heading  | SectionHeading         | 既存・未登録 |
| Heading  | SubSectionTitle        | 新規         |

---

## 進捗

| Step | 内容                       | 状態    |
| ---- | -------------------------- | ------- |
| 1    | IconButton                 | ✅ 完了 |
| 2    | EmptyState                 | ✅ 完了 |
| 3    | LessonCard グループ        | ✅ 完了 |
| 4    | HeadingSectionInner        | ✅ 完了 |
| 5    | ヘッダー要素の微調整       | ✅ 完了 |
| 6    | セクションの余白・ボーダー | ✅ 完了 |
| 7    | /dev/components 登録       | ✅ 完了 |
