# :trainingSlug の変更内容

1. ファーストビューの背景：
   - 高さとグラデーションの指定
   - 背景のスタイルはこのファイルを使う [この SVG 画像](../../../public/assets/backgrounds/gradation/bg-gradation/type-trainingdetail.svg)
   - 余白を調整してコンテンツを表示できるようにする
   - icon block のスタイル調整
2. 見出しを RoundM1 フォントにする
3. トレーニング内容：
   - dot 変更
   - border を dot に変更＋左右余白の調整
   - circle arrow の変更
   - CHALLENGE のフォントを dot にする
4. チャレンジで伸ばせる力

   - 背景の色を白透過にする
   - 内容セクションのスタイルを変更する

5. 進め方ガイド
   - レッスン：画像の設定 - サイズと変更可能か
   - 進め方のスタイルを調整
   - 矢印を変更する

---

## ヒーローセクションの背景

- 対象：たぶん次の id 周りだと思います。背景に引く予定の素材部分を指定したいです。間違っていたら教えてくださいわからなければ質問して data-lov-id="src/pages/TrainingDetail.tsx:159:20"
- - 背景のスタイルはこのファイルを使う [この SVG 画像](../../../public/assets/backgrounds/gradation/bg-gradation/type-trainingdetail.svg)

## /training のページ

- data-lov-id="src/components/training/TrainingHero.tsx:6:4"
- の paddint-top を 4rem にしたい

## トレーニング内容

## チャレンジで伸ばせる力

- 対象 data-lov-id="src/components/training/ChallengeMeritSection.tsx:29:12" - このコンポーネントの padding top bottom を 0.5rem にするにする
- 対象 data-lov-id="src/components/training/ChallengeMeritSection.tsx:21:4"
  - このコンポーネントのの padding top bottom をゼロにする

## border のスタイル

- 対象 data-lov-id="src/components/training/TaskCollectionBlock.tsx:50:14"
- 1px の太さに
- 左に 5px ずらす （デスクトップ時）
- dot にして欲しい
  - dashed 8, 8

## 細かい変更

- data-lov-id="src/pages/TrainingDetail.tsx:291:8"の背景

  - #F3F3F3 に変更

- data-lov-id="src/components/training/TaskCollectionBlock.tsx:83:22"

  - Margin-bottom をなくす

- data-lov-id="src/pages/TrainingDetail.tsx:269:10"　の中のブロックの間に Divider を追加したい

## 2

- data-lov-id="src/components/training/IconBlock.tsx:46:6" の bottom 角丸を 32px にする
- data-lov-id="src/components/training/ChallengeMeritSection.tsx:23:8" の margin-bottom 0.75rem に

## レッスン部分

- レッスン画像部分（data-lov-id="src/components/training/LessonCard.tsx:27:8）を index.md で変更できるようにしたい。つまり YAML の 1 つとして登録したい
- つまり data-lov-id="src/components/training/LessonCard.tsx:27:8" の中身が image のみになると言うことです。
- 画像の比率は 16:9 にするつもりです。
- 画像は. public/assets/lesson のフォルダの中の image を使うようにしたいです。（可能ならフォルダの指定をしたいです）
