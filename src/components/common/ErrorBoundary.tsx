
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, LogIn, FileX } from 'lucide-react';
import { AuthError, ForbiddenError, NotFoundError, NetworkError, TrainingError } from '@/utils/errors';
import { useNavigate } from 'react-router-dom';

interface ErrorDisplayProps {
  error: Error | TrainingError;
  onRetry?: () => void;
  onReset?: () => void;
}

const LoginPrompt: React.FC<{ onReset?: () => void }> = ({ onReset }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <LogIn className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>ログインが必要です</CardTitle>
        <CardDescription>
          このコンテンツを表示するには、ログインしてください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={() => navigate('/login')}
          className="w-full"
        >
          ログインページへ
        </Button>
        {onReset && (
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="w-full"
          >
            戻る
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const ForbiddenMessage: React.FC<{ onReset?: () => void }> = ({ onReset }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
        </div>
        <CardTitle>アクセス権限がありません</CardTitle>
        <CardDescription>
          このコンテンツは有料プランでのみご利用いただけます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={() => navigate('/subscription')} 
          className="w-full"
        >
          プランを確認する
        </Button>
        {onReset && (
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="w-full"
          >
            戻る
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const NotFoundMessage: React.FC<{ onRetry?: () => void; onReset?: () => void }> = ({ onRetry, onReset }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileX className="w-6 h-6 text-gray-600" />
        </div>
        <CardTitle>コンテンツが見つかりません</CardTitle>
        <CardDescription>
          お探しのコンテンツは存在しないか、移動された可能性があります
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            もう一度試す
          </Button>
        )}
        <Button 
          onClick={() => navigate('/training')} 
          className="w-full"
        >
          トレーニング一覧に戻る
        </Button>
        {onReset && (
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="w-full"
          >
            戻る
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const RetryErrorMessage: React.FC<{ error: TrainingError; onRetry?: () => void; onReset?: () => void }> = ({ 
  error, 
  onRetry, 
  onReset 
}) => {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle>エラーが発生しました</CardTitle>
        <CardDescription>
          {error.message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {onRetry && (
          <Button 
            onClick={onRetry} 
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            もう一度試す
          </Button>
        )}
        {onReset && (
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="w-full"
          >
            戻る
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, onReset }) => {
  if (error instanceof AuthError) {
    return <LoginPrompt onReset={onReset} />;
  }
  
  if (error instanceof ForbiddenError) {
    return <ForbiddenMessage onReset={onReset} />;
  }
  
  if (error instanceof NotFoundError) {
    return <NotFoundMessage onRetry={onRetry} onReset={onReset} />;
  }
  
  if (error instanceof NetworkError) {
    return (
      <RetryErrorMessage 
        error={error} 
        onRetry={onRetry} 
        onReset={onReset} 
      />
    );
  }
  
  if (error instanceof TrainingError) {
    return (
      <RetryErrorMessage 
        error={error} 
        onRetry={onRetry} 
        onReset={onReset} 
      />
    );
  }
  
  // 汎用エラー表示
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle>予期しないエラー</CardTitle>
        <CardDescription>
          {error.message || '不明なエラーが発生しました'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {onRetry && (
          <Button 
            onClick={onRetry} 
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            もう一度試す
          </Button>
        )}
        {onReset && (
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="w-full"
          >
            戻る
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;
