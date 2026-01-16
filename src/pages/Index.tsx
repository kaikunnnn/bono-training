import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ログイン済み → マイページ
  if (user) {
    return <Navigate to="/mypage" replace />;
  }

  // 未ログイン → ログインページ
  return <Navigate to="/auth" replace />;
};

export default Index;
