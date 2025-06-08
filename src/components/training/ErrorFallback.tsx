
import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  title?: string;
  description?: string;
}

/**
 * エラー表示用フォールバックコンポーネント
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  onGoHome,
  className,
  title = 'エラーが発生しました',
  description
}) => {
  const errorMessage = error?.message || description || '予期しないエラーが発生しました';

  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-[400px] p-8 text-center',
      className
    )}>
      <div className="p-4 rounded-full bg-red-100 mb-6">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h2>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {errorMessage}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            再試行
          </button>
        )}
        
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Home className="h-4 w-4" />
            ホームに戻る
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
