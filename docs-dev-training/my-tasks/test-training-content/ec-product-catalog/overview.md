# ECサイト商品カタログトレーニング - 概要

## ファイル構造

```
content/training/ec-product-catalog/
├── index.md
└── tasks/
    ├── requirements-analysis/
    │   └── content.md
    ├── information-architecture/
    │   └── content.md
    └── ui-wireframe/
        └── content.md
```

## index.md フロントマター設定

```yaml
---
title: "ECサイト商品カタログをデザインしよう"
description: "ユーザーが商品を見つけやすいカタログ設計を学ぶ"
category: "情報設計"
type: "challenge"
difficulty: "中級"
duration: "120分"
tags: ["情報設計", "UX", "EC", "カタログ"]
isPremium: false
order_index: 3
thumbnail_url: "/assets/backgrounds/ec-catalog-bg.svg"
skills:
  - "情報アーキテクチャ設計"
  - "ユーザーニーズ分析"
  - "UIワイヤーフレーム作成"
learning_goals:
  - "効果的な商品カタログの情報構造を理解する"
  - "ユーザーの商品探索パターンを分析できる"
  - "商品発見性を高めるUI設計ができる"
tasks:
  - slug: "requirements-analysis"
    title: "要件分析とユーザーニーズ調査"
    order_index: 1
  - slug: "information-architecture"
    title: "情報アーキテクチャの設計"
    order_index: 2
  - slug: "ui-wireframe"
    title: "UIワイヤーフレーム作成"
    order_index: 3
---
```

## コンテンツ内容

ECサイトでのユーザーの商品探索行動を理解し、効率的な商品カタログの設計手法を学習するトレーニング。実際のECサイトを想定したケーススタディを通じて、情報設計の基礎から実践的なUI設計まで段階的に学ぶ。

### 想定シナリオ
- オンライン書籍販売サイトの商品カタログリニューアル
- 約10,000点の書籍を取り扱う中規模ECサイト
- ユーザーの商品発見性向上が課題

### 学習の流れ
1. ユーザーリサーチと要件定義
2. カテゴリ設計と情報アーキテクチャ
3. 検索・フィルタ機能の設計
4. 商品詳細ページとの連携設計

## テスト観点

- **情報設計カテゴリ**: 既存の`info-odai-book-rental`と併存して表示される
- **中級難易度**: 既存コンテンツとの差別化
- **プレミアム要素**: 一部タスクにプレミアムコンテンツを含む
- **実用性**: 実際の業務に活用できる内容