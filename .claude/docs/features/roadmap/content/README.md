# ロードマップコンテンツ編集ガイド

**最終更新**: 2026-03-26

## 概要

このフォルダには各ロードマップのコンテンツがマークダウン形式で保存されています。
オフラインで編集し、オンラインに戻ったらClaudeに確認・Sanity反映を依頼してください。

## ファイル一覧

| ファイル                                                     | ロードマップ                   |
| ------------------------------------------------------------ | ------------------------------ |
| [uiux-career-change.md](./uiux-career-change.md)             | UIUXデザイナー転職ロードマップ |
| [ui-design-beginner.md](./ui-design-beginner.md)             | UIデザイン入門                 |
| [ui-visual.md](./ui-visual.md)                               | UIビジュアル入門               |
| [information-architecture.md](./information-architecture.md) | 情報設計基礎                   |
| [ux-design.md](./ux-design.md)                               | UXデザイン基礎                 |

## 編集ルール

### 基本情報

- `title`, `tagline`, `description` は自由に編集可
- `gradientPreset`: galaxy, ocean, teal, sunset, infoarch, rose, uivisual から選択
- `estimatedDuration`: "1-2" のような形式（ヶ月）

### カリキュラム内のコンテンツ

```markdown
- lesson: `slug-name` — レッスンタイトル
- roadmap: `roadmap-slug` — ロードマップタイトル
- link: URL | タイトル | 説明
```

### slugがわからない場合

タイトルだけ書いてOK！メモを添えてください：

```markdown
- lesson: ??? — Figmaの使い方っぽいやつ（タイトルあやふや、要確認）
- lesson: `???` — センスを盗む方法みたいなレッスン
```

### コンテンツの追加・削除

```markdown
- lesson: `new-lesson` — 新しく追加したい ← 追加
<!-- 削除: - lesson: `old-lesson` — 古いレッスン --> ← 削除（コメントアウト）
```

## 編集後の反映

1. 編集したファイルをコミット
2. Claudeに「ロードマップのマークダウンをSanityに反映して」と依頼
3. 差分を確認して反映
