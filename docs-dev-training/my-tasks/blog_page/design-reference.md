## blog_page. > bonoSite-main から該当するページのスタイルとアニメーションのみを流用する

bonoSite-main

    •	流用元サイトの要素分解（レイアウト、カード、本文、目次、タグ/カテゴリ、CTA、トーン&マナー）
    •	タイポ/カラー/余白/アニメのルール
    •	「どこをそのまま使う／どこをアレンジする」境界

## bonosSite-main から流用したいデザイン解説

binoSite-main にあるコードから以下のページの「見た目のデザインと構造」をそのまま真似してください。
記事管理の CMS などの方法は新しく実装し直しますがブログのトップとその詳細ページのデザインはここから使いたいです

### ページ

- /blog
  - /blog は / のトップページのデザインが該当します
- /blog/:slug
  - /content/:slug のページのデザインが該当します
  - ※本文に CSS が効いてないのですがこれは実装ミスです。実際は適用されたデザインが望ましい
- /blog/category 以下
  - これは該当するページがないので新規作成します

### 2 レイアウト/コンテナ

    •	Tailwind container 設定（tailwind.config.js）
    •	container.center = true, padding: 2rem, screens.2xl = 1400px
    •	ページ本文幅：w-11/12 md:w-10/12（例 ContentDetail）
    •	背景イメージ：bg-Top（styles/globals.css → /top-image.svg）

### 3 タイポグラフィ & フォント

    •	styles/globals.css で読み込み：
    •	英字: Hind / Dongle（var指定）
    •	日本語: Noto Sans JP, Zen Kaku Gothic New, Dela Gothic One, DotGothic16 など（用途に応じ複数）
    •	ベース：body { font-family: "Hind","Noto Sans JP",sans-serif; font-weight:500; }
    •	見出し（例：記事タイトル）：text-4xl md:text-5xl font-bold !leading-normal

### 4) カラー/トーン

    •	Tailwind 既定色中心（stone, gray 系）＋アクセント差し込み
    •	ボタン既定：bg-stone-900 text-stone-50（ダークで反転）
    •	カテゴリ系の補色（styles/bg-category.css）
    •	.bg-tweet #E0DFEA / .bg-book #C7E1E7 / .bg-bono #F8E5EE / .bg-output #E4EFE2

プロジェクト独自パレットの上書きは最小。デフォルト Tailwind 色で統一する設計。

### 5 コンポーネント（流用の柱）

カード（shadcn ベース）
• components/common/ui/card.jsx
• Card / CardHeader / CardTitle / CardDescription / CardContent / CardFooter
• 見た目：rounded-xl border bg-card text-card-foreground shadow
• 用途例：components/Series/layout/SeriesCard.js
• 画像比 aspectRatio: "52/80" の縦長カバー
• CardTitle= text-lg font-semibold、CardDescription= text-base text-gray-500

ボタン
• components/common/ui/button.jsx（class-variance-authority）
• variant: default / destructive / outline / secondary / ghost / link
• size: default / sm / lg / icon
• 既定 default: bg-stone-900 text-stone-50（太字）
• サイズ既定：h-10 px-4 pt-3 pb-2.5 text-lg

ヘッダー/フッター
• Header.js：固定配置 fixed py-6 px-6 z-50、ロゴリンク、ユーザーのプラン表示分岐あり
• Footer.js：Memberstack/Stripe 周辺に配慮したフッター

アイキャッチ/記事ヘッダー
• EyecatchEpisode.js
• 絵文字アイコン(正方形)＋タイトル＋説明＋タグ＋日付
• センター配置、余白大きめ（m-12 前後）

モーション
• Framer Motion でリストのフェード&スライド（SeriesCard.js の variants）

### 6 Tailwind 設定のポイント（tailwind.config.js）

    •	darkMode: ["class"]（テーマ切替は class 制御）
    •	extend.keyframes:
    •	accordion-down / accordion-up（Radix想定）
    •	scrollLeft（マルチロゴ等の無限スクロール）
    •	float（ふわっと上下）
    •	extend.animation: scrollLeft 120s linear infinite, float 4s ease-in-out infinite
    •	extend.fontFamily: dongle, noto-sans（CSS var で差し込み）
    •	extend.fontSize.xxs = 10px
