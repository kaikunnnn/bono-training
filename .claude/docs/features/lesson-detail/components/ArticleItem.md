# ArticleItem コンポーネント仕様

**作成日**: 2025-01-15
**Figmaリンク**:
- video + default: [node-id=437:3211](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=437:3211)
- video + checked: [node-id=437:3127](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=437:3127)
- text + default: [node-id=437:3214](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=437:3214)
- text + checked: [node-id=437:3236](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=437:3236)

---

## 概要

記事アイテム（4状態対応）

```
┌──────────────────────────────────────────────────────────────┐
│  [番号/✓]  [サムネイル]  [タグ] タイトル              [→]   │
│            [アイコン][時間]                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 状態一覧

| # | 状態名 | articleType | isCompleted | node-id |
|---|--------|-------------|-------------|---------|
| 1 | video + default | `video` | `false` | 437:3211 |
| 2 | video + checked | `video` | `true` | 437:3127 |
| 3 | text + default | `text` | `false` | 437:3214 |
| 4 | text + checked | `text` | `true` | 437:3236 |

---

## レイアウト構造

```
ArticleItem (コンテナ)
├── NumberOrCheck (番号 or チェックアイコン)
├── Thumbnail (サムネイル)
│   ├── Image (画像)
│   ├── ArticleTypeIcon (タイプアイコン: video/text)
│   └── VideoDuration (動画時間バッジ) ※videoのみ
├── ContentArea (タイトルエリア)
│   ├── Tag (タグ)
│   └── Title (タイトル)
└── ArrowIcon (右矢印)
```

---

## Figma仕様

### コンテナ (ArticleItem)

| プロパティ | 値 |
|-----------|-----|
| レイアウト | flex |
| 方向 | row (横並び) |
| 整列 | items-center |
| ギャップ | **16px** |
| パディング上下 | **16px** |
| パディング左右 | **32px** |
| ボーダー下 | **1px solid rgba(0, 0, 0, 0.08)** |
| 幅 | 733px (カード幅に依存) |

---

### 1. NumberOrCheck (番号 or チェック)

**サイズ**: 16px × 16px

#### default状態（未完了）→ 番号表示

| プロパティ | 値 |
|-----------|-----|
| フォント | **Unbounded Bold** |
| サイズ | **12px** |
| 色 | **#414141** |
| 配置 | 中央揃え (text-center) |
| 行高 | なし (leading-none) |

#### checked状態（完了）→ チェックアイコン

| プロパティ | 値 |
|-----------|-----|
| サイズ | **16px × 16px** |
| 背景 | **グラデーション** (from-[rgba(255,75,111,0.68)] to-[rgba(38,119,143,0.68)]) |
| 角丸 | **9999px** (円形) |
| backdrop-blur | **2px** |
| チェックアイコン | 10px, 白/緑 |

**※IconCheck コンポーネントを再利用**

---

### 2. Thumbnail (サムネイル)

| プロパティ | 値 |
|-----------|-----|
| 幅 | **80px** |
| 高さ | **45px** |
| 角丸 | **6px** |
| 背景色 | **#E0DFDF** (フォールバック) |
| オーバーフロー | hidden (clip) |

#### ArticleTypeIcon (タイプアイコン)

**位置**: サムネイル中央 (left: 32px, top: 14px)

##### video の場合

| プロパティ | 値 |
|-----------|-----|
| サイズ | **16px × 16px** |
| 背景 | **#FFFFFF** (白) |
| 角丸 | **10000px** (円形) |
| パディング | **10px** |
| アイコン | 再生アイコン (Media / Play), 4.167px |
| アイコン色 | **rgba(23, 16, 45, 1)** = #17102D |

##### text の場合

| プロパティ | 値 |
|-----------|-----|
| サイズ | 約10px × 10px |
| 背景 | **rgba(255, 255, 255, 0.7)** (半透明白) |
| 角丸 | **3px** |
| パディング | **1px** |
| アイコン | ファイルアイコン (File / File_Blank), 8.167px |
| アイコン色 | **#000000** (黒) |

#### VideoDuration (動画時間バッジ) ※videoのみ

| プロパティ | 値 |
|-----------|-----|
| 位置 | absolute, right: 2px, bottom: 1.5px |
| 背景 | **rgba(0, 0, 0, 0.7)** |
| パディング | **1px** |
| 角丸 | **3px** |
| フォント | **Helvetica Regular** |
| サイズ | **8px** |
| 色 | **#FFFFFF** (白) |
| 行高 | なし (leading-none) |
| 形式 | "12:35" (mm:ss) |

---

### 3. ContentArea (タイトルエリア)

| プロパティ | 値 |
|-----------|-----|
| レイアウト | flex |
| 方向 | row |
| 整列 | items-center, justify-between |
| flex | 1 (残りスペースを占有) |
| オーバーフロー | hidden (clip) |

#### Tag (タグ)

| プロパティ | 値 |
|-----------|-----|
| 背景 | **#F4F4F4** |
| パディング上下 | **2px** |
| パディング左右 | **4px** |
| 角丸 | **6px** |
| フォント | **Noto Sans JP Medium** |
| サイズ | **10px** |
| 色 | **#242B30** |
| 行高 | なし (leading-none) |
| 例 | "解説" |

#### Title (タイトル)

| プロパティ | 値 |
|-----------|-----|
| フォント | **Noto Sans JP Bold** |
| サイズ | **14px** |
| 行高 | **20px** |
| 色 | **#1E1B1B** |
| マージン上 | **4px** (タグとのギャップ) |

#### Tag と Title の間

| プロパティ | 値 |
|-----------|-----|
| ギャップ | **4px** |

---

### 4. ArrowIcon (右矢印)

| プロパティ | 値 |
|-----------|-----|
| サイズ | **20px × 20px** (default) / **25px × 25px** (checked時、一部) |
| ボーダー | **1px solid rgba(0, 0, 0, 0.32)** |
| 角丸 | **12498.75px** (円形) |
| backdrop-blur | **2.5px** |
| 内部SVGサイズ | **15px × 15px** |
| アイコン | ChevronRight (→) |

---

## Props

```tsx
interface ArticleItemProps {
  /** 記事番号 (1, 2, 3...) */
  articleNumber: number;

  /** 記事タイトル */
  title: string;

  /** 記事スラッグ (URLパス) */
  slug: string;

  /** サムネイル (Sanity画像) */
  thumbnail?: any;

  /** サムネイルURL (直接指定) */
  thumbnailUrl?: string;

  /** 記事タイプ */
  articleType: "video" | "text";

  /** 完了状態 */
  isCompleted: boolean;

  /** 動画時間 (秒数) ※videoの場合 */
  videoDuration?: number;

  /** タグ (例: "解説") */
  tag?: string;

  /** プレミアムコンテンツか */
  isPremium?: boolean;
}
```

---

## 実装コード

```tsx
import { useNavigate } from "react-router-dom";
import { urlFor } from "@/lib/sanity";
import { Play, FileText, ChevronRight, Check } from "lucide-react";

interface ArticleItemProps {
  articleNumber: number;
  title: string;
  slug: string;
  thumbnail?: any;
  thumbnailUrl?: string;
  articleType: "video" | "text";
  isCompleted: boolean;
  videoDuration?: number;
  tag?: string;
  isPremium?: boolean;
}

export function ArticleItem({
  articleNumber,
  title,
  slug,
  thumbnail,
  thumbnailUrl,
  articleType,
  isCompleted,
  videoDuration,
  tag,
  isPremium,
}: ArticleItemProps) {
  const navigate = useNavigate();

  // 動画時間をmm:ss形式に変換
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  // サムネイルURL取得
  const getThumbnailUrl = () => {
    if (thumbnailUrl) return thumbnailUrl;
    if (thumbnail?.asset?._ref) {
      return urlFor(thumbnail).width(160).height(90).url();
    }
    return null;
  };

  const handleClick = () => {
    navigate(`/articles/${slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-4 px-8 py-4 border-b border-black/[0.08] cursor-pointer hover:bg-gray-50 transition"
    >
      {/* 1. 番号 or チェック */}
      {isCompleted ? (
        <div className="size-4 rounded-full bg-gradient-to-b from-[rgba(255,75,111,0.68)] to-[rgba(38,119,143,0.68)] backdrop-blur-[2px] flex items-center justify-center flex-shrink-0">
          <Check className="size-2.5 text-white" strokeWidth={2.5} />
        </div>
      ) : (
        <div className="size-4 flex items-center justify-center flex-shrink-0">
          <span className="font-unbounded font-bold text-[12px] text-[#414141] text-center leading-none">
            {articleNumber}
          </span>
        </div>
      )}

      {/* 2. サムネイル */}
      <div className="relative w-20 h-[45px] rounded-[6px] overflow-hidden bg-[#e0dfdf] flex-shrink-0">
        {getThumbnailUrl() && (
          <img
            src={getThumbnailUrl()!}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* タイプアイコン */}
        {articleType === "video" ? (
          <div className="absolute left-[32px] top-[14px] size-4 bg-white rounded-full flex items-center justify-center">
            <Play className="size-1 text-[#17102d]" fill="#17102d" />
          </div>
        ) : (
          <div className="absolute left-[32px] top-[14px] bg-white/70 rounded-[3px] p-px flex items-center justify-center">
            <FileText className="size-2 text-black" />
          </div>
        )}

        {/* 動画時間バッジ (videoのみ) */}
        {articleType === "video" && videoDuration && (
          <div className="absolute bottom-[1.5px] right-[2px] bg-black/70 px-px py-px rounded-[3px]">
            <span className="text-[8px] text-white font-helvetica leading-none">
              {formatDuration(videoDuration)}
            </span>
          </div>
        )}
      </div>

      {/* 3. タイトルエリア */}
      <div className="flex-1 flex items-center justify-between overflow-hidden">
        <div className="flex flex-col gap-1">
          {/* タグ */}
          {tag && (
            <div className="bg-[#f4f4f4] px-1 py-0.5 rounded-[6px] w-fit">
              <span className="font-noto-sans-jp font-medium text-[10px] text-[#242b30] leading-none">
                {tag}
              </span>
            </div>
          )}
          {/* タイトル */}
          <span className="font-noto-sans-jp font-bold text-[14px] text-[#1e1b1b] leading-[20px]">
            {title}
          </span>
        </div>

        {/* 4. 右矢印 */}
        <div className="size-5 border border-black/[0.32] rounded-full backdrop-blur-[2.5px] flex items-center justify-center flex-shrink-0">
          <ChevronRight className="size-[15px] text-black/50" />
        </div>
      </div>
    </div>
  );
}
```

---

## Tailwind クラス対応表

| Figma値 | Tailwind |
|---------|----------|
| gap: 16px | `gap-4` |
| padding: 16px 32px | `px-8 py-4` |
| border-bottom: 1px solid rgba(0,0,0,0.08) | `border-b border-black/[0.08]` |
| size: 16px | `size-4` |
| size: 20px | `size-5` |
| width: 80px | `w-20` |
| height: 45px | `h-[45px]` |
| border-radius: 6px | `rounded-[6px]` |
| font-size: 12px | `text-[12px]` |
| font-size: 10px | `text-[10px]` |
| font-size: 14px | `text-[14px]` |
| font-size: 8px | `text-[8px]` |
| line-height: 20px | `leading-[20px]` |
| line-height: none | `leading-none` |
| color: #414141 | `text-[#414141]` |
| color: #242B30 | `text-[#242b30]` |
| color: #1E1B1B | `text-[#1e1b1b]` |
| background: #F4F4F4 | `bg-[#f4f4f4]` |
| background: #E0DFDF | `bg-[#e0dfdf]` |
| backdrop-blur: 2px | `backdrop-blur-[2px]` |
| backdrop-blur: 2.5px | `backdrop-blur-[2.5px]` |
| border: 1px solid rgba(0,0,0,0.32) | `border border-black/[0.32]` |

---

## 状態別の差分まとめ

| 要素 | video + default | video + checked | text + default | text + checked |
|------|-----------------|-----------------|----------------|----------------|
| 左アイコン | 番号 | ✓グラデ | 番号 | ✓グラデ |
| タイプアイコン | 再生(白円) | 再生(白円) | ファイル(半透明) | ファイル(半透明) |
| 時間バッジ | あり | あり | なし | なし |
| 右矢印サイズ | 20px | 25px | 20px | 20px |

---

## 色まとめ

| 用途 | 色 | Hex/rgba |
|------|-----|----------|
| 番号テキスト | グレー | #414141 |
| チェックグラデ上 | ピンク68% | rgba(255,75,111,0.68) |
| チェックグラデ下 | 青緑68% | rgba(38,119,143,0.68) |
| サムネ背景 | 薄グレー | #E0DFDF |
| タグ背景 | 薄グレー | #F4F4F4 |
| タグテキスト | 濃グレー | #242B30 |
| タイトル | 黒 | #1E1B1B |
| 時間バッジ背景 | 黒70% | rgba(0,0,0,0.7) |
| 矢印ボーダー | 黒32% | rgba(0,0,0,0.32) |
| 区切り線 | 黒8% | rgba(0,0,0,0.08) |

---

## 注意事項

- `font-unbounded` と `font-helvetica` がtailwind.configに定義されていることを確認
- 動画時間は秒数で受け取り、コンポーネント内でmm:ss形式に変換
- サムネイルはRetina対応で2倍サイズ(160×90)で取得
- タグは省略可能（nullの場合は非表示）
- video + checked 時に右矢印が25pxになるFigma仕様があるが、統一して20pxにしてもよい（要確認）
