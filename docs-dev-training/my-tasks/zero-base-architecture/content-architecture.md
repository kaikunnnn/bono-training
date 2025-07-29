# コンテンツアーキテクチャ設計

## 基本原則

### 1. コンテンツとメタデータの完全分離
```
メタデータ (YAML) + 純粋コンテンツ (Markdown)
```

### 2. 階層化されたコンテンツ管理
```
Config → Training → Task → Content
```

### 3. 条件付きコンテンツ配信
- アクセス権限に基づく配信
- プレビュー・フルコンテンツの切り替え
- 動的コンテンツ生成

## アーキテクチャ概要

<lov-mermaid>
graph TB
    subgraph "設定レイヤー"
        GC[グローバル設定]
        SC[スキル設定]
        CC[カテゴリ設定]
    end
    
    subgraph "コンテンツレイヤー"
        TM[トレーニングメタ]
        TC[トレーニングコンテンツ]
        TaskM[タスクメタ]
        TaskC[タスクコンテンツ]
    end
    
    subgraph "処理レイヤー"
        CL[ConfigLoader]
        TL[TrainingLoader]
        TkL[TaskLoader]
        CP[ContentProcessor]
    end
    
    subgraph "サービスレイヤー"
        CS[ContentService]
        AS[AccessService]
        RS[RenderingService]
    end
    
    subgraph "プレゼンテーションレイヤー"
        TG[TrainingGrid]
        TD[TrainingDetail]
        TP[TaskPage]
    end
    
    GC --> CL
    SC --> CL
    CC --> CL
    
    TM --> TL
    TC --> TL
    TaskM --> TkL
    TaskC --> TkL
    
    CL --> CS
    TL --> CS
    TkL --> CS
    
    CS --> AS
    AS --> RS
    CS --> CP
    
    RS --> TG
    RS --> TD
    RS --> TP
</lov-mermaid>

## コンテンツサービス設計

### src/services/content/ContentService.ts
```typescript
import { ConfigLoader, TrainingLoader, TaskLoader } from '@/utils/loaders';
import { AccessService } from '@/services/subscription/AccessService';
import { ContentProcessor } from './ContentProcessor';
import type { TrainingMeta, TaskMeta } from '@/schemas/training';
import type { UserPlan } from '@/types/subscription';

export class ContentService {
  private configLoader = ConfigLoader.getInstance();
  private trainingLoader = new TrainingLoader();
  private taskLoader = new TaskLoader();
  private accessService = new AccessService();
  private contentProcessor = new ContentProcessor();

  /**
   * 全トレーニング一覧取得
   */
  async getTrainings(userPlan?: UserPlan): Promise<TrainingListItem[]> {
    const config = await this.configLoader.loadConfig();
    
    return config.trainings.map(training => ({
      ...training,
      isAccessible: this.accessService.hasAccess(userPlan, training.access_level),
      isPremium: training.has_premium_content && training.access_level !== 'free',
    }));
  }

  /**
   * トレーニング詳細取得
   */
  async getTrainingDetail(
    slug: string, 
    userPlan?: UserPlan
  ): Promise<TrainingDetail> {
    const [{ meta, content }, tasks] = await Promise.all([
      this.trainingLoader.loadTraining(slug),
      this.taskLoader.loadTasks(slug)
    ]);

    // アクセス制御を適用
    const accessibleTasks = this.applyTaskAccessControl(tasks, userPlan);
    
    // コンテンツを処理
    const processedContent = await this.contentProcessor.processTrainingContent(
      content, 
      userPlan
    );

    return {
      ...meta,
      content: processedContent,
      tasks: accessibleTasks,
      hasAccess: this.accessService.hasAccess(userPlan, meta.access_level),
    };
  }

  /**
   * タスク詳細取得
   */
  async getTaskDetail(
    trainingSlug: string, 
    taskSlug: string, 
    userPlan?: UserPlan
  ): Promise<TaskDetail> {
    const [tasks, content] = await Promise.all([
      this.taskLoader.loadTasks(trainingSlug),
      this.taskLoader.loadTaskContent(trainingSlug, taskSlug)
    ]);

    const task = tasks.find(t => t.slug === taskSlug);
    if (!task) {
      throw new Error(`Task not found: ${taskSlug}`);
    }

    // アクセス制御チェック
    const hasAccess = this.accessService.hasAccess(userPlan, task.access_level);
    
    // コンテンツ処理
    const processedContent = await this.contentProcessor.processTaskContent(
      content, 
      task, 
      userPlan
    );

    return {
      ...task,
      content: processedContent,
      hasAccess,
      navigation: this.buildTaskNavigation(tasks, taskSlug),
    };
  }

  /**
   * タスクアクセス制御適用
   */
  private applyTaskAccessControl(tasks: TaskMeta[], userPlan?: UserPlan): TaskListItem[] {
    return tasks.map(task => ({
      ...task,
      isAccessible: this.accessService.hasAccess(userPlan, task.access_level),
      isLocked: !this.checkUnlockCondition(task, userPlan),
      isPremium: task.access_level !== 'free',
    }));
  }

  /**
   * アンロック条件チェック
   */
  private checkUnlockCondition(task: TaskMeta, userPlan?: UserPlan): boolean {
    if (!task.unlock_condition) return true;
    
    switch (task.unlock_condition.type) {
      case 'sequential':
        // 前のタスクが完了しているかチェック
        return this.checkSequentialUnlock(task, userPlan);
      
      case 'skill_based':
        // 必要スキルを持っているかチェック
        return this.checkSkillBasedUnlock(task, userPlan);
      
      default:
        return true;
    }
  }

  /**
   * タスクナビゲーション構築
   */
  private buildTaskNavigation(tasks: TaskMeta[], currentSlug: string): TaskNavigation {
    const sortedTasks = tasks.sort((a, b) => a.order - b.order);
    const currentIndex = sortedTasks.findIndex(t => t.slug === currentSlug);
    
    return {
      current: currentIndex + 1,
      total: sortedTasks.length,
      prev: currentIndex > 0 ? sortedTasks[currentIndex - 1] : null,
      next: currentIndex < sortedTasks.length - 1 ? sortedTasks[currentIndex + 1] : null,
    };
  }
}
```

## コンテンツプロセッサー設計

### src/services/content/ContentProcessor.ts
```typescript
import { marked } from 'marked';
import { AccessService } from '@/services/subscription/AccessService';
import type { TaskMeta } from '@/schemas/training';
import type { UserPlan } from '@/types/subscription';

export class ContentProcessor {
  private accessService = new AccessService();

  /**
   * トレーニングコンテンツ処理
   */
  async processTrainingContent(content: string, userPlan?: UserPlan): Promise<string> {
    // Markdownを処理
    let processedContent = await this.processMarkdown(content);
    
    // プレミアムセクションの処理
    processedContent = this.processPremiumSections(processedContent, userPlan);
    
    return processedContent;
  }

  /**
   * タスクコンテンツ処理
   */
  async processTaskContent(
    content: string, 
    task: TaskMeta, 
    userPlan?: UserPlan
  ): Promise<ProcessedTaskContent> {
    const hasAccess = this.accessService.hasAccess(userPlan, task.access_level);
    
    if (!hasAccess) {
      return {
        content: await this.generatePreviewContent(content),
        hasAccess: false,
        showPremiumBanner: true,
        fullContentAvailable: false,
      };
    }

    return {
      content: await this.processMarkdown(content),
      hasAccess: true,
      showPremiumBanner: false,
      fullContentAvailable: true,
    };
  }

  /**
   * Markdown処理
   */
  private async processMarkdown(content: string): Promise<string> {
    // カスタムレンダラー設定
    const renderer = new marked.Renderer();
    
    // カスタムコンポーネント処理
    renderer.code = this.processCodeBlocks.bind(this);
    renderer.blockquote = this.processCallouts.bind(this);
    
    return marked(content, { renderer });
  }

  /**
   * プレミアムセクション処理
   */
  private processPremiumSections(content: string, userPlan?: UserPlan): string {
    const premiumSectionRegex = /<!-- PREMIUM_START -->([\s\S]*?)<!-- PREMIUM_END -->/g;
    
    if (this.accessService.hasAccess(userPlan, 'premium')) {
      // プレミアムユーザー: そのまま表示
      return content.replace(premiumSectionRegex, '$1');
    } else {
      // 非プレミアムユーザー: プレミアムバナーに置き換え
      return content.replace(premiumSectionRegex, this.generatePremiumBanner());
    }
  }

  /**
   * プレビューコンテンツ生成
   */
  private async generatePreviewContent(content: string): Promise<string> {
    // 最初の200文字または最初のセクションまで
    const previewLength = 200;
    const firstSectionMatch = content.match(/^(.*?\n##|\n)/s);
    
    let previewContent = firstSectionMatch 
      ? firstSectionMatch[1] 
      : content.substring(0, previewLength);
    
    if (content.length > previewLength) {
      previewContent += '\n\n' + this.generatePremiumBanner();
    }
    
    return this.processMarkdown(previewContent);
  }

  /**
   * コードブロック処理
   */
  private processCodeBlocks(code: string, language: string): string {
    // シンタックスハイライト
    // インタラクティブコード実行（必要に応じて）
    return `<pre><code class="language-${language}">${code}</code></pre>`;
  }

  /**
   * コールアウト処理
   */
  private processCallouts(quote: string): string {
    // > [!NOTE] などのGitHub式コールアウトをサポート
    const calloutMatch = quote.match(/^\[!(\w+)\]\s*(.*)/s);
    if (calloutMatch) {
      const [, type, content] = calloutMatch;
      return `<div class="callout callout-${type.toLowerCase()}">${content}</div>`;
    }
    return `<blockquote>${quote}</blockquote>`;
  }

  /**
   * プレミアムバナー生成
   */
  private generatePremiumBanner(): string {
    return `
      <div class="premium-banner">
        <h3>🎯 ここから先はプレミアムコンテンツです</h3>
        <p>より詳しい解説と実践的な内容を学習するには、プレミアムプランにアップグレードしてください。</p>
        <a href="/pricing" class="premium-cta">プレミアムプランを見る</a>
      </div>
    `;
  }
}

/**
 * 処理済みタスクコンテンツ型
 */
interface ProcessedTaskContent {
  content: string;
  hasAccess: boolean;
  showPremiumBanner: boolean;
  fullContentAvailable: boolean;
}
```

## 動的コンテンツ生成

### コンテンツテンプレート機能
```typescript
/**
 * 動的コンテンツ生成サービス
 */
export class ContentTemplateService {
  /**
   * ユーザー固有のコンテンツ生成
   */
  generatePersonalizedContent(
    template: string, 
    user: User, 
    progress: UserProgress
  ): string {
    const variables = {
      userName: user.display_name || 'あなた',
      completedTasks: progress.completed_tasks.length,
      currentLevel: this.calculateUserLevel(progress),
      recommendedNext: this.getRecommendedContent(user, progress),
    };

    return this.interpolateTemplate(template, variables);
  }

  /**
   * 条件付きコンテンツ表示
   */
  processConditionalContent(
    content: string, 
    conditions: ContentCondition[]
  ): string {
    let processedContent = content;

    conditions.forEach(condition => {
      const regex = new RegExp(
        `<!-- IF ${condition.key} -->(.*?)<!-- ENDIF -->`, 
        'gs'
      );
      
      if (condition.value) {
        processedContent = processedContent.replace(regex, '$1');
      } else {
        processedContent = processedContent.replace(regex, '');
      }
    });

    return processedContent;
  }

  /**
   * インタラクティブ要素の埋め込み
   */
  embedInteractiveElements(content: string): string {
    // チェックリスト
    content = content.replace(
      /\[ \] (.*?)$/gm, 
      '<input type="checkbox" class="task-checkbox"> $1'
    );

    // プログレスバー
    content = content.replace(
      /\[progress:(\d+)\]/g, 
      '<div class="progress-bar" data-progress="$1"></div>'
    );

    // 埋め込み動画
    content = content.replace(
      /\[video:(.*?)\]/g, 
      '<div class="video-embed" data-src="$1"></div>'
    );

    return content;
  }
}
```

## コンテンツキャッシュ戦略

### src/services/content/ContentCache.ts
```typescript
/**
 * コンテンツキャッシュサービス
 */
export class ContentCache {
  private memoryCache = new Map<string, CacheEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5分

  /**
   * キャッシュ取得
   */
  async get<T>(key: string, loader: () => Promise<T>): Promise<T> {
    // メモリキャッシュチェック
    const cached = this.memoryCache.get(key);
    if (cached && !this.isExpired(cached)) {
      return cached.data as T;
    }

    // ローダー実行
    const data = await loader();
    
    // キャッシュ保存
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  /**
   * 条件付きキャッシュクリア
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.TTL;
  }
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
}
```

## コンテンツAPIエンドポイント設計

### RESTful APIパス
```
GET /api/content/trainings
GET /api/content/trainings/:slug
GET /api/content/trainings/:trainingSlug/tasks
GET /api/content/trainings/:trainingSlug/tasks/:taskSlug
GET /api/content/search?q=...&category=...&type=...
```

### レスポンス形式の統一
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    hasMore?: boolean;
  };
}

interface ContentResponse {
  content: string;
  metadata: ContentMetadata;
  access: AccessInfo;
  navigation?: NavigationInfo;
}
```

## 利点とメリット

### 1. 開発効率の向上
- フロントマター解析処理の撤廃
- 型安全なデータ操作
- エラー処理の簡素化

### 2. 保守性の向上
- 設定とコンテンツの明確な分離
- 修正影響範囲の限定
- テストの書きやすさ

### 3. 拡張性の確保
- 新しいコンテンツタイプの追加が容易
- 条件付きコンテンツの柔軟な実装
- AIによる自動コンテンツ生成への対応

### 4. パフォーマンスの最適化
- 効率的なキャッシュ戦略
- 必要最小限のデータ読み込み
- レンダリング処理の最適化