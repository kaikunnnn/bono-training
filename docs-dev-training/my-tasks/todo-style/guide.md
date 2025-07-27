# 進め方ガイドのセクション部分に index.md の情報を反映できるようにする

### 以下の index.md は:trainingSlug に使われる情報項目の例です。

この index.md の

```
---
icon: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Slightly%20smiling%20face/3D/slightly_smiling_face_3d.png"
title: "UXデザインをやれ！"
description: "デザインシステムの基本的な考え方から実装まで..."
thumbnail: "https://assets.st-note.com/production/uploads/images/108585497/rectangle_large_type_2_e25111bbba69e541866bb37caf921ee0.png?width=1200"
type: "portfolio"
category: "UXデザイン"
tags: ["UX", "情報設計"]
estimated_total_time: "2時間"
task_count: 2
---

## このチャレンジで伸ばせる力

トレーニングはそのままやってもいいです。基礎も合わせて学習して、実践をトレーニングで行うと土台を築けるでしょう。

<div class="skill-group">

### ■ UX の力

- 自分が良いと思うではなく、使う人目線の UI 作成スキル
- 参考リンク：『[デザイン基礎講座](https://example.com)』

![スキル解説画像](http://i.imgur.com/Jjwsc.jpg "サンプル")

### ■ 機能や状態を網羅して UI 設計する力

- 例外を考えて実装や検証や状況のパターンを UI で網羅
- より詳細な状態管理の考え方

### \* ユーザーゴールから配慮するべきものを UI に落とす

- 自分が良いと思うではなく、使う人目線の UI 作成スキル
- 参考リンク：『〜〜〜〜〜〜〜〜〜〜〜〜』
</div>

## 進め方ガイド

> デザイン基礎を身につけながらデザインするための
> やり方の流れを説明します。

#### レッスンで身につける

<!-- 以下1つのグループとしてスタイルを定義したい-->

<div class="lesson">
![画像](https://wacul-ai.com/blog/wp-content/uploads/2024/07/image_02.jpg "サンプル")
##### ゼロからはじめる情報設計
進め方の基礎はBONOで詳細に学習・実践できます
</div>

#### 進め方

<div class="step">

##### ステップ 1: 摸写したいアプリを選ぶ

- なんでも良いですが、なるべく単一機能を提供しているアプリが良いと思います。普段使っている iPhone/Android の純正アプリ、ホーム画面に入っていていつも使っているアプリ、ストアのランキング上位のアプリなどから気楽に探してください。

</div>

<div class="step">

##### ステップ 2: 📱 2.アプリを触りながら、気になったことをメモする(10 分)

- なんでも良いですが、なるべく単一機能を提供しているアプリが良いと思います。普段使っている iPhone/Android の純正アプリ、ホーム画面に入っていていつも使っているアプリ、ストアのランキング上位のアプリなどから気楽に探してください。

</div>
```

この内容の「## 進め方ガイド」のブロックを、
実装している :trainingSlug のページの
data-lov-id="src/components/training/TrainingGuideSection.tsx:68:6"
ブロックで表現しているスタイルの中に、文字データとして表示したいです
詳しい内容は以下に書きます。

index.md の内容に応じてこのスタイルを使って表示して欲しいです。

### レッスン

- 以下の index.md の中の内容は、data-lov-id="src/components/training/TrainingGuideSection.tsx:81:12" で使って欲しいです

```
#### レッスンで身につける

<!-- 以下1つのグループとしてスタイルを定義したい-->

<div class="lesson">
![画像](https://wacul-ai.com/blog/wp-content/uploads/2024/07/image_02.jpg "サンプル")
##### ゼロからはじめる情報設計
進め方の基礎はBONOで詳細に学習・実践できます
</div>
```

- index.md にデータがない場合はこのブロック自体を非表示にしたいです

### 進め方

- 以下の index.md の中の内容は、data-lov-id="src/components/training/TrainingGuideSection.tsx:96:12" のブロックの内容を使って表示したいです。

```
#### 進め方

<div class="step">

##### ステップ 1: 摸写したいアプリを選ぶ

- なんでも良いですが、なるべく単一機能を提供しているアプリが良いと思います。普段使っている iPhone/Android の純正アプリ、ホーム画面に入っていていつも使っているアプリ、ストアのランキング上位のアプリなどから気楽に探してください。

</div>

<div class="step">

##### ステップ 2: 📱 2.アプリを触りながら、気になったことをメモする(10 分)

- なんでも良いですが、なるべく単一機能を提供しているアプリが良いと思います。普段使っている iPhone/Android の純正アプリ、ホーム画面に入っていていつも使っているアプリ、ストアのランキング上位のアプリなどから気楽に探してください。

</div>
```

- data-lov-id="src/components/training/StepBlock.tsx:18:4" の中身は `##### ステップ X:` の数だけ表示したい。コンポーネントのブロックです。
  - このコンポーネントの下には「Arrow」が付きますが、最後のステップには付きません。
  -
