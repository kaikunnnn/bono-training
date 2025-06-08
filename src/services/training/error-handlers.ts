
import { 
  TrainingError, 
  AuthError, 
  ForbiddenError, 
  NotFoundError, 
  NetworkError,
  createErrorFromCode 
} from "@/utils/errors";

/**
 * Edge Function レスポンスのエラーハンドリング
 */
export function handleEdgeFunctionError(error: any, fallbackMessage: string): never {
  console.error('Edge Function エラー詳細:', error);
  
  // ネットワークエラーの判定
  if (!error || error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
    throw new NetworkError('ネットワーク接続エラーが発生しました。インターネット接続を確認してください。');
  }
  
  // Supabase Functions の構造化エラー
  if (error.context?.body?.error) {
    const errorData = error.context.body.error;
    const customError = createErrorFromCode(errorData.code, errorData.message);
    throw customError;
  }
  
  // 汎用的なエラーメッセージでフォールバック
  throw new TrainingError(fallbackMessage, 'UNKNOWN_ERROR');
}

/**
 * Edge Function レスポンスの検証
 */
export function validateEdgeFunctionResponse(data: any, context: string): any {
  if (!data) {
    throw new TrainingError(`${context}のレスポンスが空です`, 'EMPTY_RESPONSE');
  }
  
  if (data.success === false && data.error) {
    const customError = createErrorFromCode(data.error.code, data.error.message);
    throw customError;
  }
  
  if (!data.success || !data.data) {
    throw new TrainingError(data.message || `${context}のデータ取得に失敗しました`, 'INVALID_RESPONSE');
  }
  
  return data.data;
}
