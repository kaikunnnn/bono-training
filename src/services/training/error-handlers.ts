
import { 
  TrainingError, 
  AuthError, 
  ForbiddenError, 
  NotFoundError, 
  NetworkError,
  createErrorFromCode 
} from "@/utils/errors";

// Type guard for error objects
function isErrorWithContext(error: unknown): error is { context: { body: { error: { code: string; message: string } } } } {
  return error !== null && 
         typeof error === 'object' && 
         'context' in error && 
         typeof (error as any).context === 'object' &&
         (error as any).context?.body?.error;
}

function isErrorWithDirectError(error: unknown): error is { error: { code: string; message: string } } {
  return error !== null && 
         typeof error === 'object' && 
         'error' in error && 
         typeof (error as any).error === 'object';
}

function isErrorWithStatus(error: unknown): error is { status?: number; statusCode?: number; message?: string } {
  return error !== null && 
         typeof error === 'object' && 
         ('status' in error || 'statusCode' in error);
}

/**
 * Edge Function レスポンスのエラーハンドリング（強化版）
 */
export function handleEdgeFunctionError(error: unknown, fallbackMessage: string): never {
  console.error('Edge Function エラー詳細:', {
    error,
    errorType: typeof error,
    errorName: error instanceof Error ? error.name : undefined,
    errorMessage: error instanceof Error ? error.message : String(error),
    errorStack: error instanceof Error ? error.stack : undefined,
    errorContext: error && typeof error === 'object' && 'context' in error ? (error as any).context : undefined
  });
  
  // ネットワークエラーの判定（より厳密に）
  if (!error) {
    throw new NetworkError('不明なネットワークエラーが発生しました');
  }
  
  if (error instanceof Error && (error.name === 'TypeError' || error.name === 'NetworkError')) {
    throw new NetworkError('ネットワーク接続エラーが発生しました。インターネット接続を確認してください。');
  }
  
  if (error instanceof Error && error.message && (
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed') ||
    error.message.includes('net::ERR_')
  )) {
    throw new NetworkError('ネットワーク接続エラーが発生しました。インターネット接続を確認してください。');
  }
  
  // Supabase Functions の構造化エラー（複数パターンに対応）
  if (isErrorWithContext(error)) {
    const errorData = error.context.body.error;
    const customError = createErrorFromCode(errorData.code, errorData.message);
    throw customError;
  }
  
  // 直接的なエラーレスポンス
  if (isErrorWithDirectError(error)) {
    const errorData = error.error;
    if (errorData.code && errorData.message) {
      const customError = createErrorFromCode(errorData.code, errorData.message);
      throw customError;
    }
  }
  
  // HTTP ステータスコードベースの判定
  if (isErrorWithStatus(error)) {
    const statusCode = error.status || error.statusCode;
    switch (statusCode) {
      case 401:
        throw new AuthError(error.message || 'ログインが必要です');
      case 403:
        throw new ForbiddenError(error.message || 'このコンテンツにアクセスする権限がありません');
      case 404:
        throw new NotFoundError(error.message || 'コンテンツが見つかりませんでした');
      case 500:
      case 502:
      case 503:
      case 504:
        throw new TrainingError(error.message || 'サーバーエラーが発生しました', 'SERVER_ERROR', statusCode);
    }
  }

  // Edge Function特有の404エラーパターンを追加検出
  if (error instanceof Error && error.message && error.message.includes('Edge Function returned a non-2xx status code')) {
    // ログからFunctionsHttpErrorで404を判定
    console.log('Edge Function 404エラーを検出しています');
    throw new NotFoundError('タスクが見つかりませんでした');
  }
  
  // 汎用的なエラーメッセージでフォールバック
  throw new TrainingError(fallbackMessage, 'UNKNOWN_ERROR');
}

/**
 * Edge Function レスポンスの検証（強化版）
 */
export function validateEdgeFunctionResponse(data: unknown, context: string): unknown {
  console.log('validateEdgeFunctionResponse 開始:', {
    context,
    hasData: !!data,
    dataType: typeof data,
    dataKeys: data && typeof data === 'object' ? Object.keys(data) : []
  });

  if (!data) {
    throw new TrainingError(`${context}のレスポンスが空です`, 'EMPTY_RESPONSE');
  }
  
  if (typeof data !== 'object') {
    throw new TrainingError(`${context}のレスポンス形式が不正です`, 'INVALID_RESPONSE');
  }
  
  // エラーレスポンスの検証
  if (data.success === false) {
    if (data.error && typeof data.error === 'object') {
      const customError = createErrorFromCode(data.error.code || 'UNKNOWN_ERROR', data.error.message);
      throw customError;
    } else {
      throw new TrainingError(data.message || `${context}でエラーが発生しました`, 'API_ERROR');
    }
  }
  
  // 成功レスポンスの検証
  if (data.success !== true && !data.data) {
    throw new TrainingError(data.message || `${context}のデータ取得に失敗しました`, 'INVALID_RESPONSE');
  }
  
  const responseData = data.data || data;
  
  console.log('validateEdgeFunctionResponse 完了:', {
    context,
    success: data.success,
    hasResponseData: !!responseData,
    responseDataType: typeof responseData
  });
  
  return responseData;
}
