
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // ローディング中はローディングインジケータを表示
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ユーザーがログインしていない場合、ログインページにリダイレクト
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // ユーザーがログインしている場合、子コンポーネントをレンダリング
  return <>{children}</>;
};

export default PrivateRoute;
