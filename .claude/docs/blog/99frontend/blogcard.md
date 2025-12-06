# ブログカード（Item-link）実装仕様書

## 概要

BONO blog のブログ記事一覧で使用されるカードコンポーネントの完全な実装仕様です。
サムネイル、タイトル、カテゴリ、更新日を表示する横並びレイアウトのカードです。

**Figma URL**: https://www.figma.com/design/ee9rQHm0c0QLHpMgCqZpRe/BONO-blog-2025-data?node-id=19-34  
**Node ID**: `19:34`  
**コンポーネント名**: `Item-link`  
**最終更新**: 2025 年 11 月 10 日

---

## デザイン情報

### Figma 情報

- **Figma URL**: https://www.figma.com/design/ee9rQHm0c0QLHpMgCqZpRe/BONO-blog-2025-data?node-id=19-34
- **Node ID**: `19:34`
- **コンポーネント名**: `Item-link`
- **位置**: x=1331, y=426 (Figma 上の配置)

### デザインスペック

- **幅**: 1120px
- **高さ**: 159px (最小高さ: 152px)
- **背景色**: #FFFFFF (White)
- **角丸**: 16px
- **影**: `0px 1px 2px 0px rgba(0,0,0,0.05)`
- **パディング**: 左 12px、右 24px、上下 12px

---

## コンポーネント構造

```
Item-link (19:34) - 1120×159px
└── Container (14:18)
    ├── thumbnail - 16:9 (14:19) - 240×135px
    │   └── emoji Image (14:20) - 64×64px
    └── Container (14:21) - 701.34px
        ├── Heading 4 (14:22)
        │   └── Title Text (14:23)
        └── Container (14:24) - メタ情報
            ├── category (14:25)
            └── updated_date (14:27)
```

---

## 詳細仕様

### 1. カード全体 (19:34)

| プロパティ     | 値                                 |
| -------------- | ---------------------------------- |
| **要素名**     | Item-link                          |
| **サイズ**     | 1120×159px                         |
| **最小高さ**   | 152px                              |
| **背景色**     | #FFFFFF (White)                    |
| **角丸**       | 16px                               |
| **影**         | `0px 1px 2px 0px rgba(0,0,0,0.05)` |
| **パディング** | 左: 12px, 右: 24px, 上下: 12px     |
| **レイアウト** | flex-col                           |

### 2. 内部コンテナ (14:18)

| プロパティ     | 値                |
| -------------- | ----------------- |
| **要素名**     | Container         |
| **幅**         | 100% (full width) |
| **レイアウト** | flex-row          |
| **間隔**       | 32px (gap)        |
| **配置**       | items-center      |

### 3. サムネイル (14:19)

| プロパティ     | 値                    |
| -------------- | --------------------- |
| **要素名**     | thumbanil - 16:9      |
| **サイズ**     | 240×135px             |
| **比率**       | 16:9                  |
| **背景色**     | #D8E7EF (淡いブルー)  |
| **角丸**       | 12px                  |
| **パディング** | 上下: 40px, 左右: 0px |
| **配置**       | center (flex)         |

#### 絵文字画像 (14:20)

| プロパティ   | 値                                                          |
| ------------ | ----------------------------------------------------------- |
| **要素名**   | emoji Image                                                 |
| **サイズ**   | 64×64px                                                     |
| **最大幅**   | 350.66px                                                    |
| **アセット** | `/assets/blog/113d7f736eba4886ca0872b90979d5d862bcba83.png` |

### 4. テキストコンテナ (14:21)

| プロパティ     | 値        |
| -------------- | --------- |
| **要素名**     | Container |
| **幅**         | 701.34px  |
| **レイアウト** | flex-col  |
| **間隔**       | 8px (gap) |

#### タイトル (14:22, 14:23)

| プロパティ     | 値                                                          |
| -------------- | ----------------------------------------------------------- |
| **要素名**     | Heading 4                                                   |
| **テキスト例** | アンチ合理性。熱を帯びるつくり手を育めるか。BONO の 2023 年 |
| **フォント**   | Noto Sans JP Bold                                           |
| **サイズ**     | 16px                                                        |
| **ウェイト**   | 700 (Bold)                                                  |
| **行高**       | 24px                                                        |
| **色**         | #0F172A (Ebony)                                             |
| **配置**       | text-justify                                                |

#### メタ情報コンテナ (14:24)

| プロパティ     | 値                |
| -------------- | ----------------- |
| **要素名**     | Container         |
| **幅**         | 100% (full width) |
| **レイアウト** | flex-row          |
| **間隔**       | 12.01px (gap)     |

**カテゴリ (14:25, 14:26)**

| プロパティ      | 値                     |
| --------------- | ---------------------- |
| **要素名**      | category               |
| **テキスト例**  | BONO                   |
| **フォント**    | Hind Medium            |
| **サイズ**      | 12px                   |
| **ウェイト**    | 500 (Medium)           |
| **行高**        | 16px                   |
| **色**          | #9CA3AF (Gray Chateau) |
| **white-space** | pre                    |

**更新日 (14:27, 14:28)**

| プロパティ      | 値                                |
| --------------- | --------------------------------- |
| **要素名**      | updated_date                      |
| **テキスト例**  | 2023 年 08 月 25 日               |
| **フォント**    | Hind Medium / Noto Sans JP Medium |
| **サイズ**      | 12px                              |
| **ウェイト**    | 500 (Medium)                      |
| **行高**        | 16px                              |
| **色**          | #9CA3AF (Gray Chateau)            |
| **white-space** | pre                               |

---

## デザイントークン

### カラー

```typescript
const colors = {
  white: "#FFFFFF",
  ebony: "#0F172A", // タイトル
  grayChateauL: "#9CA3AF", // メタ情報
  thumbnailBg: "#D8E7EF", // サムネイル背景
};
```

### タイポグラフィ

```typescript
const typography = {
  heading4: {
    family: "Noto Sans JP",
    weight: 700,
    size: 16,
    lineHeight: 24,
  },
  item: {
    family: "Hind",
    weight: 500,
    size: 12,
    lineHeight: 16,
  },
  time: {
    family: "Hind",
    weight: 500,
    size: 12,
    lineHeight: 16,
  },
};
```

### スペーシング

```typescript
const spacing = {
  xs: 8, // テキストコンテナ内の間隔
  md: 12, // メタ情報の間隔
  lg: 32, // サムネイルとテキストの間隔
};
```

### サイズ

```typescript
const sizes = {
  cardWidth: 1120,
  cardMinHeight: 152,
  thumbnailWidth: 240,
  thumbnailHeight: 135,
  emojiSize: 64,
  textContainerWidth: 701.34,
};
```

---

## 完全な実装コード

### React + TypeScript + Tailwind CSS

```typescript
import React from "react";

const imgEmojiImage =
  "/assets/blog/113d7f736eba4886ca0872b90979d5d862bcba83.png";

interface BlogCardProps {
  title: string;
  category: string;
  date: string;
  thumbnail?: string;
  className?: string;
  href?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  title,
  category,
  date,
  thumbnail = imgEmojiImage,
  className = "",
  href,
}) => {
  const CardContent = () => (
    <div
      className={`
        bg-white box-border
        content-stretch flex flex-col items-start
        min-h-[152px]
        pl-3 pr-6 py-3
        rounded-2xl
        shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]
        hover:shadow-md
        transition-shadow duration-200
        ${className}
      `}
      data-name="Item-link"
      data-node-id="19:34"
    >
      <div
        className="content-stretch flex gap-8 items-center relative shrink-0 w-full"
        data-name="Container"
        data-node-id="14:18"
      >
        {/* サムネイル */}
        <div
          className="
            bg-[#d8e7ef]
            box-border content-stretch flex
            h-[135px] w-[240px]
            items-center justify-center
            px-0 py-10
            relative rounded-xl shrink-0
          "
          data-name="thumbanil - 16:9"
          data-node-id="14:19"
        >
          <div
            className="max-w-[350.66px] relative shrink-0 size-16"
            data-name="emoji Image"
            data-node-id="14:20"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                alt=""
                className="absolute left-0 max-w-none size-full top-0"
                src={thumbnail}
              />
            </div>
          </div>
        </div>

        {/* テキストコンテンツ */}
        <div
          className="content-stretch flex flex-col gap-2 items-start relative shrink-0 w-[701.34px]"
          data-name="Container"
          data-node-id="14:21"
        >
          {/* タイトル */}
          <div
            className="content-stretch flex flex-col items-start relative shrink-0 w-full"
            data-name="Heading 4"
            data-node-id="14:22"
          >
            <div
              className="
                flex flex-col
                font-['Noto_Sans_JP'] font-bold
                justify-center leading-[0]
                relative shrink-0
                text-[#0f172a] text-base
                text-justify w-full
              "
              data-node-id="14:23"
            >
              <p className="leading-6">{title}</p>
            </div>
          </div>

          {/* メタ情報 */}
          <div
            className="content-stretch flex gap-[12.01px] items-start relative shrink-0 w-full"
            data-name="Container"
            data-node-id="14:24"
          >
            {/* カテゴリ */}
            <div
              className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
              data-name="category"
              data-node-id="14:25"
            >
              <div
                className="
                  flex flex-col
                  font-['Hind'] font-medium
                  justify-center leading-[0]
                  not-italic relative shrink-0
                  text-[#9ca3af] text-xs
                  text-justify text-nowrap
                "
                data-node-id="14:26"
              >
                <p className="leading-4 whitespace-pre">{category}</p>
              </div>
            </div>

            {/* 更新日 */}
            <div
              className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
              data-name="updated_date"
              data-node-id="14:27"
            >
              <div
                className="
                  flex flex-col
                  font-['Hind'] font-medium
                  justify-center leading-[0]
                  relative shrink-0
                  text-[#9ca3af] text-xs
                  text-justify text-nowrap
                "
                data-node-id="14:28"
              >
                <p className="leading-4 whitespace-pre">{date}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block no-underline">
        <CardContent />
      </a>
    );
  }

  return <CardContent />;
};

export default BlogCard;
```

---

## レスポンシブ対応

### ブレークポイント別レイアウト

| デバイス                    | カード幅 | レイアウト | サムネイル  | テキスト幅 |
| --------------------------- | -------- | ---------- | ----------- | ---------- |
| **デスクトップ** (1920px)   | 1120px   | 横並び     | 240×135px   | 701.34px   |
| **タブレット** (768-1919px) | 90%      | 横並び     | 200×112.5px | flex-1     |
| **モバイル** (375-767px)    | 95%      | 縦並び     | 100%幅      | 100%       |

### レスポンシブ実装

```typescript
export const BlogCard: React.FC<BlogCardProps> = ({
  title,
  category,
  date,
  thumbnail = imgEmojiImage,
  className = "",
  href,
}) => {
  const CardContent = () => (
    <div
      className={`
        bg-white box-border
        content-stretch flex flex-col items-start
        min-h-[152px] md:min-h-[140px] sm:min-h-auto
        pl-3 pr-6 py-3 sm:p-3
        rounded-2xl
        shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]
        hover:shadow-md
        transition-shadow duration-200
        ${className}
      `}
    >
      <div
        className="
          content-stretch flex
          flex-row sm:flex-col
          gap-8 md:gap-6 sm:gap-3
          items-center sm:items-start
          relative shrink-0 w-full
        "
      >
        {/* サムネイル */}
        <div
          className="
            bg-[#d8e7ef]
            box-border content-stretch flex
            w-[240px] md:w-[200px] sm:w-full
            h-[135px] md:h-[112.5px] sm:aspect-[16/9]
            items-center justify-center
            px-0 py-10 sm:py-0
            relative rounded-xl shrink-0
            overflow-hidden
          "
        >
          <div className="relative shrink-0 size-16 sm:w-full sm:h-full">
            <img
              alt=""
              className="
                absolute left-0 max-w-none size-full top-0
                sm:w-full sm:h-full sm:object-cover
              "
              src={thumbnail}
            />
          </div>
        </div>

        {/* テキストコンテンツ */}
        <div
          className="
            content-stretch flex flex-col
            gap-2
            items-start
            relative shrink-0
            w-[701.34px] md:flex-1 sm:w-full
          "
        >
          {/* タイトル */}
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
            <p
              className="
                font-['Noto_Sans_JP'] font-bold
                text-base md:text-[15px] sm:text-sm
                leading-6 md:leading-[22px] sm:leading-5
                text-[#0f172a]
                text-justify
              "
            >
              {title}
            </p>
          </div>

          {/* メタ情報 */}
          <div className="content-stretch flex gap-3 sm:gap-2 items-start relative shrink-0 w-full">
            {/* カテゴリ */}
            <p
              className="
                font-['Hind'] font-medium
                text-xs md:text-[11px] sm:text-[10px]
                leading-4
                text-[#9ca3af]
                whitespace-pre
              "
            >
              {category}
            </p>

            {/* 更新日 */}
            <p
              className="
                font-['Hind'] font-medium
                text-xs md:text-[11px] sm:text-[10px]
                leading-4
                text-[#9ca3af]
                whitespace-pre
              "
            >
              {date}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block no-underline">
        <CardContent />
      </a>
    );
  }

  return <CardContent />;
};
```

---

## 使用例

### 1. 基本的な使用

```typescript
import { BlogCard } from "@/components/blog/BlogCard";

export const BlogList = () => {
  return (
    <div className="flex flex-col gap-3">
      <BlogCard
        title="アンチ合理性。熱を帯びるつくり手を育めるか。BONOの2023年"
        category="BONO"
        date="2023年08月25日"
        href="/blog/anti-rationality-2023"
      />
    </div>
  );
};
```

### 2. カスタムサムネイル

```typescript
<BlogCard
  title="記事タイトル"
  category="カテゴリ"
  date="2023年12月01日"
  thumbnail="/assets/custom-thumbnail.png"
  href="/blog/article-slug"
/>
```

### 3. リストでの使用

```typescript
const blogPosts = [
  {
    id: "1",
    title: "記事タイトル1",
    category: "BONO",
    date: "2023年08月25日",
    thumbnail: "/assets/thumb1.png",
  },
  // ...
];

export const BlogList = () => {
  return (
    <div className="flex flex-col gap-3 w-full max-w-[1120px] mx-auto">
      {blogPosts.map((post) => (
        <BlogCard
          key={post.id}
          title={post.title}
          category={post.category}
          date={post.date}
          thumbnail={post.thumbnail}
          href={`/blog/${post.id}`}
        />
      ))}
    </div>
  );
};
```

---

## アクセシビリティ

### 推奨設定

```typescript
<a
  href={href}
  className="block no-underline"
  aria-label={`${title} - ${category} - ${date}`}
>
  <div role="article" aria-labelledby="card-title">
    <h3 id="card-title">{title}</h3>
    <div role="contentinfo">
      <span>{category}</span>
      <time dateTime="2023-08-25">{date}</time>
    </div>
  </div>
</a>
```

### キーボードナビゲーション

```css
.blog-card:focus-within {
  outline: 2px solid #0f172a;
  outline-offset: 2px;
}
```

---

## パフォーマンス最適化

### 1. 画像の遅延読み込み

```typescript
<img alt="" className="..." src={thumbnail} loading="lazy" decoding="async" />
```

### 2. メモ化

```typescript
export const BlogCard = React.memo<BlogCardProps>(
  ({ title, category, date, thumbnail, className, href }) => {
    // ...
  }
);
```

### 3. 仮想スクロール（大量のカードがある場合）

```typescript
import { FixedSizeList } from "react-window";

export const BlogListVirtualized = ({ posts }) => {
  return (
    <FixedSizeList
      height={800}
      itemCount={posts.length}
      itemSize={159}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <BlogCard {...posts[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

---

## 実装チェックリスト

### アセット

- [ ] 絵文字画像を `/assets/blog/` に配置
- [ ] デフォルトサムネイル画像の確認

### コンポーネント

- [ ] `BlogCard.tsx` の作成
- [ ] TypeScript 型定義の追加
- [ ] Props の検証

### スタイリング

- [ ] Tailwind CSS クラスの確認
- [ ] 角丸（16px）の確認
- [ ] 影（0px 1px 2px）の確認
- [ ] ホバー効果の実装

### レスポンシブ

- [ ] Desktop（1920px）での表示確認
- [ ] Tablet（768px-1919px）での表示確認
- [ ] Mobile（375px-767px）での表示確認
- [ ] 横 → 縦並びの切り替え確認

### アクセシビリティ

- [ ] aria-label の設定
- [ ] role 属性の設定
- [ ] キーボードナビゲーションの確認
- [ ] スクリーンリーダーでのテスト

### パフォーマンス

- [ ] 画像の遅延読み込み
- [ ] コンポーネントのメモ化
- [ ] 不要な再レンダリングの防止

---

## トラブルシューティング

### カードが正しく表示されない場合

1. **幅が正しく設定されているか確認**

   - Desktop: 1120px
   - Tablet/Mobile: 90%/95%

2. **パディングが正しいか確認**

   - 左: 12px (pl-3)
   - 右: 24px (pr-6)
   - 上下: 12px (py-3)

3. **フォントの読み込み確認**
   - Noto Sans JP: タイトル用
   - Hind: メタ情報用

### レイアウトが崩れる場合

1. **flex-row が適用されているか確認**

   ```html
   <div className="flex flex-row items-center gap-8"></div>
   ```

2. **サムネイルの flex-shrink-0 が設定されているか確認**

   ```html
   <div className="w-[240px] h-[135px] flex-shrink-0"></div>
   ```

3. **テキストコンテナの幅が正しいか確認**
   ```html
   <div className="w-[701.34px]"></div>
   ```

### モバイルで縦並びにならない場合

1. **sm:flex-col が適用されているか確認**

   ```html
   <div className="flex flex-row sm:flex-col"></div>
   ```

2. **サムネイルの幅が 100%になっているか確認**
   ```html
   <div className="w-[240px] sm:w-full"></div>
   ```

```

---

## 関連ドキュメント

- [ブログページ全体レイアウト](./blog-page-layout-specification.md)
- [ヒーローセクション](./herosection.md)
- [背景グラデーション](./background-gradation-implementation.md)

---

## 更新履歴

- 2025-11-10: Figma デザインから自動生成（Node ID: 19:34）
- 完全なレスポンシブ対応を追加
- アクセシビリティとパフォーマンス最適化を追加

---

## 備考

このコンポーネントは、BONO blog のブログ記事一覧で使用される基本的なカードコンポーネントです。

### デザインの意図

- **横並びレイアウト**: サムネイルとテキストを効率的に表示
- **16:9 サムネイル**: 標準的な画像比率
- **淡いブルー背景**: 絵文字を引き立てる優しい色
- **シンプルな影**: 控えめな立体感

### カスタマイズ時の注意

- サムネイルサイズを変更する場合は、16:9 の比率を維持してください
- テキストコンテナの幅は、サムネイル幅との バランスを考慮してください
- モバイルでは縦並びレイアウトに切り替わります

カスタマイズが必要な場合は、`className` props を使用して Tailwind クラスを追加してください。
```
