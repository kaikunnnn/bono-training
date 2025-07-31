# 📊 [緊急度：低] 監視・ログ強化

## 問題の詳細

### 現象
- Edge Function `get-training-list` のログが不十分で問題特定が困難
- エラー発生時の詳細情報が不足
- パフォーマンス監視ができていない
- 運用時の問題発見・対応が困難

### 現在のログ状況
```javascript
// 現在のログ出力（限定的）
console.log('[DEBUG] トレーニング一覧取得リクエスト受信');
console.log('[DEBUG] 取得したファイル一覧:', files);
console.log('[DEBUG] パースされたトレーニング一覧:', trainings);
```

### 影響範囲
- 問題発生時の対応速度
- システムの安定性監視
- パフォーマンス最適化の阻害
- 運用コストの増加

## 調査手順

### 1. 現在のログ出力状況調査
```bash
# Supabase Analytics での確認
- Edge Function のログレベル
- エラーログの詳細度
- パフォーマンス情報の有無
```

### 2. 他のEdge Functionとの比較
```bash
# 他の関数のログ出力状況
- get-training-detail
- get-training-content
- check-subscription
```

### 3. 監視要件の整理
- **エラー監視**: 各段階でのエラー詳細
- **パフォーマンス監視**: レスポンス時間、処理時間
- **利用状況監視**: リクエスト数、成功率
- **データ品質監視**: 取得データの整合性

## 解決策の実装内容

### A. 構造化ログの実装

#### ログレベル定義
```typescript
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO', 
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  function: string;
  operation: string;
  message: string;
  data?: any;
  duration?: number;
  traceId?: string;
}
```

#### 構造化ログ関数
```typescript
class Logger {
  private traceId: string;
  
  constructor(functionName: string) {
    this.traceId = crypto.randomUUID();
  }
  
  debug(operation: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, operation, message, data);
  }
  
  info(operation: string, message: string, data?: any) {
    this.log(LogLevel.INFO, operation, message, data);
  }
  
  warn(operation: string, message: string, data?: any) {
    this.log(LogLevel.WARN, operation, message, data);
  }
  
  error(operation: string, message: string, error?: any) {
    this.log(LogLevel.ERROR, operation, message, {
      error: error?.message,
      stack: error?.stack,
      code: error?.code
    });
  }
  
  private log(level: LogLevel, operation: string, message: string, data?: any) {
    const logEntry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      function: 'get-training-list',
      operation,
      message,
      data,
      traceId: this.traceId
    };
    
    console.log(JSON.stringify(logEntry));
  }
}
```

### B. パフォーマンス監視

#### 処理時間計測
```typescript
class PerformanceMonitor {
  private operations: Map<string, number> = new Map();
  
  start(operation: string): void {
    this.operations.set(operation, performance.now());
  }
  
  end(operation: string, logger: Logger): number {
    const startTime = this.operations.get(operation);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.operations.delete(operation);
    
    logger.info('performance', `${operation} completed`, { 
      duration: Math.round(duration),
      unit: 'ms'
    });
    
    return duration;
  }
}
```

#### 使用例
```typescript
const logger = new Logger('get-training-list');
const monitor = new PerformanceMonitor();

// リクエスト開始
logger.info('request', 'Training list request received', {
  method: req.method,
  headers: Object.fromEntries(req.headers.entries())
});

monitor.start('total_request');

// Storage アクセス
monitor.start('storage_list');
const { data: files, error: listError } = await supabaseAdmin.storage
  .from('training-content')
  .list('', { limit: 100 });
monitor.end('storage_list', logger);

if (listError) {
  logger.error('storage_access', 'Failed to list files', listError);
  return createErrorResponse(500, 'STORAGE_LIST_ERROR', 'ファイル一覧の取得に失敗', listError);
}

logger.info('storage_access', 'Successfully retrieved file list', { 
  fileCount: files?.length || 0 
});
```

### C. エラーハンドリング強化

#### 詳細エラー情報
```typescript
interface DetailedError {
  code: string;
  message: string;
  statusCode: number;
  operation: string;
  timestamp: string;
  traceId: string;
  context?: any;
  retryable?: boolean;
}

function createDetailedErrorResponse(
  logger: Logger,
  statusCode: number, 
  code: string, 
  message: string, 
  operation: string,
  context?: any
): Response {
  const errorDetails: DetailedError = {
    code,
    message,
    statusCode,
    operation,
    timestamp: new Date().toISOString(),
    traceId: logger.getTraceId(),
    context,
    retryable: statusCode >= 500
  };
  
  logger.error(operation, message, errorDetails);
  
  return new Response(
    JSON.stringify({ 
      success: false,
      error: errorDetails
    }),
    { 
      status: statusCode, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
```

### D. データ品質監視

#### フロントマター検証
```typescript
function validateTrainingFrontmatter(frontmatter: any, fileName: string, logger: Logger): boolean {
  const requiredFields = ['title', 'description', 'type'];
  const missingFields = requiredFields.filter(field => !frontmatter[field]);
  
  if (missingFields.length > 0) {
    logger.warn('data_quality', 'Missing required frontmatter fields', {
      fileName,
      missingFields,
      frontmatter
    });
    return false;
  }
  
  if (!['challenge', 'skill', 'portfolio'].includes(frontmatter.type)) {
    logger.warn('data_quality', 'Invalid training type', {
      fileName,
      type: frontmatter.type,
      validTypes: ['challenge', 'skill', 'portfolio']
    });
  }
  
  logger.debug('data_quality', 'Frontmatter validation passed', {
    fileName,
    fields: Object.keys(frontmatter)
  });
  
  return true;
}
```

### E. アラート・通知機能

#### 重要エラーの通知
```typescript
async function sendAlert(level: 'critical' | 'warning', message: string, details: any) {
  // Slack通知（将来実装）
  // Webhook URL は Supabase Secrets で管理
  
  if (level === 'critical') {
    console.error('🚨 CRITICAL ALERT:', message, details);
  } else {
    console.warn('⚠️ WARNING ALERT:', message, details);
  }
}
```

## テスト方法

### 1. ログ出力テスト
```bash
# Edge Function 呼び出し後のログ確認
curl -X POST "https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/get-training-list" \
  -H "Authorization: Bearer [ANON_KEY]"

# Supabase Analytics でログ確認
# - 構造化ログが出力されているか
# - パフォーマンス情報が記録されているか
# - エラー詳細が適切に出力されているか
```

### 2. エラーシナリオテスト
```typescript
// 意図的にエラーを発生させてログ確認
// - Storage権限エラー
// - ファイル読み込みエラー  
// - フロントマターパースエラー
```

### 3. パフォーマンステスト
```bash
# 複数回連続実行してレスポンス時間確認
for i in {1..5}; do
  time curl -X POST "https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/get-training-list"
done
```

### 4. ログ検索・分析テスト
```sql
-- Supabase Analytics での検索
SELECT * FROM function_edge_logs 
WHERE event_message LIKE '%get-training-list%'
ORDER BY timestamp DESC 
LIMIT 50;
```

## 完了基準

- [ ] 構造化ログが実装され、適切に出力される
- [ ] パフォーマンス監視が動作し、処理時間が記録される
- [ ] エラー発生時に詳細情報がログに記録される
- [ ] データ品質チェックが実装され、警告が出力される
- [ ] トレースIDによるリクエスト追跡が可能
- [ ] ログレベルによる出力制御が動作する
- [ ] 重要エラー時のアラート機能が動作する

## 関連ファイル

### 直接修正対象
- `supabase/functions/get-training-list/index.ts`

### 新規作成
- `supabase/functions/_shared/logger.ts`
- `supabase/functions/_shared/performance-monitor.ts`
- `supabase/functions/_shared/error-handler.ts`

### 将来的適用対象
- `supabase/functions/get-training-detail/index.ts`
- `supabase/functions/get-training-content/index.ts`
- その他のEdge Functions

## 技術的詳細

### ログ構造設計
```json
{
  "level": "INFO",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "function": "get-training-list",
  "operation": "storage_access",
  "message": "Successfully retrieved file list",
  "data": {
    "fileCount": 4,
    "files": ["ec-product-catalog", "info-odai-book-rental", "todo-app", "ux-basics"]
  },
  "duration": 150,
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### パフォーマンス指標
- **レスポンス時間**: 95%ile < 2000ms
- **Storage アクセス時間**: 平均 < 500ms
- **ファイル解析時間**: ファイル数 * 100ms以下
- **成功率**: > 99%

### エラー分類
- **4xx Error**: クライアント側問題（認証、権限など）
- **5xx Error**: サーバー側問題（Storage、解析エラーなど）
- **Timeout**: レスポンス時間超過
- **Data Quality**: フロントマター問題

### 将来的な拡張
- **分散トレーシング**: OpenTelemetry対応
- **メトリクス収集**: Prometheus/Grafana連携
- **外部アラート**: PagerDuty、Slack連携
- **ログ集約**: ELKスタック、Datadog連携

### セキュリティ考慮事項
- ログに機密情報（APIキー、個人情報）を含めない
- 適切なログレベル設定
- ログ保持期間の管理

## 優先度・緊急度
**緊急度：低** - 機能は動作しているが、運用・保守性向上のための重要な改善