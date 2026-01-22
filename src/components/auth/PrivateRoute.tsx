
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ユーザーがログインしていない場合、ログインページにリダイレクト
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ユーザーがログインしている場合、子コンポーネントをレンダリング
  return <>{children}</>;
};

export default PrivateRoute;
