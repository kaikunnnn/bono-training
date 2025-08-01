# /training top のスタイル修正内容

1. 全体のコンテンツ幅
2. :trainingSlug のこんぽーねんと
3. セクション見出し: タグを外す。フォントを Round にする
4. Footer の修正：太字の部分、top-border をなくす

---

## 全体のコンテンツ幅

- desktop の時は 1180px の幅最大でレスポンシブにしたいです

## :trainingSlug のコンポーネント

- 対象：data-lov-id="src/components/training/PortfolioTrainingCard.tsx:34:8" のコンポーネント
- 以下のブロックごとに調整したい
  - 背景のグラデーション
    - 対象： data-lov-id="src/components/training/PortfolioTrainingCard.tsx:24:8" のブロック
    - グラデーションの色を調整したいです。
    - public フォルダのこの SVG 画像を使ってみて欲しいです public/assets/backgrounds/gradation/bg-gradation/type-trainingdetail.svg
  - 1.  ポートフォリオお題 の typeTag 部分
    - 2.　文字部分を Round~のすでに他の箇所で適用できているフォントスタイルを当てて！なんならサービス全体で何故か Round〜のフォント使えてない箇所があるからどうにか根本的に仕組みを作って欲しいす
  - 3.  タイトルと description のブロック
    - 対象：data-lov-id="src/components/training/PortfolioTrainingCard.tsx:70:14" のブロック
    - 要素出しの間の余白を "4px"つけたいです。すでにそれぐらいついているなら "8px"にしたい

## セクション見出し: タグを外す。フォントを Round にする

## Footer の修正：太字の部分、top-border をなくす
