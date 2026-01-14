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

<!-- ここにFigmaリンクやスクリーンショットを追加 -->

### 調整内容

<!-- 承認後に記載 -->

### 完了条件

- [ ] 余白調整
- [ ] 配置確認

---

## Step 6: セクションの余白・ボーダー調整

### 目的

各セクション（進行中、お気に入り、閲覧履歴）の余白やボーダーを統一・調整

### 対象箇所

`src/pages/MyPage.tsx` の各 section 要素（862x243 など）

### デザイン仕様

<!-- ここにFigmaリンクやスクリーンショットを追加 -->

### 調整内容

<!-- 承認後に記載 -->

### 完了条件

- [ ] セクション間の余白統一
- [ ] ボーダー追加/調整（必要な場合）

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
| 5    | ヘッダー要素の微調整       | 未着手  |
| 6    | セクションの余白・ボーダー | 未着手  |
| 7    | /dev/components 登録       | 未着手  |
