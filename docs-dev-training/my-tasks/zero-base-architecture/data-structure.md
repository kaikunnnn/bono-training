# データ構造設計

## 基本方針

### 構造化データとコンテンツの分離

```
設定・メタデータ (YAML/JSON) + 純粋コンテンツ (Markdown)
```

この分離により、以下の利点を実現：
- AIによる理解・修正の容易性
- 設定変更時の影響範囲限定
- コンテンツ更新の安全性

## ファイル構造

### 1. 設定ファイル群

```
content/
├── config/
│   ├── trainings.yml      # 全トレーニング一覧
│   ├── skills.yml         # スキル定義
│   ├── categories.yml     # カテゴリ定義
│   └── difficulty.yml     # 難易度定義
```

### 2. トレーニング個別データ

```
content/training/[slug]/
├── meta.yml               # トレーニングメタデータ
├── content.md             # 説明コンテンツ（フロントマター無し）
└── tasks/
    ├── tasks.yml          # タスク設定
    └── [task-slug]/
        └── content.md     # タスクコンテンツ（フロントマター無し）
```

## 具体的な設定ファイル

### trainings.yml
```yaml
# 全トレーニングの一覧と基本設定
trainings:
  - slug: "todo-app"
    title: "ToDoアプリのUI設計"
    type: "challenge"
    category: "ui-design"
    difficulty: "beginner"
    tags: ["ui", "figma", "design-system"]
    estimated_total_time: "3-4時間"
    has_premium_content: true
    skills:
      - "design-system"
      - "component-design"
      - "user-flow"
    prerequisites:
      - "figma-basics"
    
  - slug: "ux-basics"
    title: "UX設計の基礎"
    type: "skill"
    category: "ux-design"
    difficulty: "beginner"
    tags: ["ux", "research", "user-journey"]
    estimated_total_time: "2-3時間"
    has_premium_content: false
```

### skills.yml
```yaml
# スキル定義
skills:
  design-system:
    name: "デザインシステム構築"
    description: "一貫性のあるデザインシステムを作る力"
    category: "ui-design"
    level: "intermediate"
    
  component-design:
    name: "コンポーネント設計"
    description: "再利用可能なUIコンポーネントを設計する力"
    category: "ui-design" 
    level: "beginner"
    
  user-flow:
    name: "ユーザーフロー設計"
    description: "ユーザーの行動導線を設計する力"
    category: "ux-design"
    level: "intermediate"
```

### categories.yml
```yaml
# カテゴリ定義
categories:
  ui-design:
    name: "UI設計"
    description: "ユーザーインターフェースの視覚的設計"
    color: "#3B82F6"
    icon: "palette"
    
  ux-design:
    name: "UX設計"
    description: "ユーザーエクスペリエンスの設計"
    color: "#10B981"
    icon: "users"
    
  figma:
    name: "Figma"
    description: "Figmaツールの操作と活用"
    color: "#F59E0B"
    icon: "figma"
```

### training/[slug]/meta.yml
```yaml
# 個別トレーニングのメタデータ
training:
  slug: "todo-app"
  title: "ToDoアプリのUI設計チャレンジ"
  description: "実際のToDoアプリを想定したUI設計を通じて、デザインシステムとコンポーネント設計を学びます"
  type: "challenge"
  difficulty: "beginner"
  estimated_total_time: "3-4時間"
  
# サムネイル・アイコン設定
assets:
  thumbnail: "todo-app-thumbnail.jpg"
  icon: "check-circle"
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"

# 学習目標
learning_objectives:
  - "デザインシステムの基本概念を理解する"
  - "再利用可能なコンポーネントを設計できる"
  - "ユーザビリティを考慮したUIを作成できる"

# スキル・前提条件
skills:
  - "design-system"
  - "component-design"
  - "user-flow"
  
prerequisites:
  - "figma-basics"

# アクセス制御
access:
  is_premium: false
  member_only_tasks: ["advanced-interactions", "responsive-design"]
```

### training/[slug]/tasks/tasks.yml
```yaml
# タスク設定
tasks:
  - slug: "introduction"
    title: "チャレンジの概要"
    order: 1
    type: "introduction"
    estimated_time: "10分"
    is_premium: false
    
  - slug: "research-analysis"
    title: "既存アプリの分析"
    order: 2
    type: "research"
    estimated_time: "30分"
    is_premium: false
    description: "人気のToDoアプリを調査し、UI패턴を分析します"
    
  - slug: "component-design"
    title: "基本コンポーネント設計"
    order: 3
    type: "design"
    estimated_time: "60分"
    is_premium: true
    description: "ボタン、入力フィールドなどの基本コンポーネントを設計"
    
  - slug: "advanced-interactions"
    title: "インタラクション設計"
    order: 4
    type: "design"
    estimated_time: "45分"
    is_premium: true
    description: "ドラッグ&ドロップなどのアドバンスド機能を設計"

# ナビゲーション設定
navigation:
  show_progress: true
  allow_skip: false
  unlock_condition: "sequential" # sequential | all | custom
```

## データフロー

<lov-mermaid>
graph TD
    subgraph "設定ファイル"
        TC[trainings.yml]
        SC[skills.yml]
        CC[categories.yml]
    end
    
    subgraph "個別トレーニング"
        TM[meta.yml]
        TCont[content.md]
        TK[tasks.yml]
        TaskMD[task/content.md]
    end
    
    subgraph "ローダー"
        CL[ConfigLoader]
        TL[TrainingLoader]
        TaskL[TaskLoader]
    end
    
    subgraph "型安全データ"
        TD[TrainingData]
        TaskD[TaskData]
        MD[MetaData]
    end
    
    TC --> CL
    SC --> CL
    CC --> CL
    
    TM --> TL
    TCont --> TL
    
    TK --> TaskL
    TaskMD --> TaskL
    
    CL --> MD
    TL --> TD
    TaskL --> TaskD
</lov-mermaid>

## 利点

### 1. 保守性の向上
- 設定変更時の影響範囲が明確
- コンテンツ更新時のバグリスク最小化
- 新しいトレーニング追加の簡易化

### 2. 型安全性
- 設定ミスの実行時検出
- エディタ支援による開発効率向上
- リファクタリング時の安全性

### 3. 拡張性
- 新しいフィールドの追加が容易
- カテゴリ・スキルの動的追加
- 複雑な条件分岐の実装可能

### 4. AI フレンドリー
- 構造化データによる理解の容易性
- 修正時の影響範囲の明確化
- 自動化ツールとの親和性