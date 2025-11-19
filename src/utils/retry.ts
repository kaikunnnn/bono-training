/**
 * リトライ処理のオプション設定
 */
export interface RetryOptions {
  /** 最大リトライ回数（デフォルト: 3） */
  maxRetries?: number;
  /** 初回リトライまでの遅延時間（ミリ秒、デフォルト: 1000） */
  initialDelay?: number;
  /** 最大遅延時間（ミリ秒、デフォルト: 10000） */
  maxDelay?: number;
  /** リトライするかどうかを判定する関数 */
  shouldRetry?: (error: any) => boolean;
}

/**
 * デフォルトのリトライ判定関数
 * ネットワークエラーまたは5xxエラー、429エラーの場合のみリトライ
 */
function defaultShouldRetry(error: any): boolean {
  // ネットワークエラー（response がない場合）
  if (!error.response) {
    console.log('ネットワークエラーのためリトライします');
    return true;
  }

  const status = error.response?.status;

  // 5xx系エラー（サーバーエラー）
  if (status >= 500 && status < 600) {
    console.log(`サーバーエラー (${status}) のためリトライします`);
    return true;
  }

  // 429 Too Many Requests
  if (status === 429) {
    console.log('レート制限エラー (429) のためリトライします');
    return true;
  }

  // その他のエラーはリトライしない（4xx系など）
  console.log(`エラー (${status}) はリトライ対象外です`);
  return false;
}

/**
 * 指数バックオフを使用したリトライ処理
 *
 * @param fn 実行する非同期関数
 * @param options リトライオプション
 * @returns 関数の実行結果
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => fetch('https://api.example.com/data'),
 *   {
 *     maxRetries: 3,
 *     initialDelay: 1000
 *   }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = defaultShouldRetry
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 関数を実行
      const result = await fn();

      // 成功したらリトライログをクリア
      if (attempt > 0) {
        console.log(`リトライ成功（${attempt}回目の試行で成功）`);
      }

      return result;
    } catch (error) {
      lastError = error;

      // 最大リトライ回数に達した、またはリトライすべきでないエラーの場合
      if (attempt === maxRetries) {
        console.error(`最大リトライ回数 (${maxRetries}) に達しました`);
        throw error;
      }

      if (!shouldRetry(error)) {
        console.error('リトライ対象外のエラーです');
        throw error;
      }

      // 指数バックオフで遅延時間を計算（2^attempt * initialDelay）
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      const nextAttempt = attempt + 1;

      console.log(`リトライ ${nextAttempt}/${maxRetries} を ${delay}ms 後に実行します`);

      // 遅延
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // ここに到達することはないはずだが、型安全のため
  throw lastError;
}

/**
 * Supabase Edge Function呼び出し専用のリトライラッパー
 *
 * @param fn Supabase functions.invoke を含む関数
 * @returns 関数の実行結果
 */
export async function retrySupabaseFunction<T>(
  fn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  return retryWithBackoff(
    async () => {
      const result = await fn();

      // Supabase Edge Functionのエラーハンドリング
      if (result.error) {
        // エラーをthrowしてリトライ対象にする
        const error: any = new Error(result.error.message || 'Supabase function error');
        error.response = { status: result.error.status || 500 };
        throw error;
      }

      return result;
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000
    }
  );
}
