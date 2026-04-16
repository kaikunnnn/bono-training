# ガイド詳細ページ リデザイン差分

**作成日**: 2026-04-13
**対象Figma**: https://www.figma.com/design/bJ33ufbqjh0TcxhbU7Mj4H?node-id=8-2
**対象ページ**: `/guide/:slug`（詳細ページ）

---

## ステータス凡例

- ✅ 認識合ってる
- ❌ 違う
- ❓ 要確認・質問
- 📝 補足コメント

---

## G. カテゴリシステム（/guide 一覧）

### 現状の仕組み

**カテゴリ定義が2系統存在していて、互いに連携していない。**

#### ① `src/lib/guideCategories.ts`（Sanity CMS連携用）

- カテゴリ数: **4つ** (`career`, `learning`, `industry`, `tools`)
- 用途: `getCategoryInfo(id)` でラベルを取得する共通関数
- 使用箇所: `GuideCard.tsx`, `GuideHeader.tsx`, `RelatedGuides.tsx`（コンポーネント側）

#### ② `src/pages/Guide/index.tsx` 内のローカル定義（一覧ページ専用）

- カテゴリ数: **8つ** (`career`, `study-method`, `design-process`, `portfolio`, `perspectives`, `stories`, `starting`, `faq`)
- ID・ラベルともに① とは別物（`study-method` は ① の `learning` に対応するが id が異なる）
- ページ内のみで完結、外部と連携していない

⇨基本的にSanityのGuideに設定されているものを使いたいです。
なのでそれ以外で使っているものは使用しないようにしてください。

#### タブUIのロジック（index.tsx内）

```tsx
const [activeCategory, setActiveCategory] = useState<string | null>(null);
const shouldShow = (id) => !activeCategory || activeCategory === id;
```

- `null` → すべてのセクション表示
- カテゴリ選択 → そのセクションのみ表示（他は非表示）
- 選択済みのタブを再クリック → `null` に戻る（トグル動作）

⇨私が言ったのは、タブUIのコンポーネントの話です。このコンポーネントは定義されてないのではないでしょうか？代わりに定義されているタブUIがあると思います

#### タブのスタイル（現状）

- 横スクロール可能な pill ボタン列（`overflowX: auto`）
- 未選択: 透明背景 + 黒文字
- 選択中: 黒背景 (`#1a1a1a`) + 白文字
- 絵文字 + ラベルテキスト
- **全インラインスタイル**（Tailwindなし）
  ⇨私が言ったのは、タブUIのコンポーネントの話です。このコンポーネントは定義されてないのではないでしょうか？代わりに定義されているタブUIがあると思います

---

### G-1. カテゴリ定義の二重管理問題

- **現状**: ① `guideCategories.ts`（4カテゴリ）と ② index.tsx ローカル（8カテゴリ）が別々に存在
- **問題**: IDが異なるため、一覧タブと詳細ページのカテゴリが整合していない
- **例**: 一覧では `study-method`、guideCategories.ts では `learning`（同じ概念なのにIDが違う）
- **ステータス**: 📝 要検討

⇨まず、Sanityで使っているカテゴリのみを使う方針にしたいです。そして、/guideに並べるコンテンツは、とりあえず新着順にしたいです。まだ記事の数が少ないのが理由です。

### G-2. タブUIのリデザイン

- **現状**: 横スクロール pill ボタン、全インラインスタイル
- **やりたいこと**:
- **ステータス**: 📝 未着手

⇨コンポーネントを探しましょう

### G-3. カテゴリ絞り込みのUX

- **現状**: カテゴリ選択でセクション全体が非表示（セクション単位での表示/非表示）
- **やりたいこと**:
- **ステータス**: 📝 未着手

⇨何を言ってるんだ？

---

## 未着手の前提確認

| #   | 確認事項                                        | 影響範囲                                                |
| --- | ----------------------------------------------- | ------------------------------------------------------- |
| 1   | `Guide` 型に `thumbnail` フィールドを追加するか | Sanity CMS + TypeScript型 + guideLoader                 |
| 2   | Rounded M+ 1c Bold を詳細ページに適用           | フォント読み込み確認（既にindex側で使用中のため多分OK） |
| 3   | H3/H4スタイルの定義                             | GuideContent.tsx                                        |
| 4   | 目次コンポーネントの扱い                        | TableOfContents.tsx                                     |
| 5   | タグ表示の扱い                                  | GuideHeader.tsx                                         |
| 6   | 関連ガイドの扱い                                | RelatedGuides.tsx                                       |
| 7   | 読了時間表示の扱い                              | GuideHeader.tsx                                         |
