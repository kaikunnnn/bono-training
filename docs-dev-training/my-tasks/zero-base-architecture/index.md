# ゼロベーストレーニングサービス設計書

## 概要

このドキュメントは、UI/UXデザイン学習プラットフォーム BONOのトレーニング機能を、ゼロから設計し直した場合の理想的なアーキテクチャを記載した設計書です。

## アーキテクチャの基本方針

### 1. データ層の完全分離
- **構造化データ**: YAML/JSON による設定、スキル、ステップ、タスクの管理
- **コンテンツデータ**: 純粋なMarkdown（フロントマター無し）
- **メタデータ**: 実行時バリデーション付きの型安全な管理

### 2. 型安全システム
- **Zod スキーマ**: 実行時データバリデーション
- **TypeScript型定義**: コンパイル時型チェック
- **自動型生成**: データ構造から型定義の自動生成

### 3. 3層アーキテクチャ

<lov-mermaid>
graph TB
    subgraph "データ層 (Data Layer)"
        YC[YAML設定]
        MC[Markdownコンテンツ]
        DB[Supabase DB]
    end
    
    subgraph "サービス層 (Service Layer)"
        CL[Content Loader]
        AS[Access Service]
        PS[Progress Service]
        SS[Subscription Service]
    end
    
    subgraph "プレゼンテーション層 (Presentation Layer)"
        TL[Training List]
        TD[Training Detail]
        TP[Task Pages]
        PR[Progress UI]
    end
    
    YC --> CL
    MC --> CL
    DB --> AS
    DB --> PS
    DB --> SS
    
    CL --> TL
    CL --> TD
    CL --> TP
    AS --> TD
    AS --> TP
    PS --> PR
    SS --> TD
</lov-mermaid>

## 主要設計原則

### DRY (Don't Repeat Yourself)
- 設定の一元管理
- 再利用可能なコンポーネント設計
- 共通処理の抽象化

### 単一責任の原則
- 各モジュールは単一の責任のみ
- 疎結合・高凝集な設計
- テスタブルな構造

### 型安全性
- ランタイムエラーの最小化
- エディタ支援の最大化
- リファクタリングの安全性

## ディレクトリ構造

```
src/
├── services/
│   ├── content/           # コンテンツ管理
│   ├── subscription/      # サブスクリプション管理
│   └── progress/          # 進捗管理
├── types/
│   ├── content.ts         # コンテンツ型定義
│   ├── subscription.ts    # サブスクリプション型定義
│   └── progress.ts        # 進捗型定義
├── schemas/
│   ├── training.ts        # Zodスキーマ
│   └── validation.ts      # バリデーション関数
└── utils/
    ├── loaders.ts         # データローダー
    └── parsers.ts         # パーサー関数

content/
├── config/
│   ├── trainings.yml      # トレーニング設定
│   ├── skills.yml         # スキル定義
│   └── categories.yml     # カテゴリ定義
└── training/
    ├── [slug]/
    │   ├── meta.yml       # トレーニングメタデータ
    │   ├── content.md     # 説明コンテンツ
    │   └── tasks/
    │       ├── tasks.yml  # タスク設定
    │       └── [task]/
    │           └── content.md
```

## 関連ドキュメント

1. [データ構造設計](./data-structure.md)
2. [型定義とスキーマ](./type-definitions.md)
3. [コンテンツアーキテクチャ](./content-architecture.md)
4. [サブスクリプション・アクセス制御](./subscription-access.md)
5. [ユーザー進捗管理](./user-progress.md)
6. [実装フェーズ計画](./implementation-phases.md)
7. [現システムとの比較](./benefits-comparison.md)

## 次のステップ

1. **Phase 1**: 型定義・データローダー・バリデーション (1週間)
2. **Phase 2**: アクセス制御・プログレス管理システム (1-2週間)  
3. **Phase 3**: UI実装・パフォーマンス最適化 (1週間)

詳細は [実装フェーズ計画](./implementation-phases.md) を参照してください。