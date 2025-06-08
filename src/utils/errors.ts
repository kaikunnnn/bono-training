
/**
 * トレーニングコンテンツ関連のカスタムエラークラス
 */

export class TrainingError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'TrainingError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class AuthError extends TrainingError {
  constructor(message: string = 'ログインが必要です') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends TrainingError {
  constructor(message: string = 'このコンテンツにアクセスする権限がありません') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends TrainingError {
  constructor(message: string = 'コンテンツが見つかりませんでした') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends TrainingError {
  constructor(message: string = 'ネットワークエラーが発生しました') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

/**
 * エラーコードからカスタムエラーを生成
 */
export function createErrorFromCode(code: string, message?: string): TrainingError {
  switch (code) {
    case 'UNAUTHORIZED':
      return new AuthError(message);
    case 'FORBIDDEN':
      return new ForbiddenError(message);
    case 'NOT_FOUND':
      return new NotFoundError(message);
    case 'NETWORK_ERROR':
      return new NetworkError(message);
    default:
      return new TrainingError(message || 'エラーが発生しました', code);
  }
}
