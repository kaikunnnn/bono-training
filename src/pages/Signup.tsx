import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { RegistrationFlowGuide } from '@/components/auth/RegistrationFlowGuide';

const Signup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 既にログインしている場合はホームにリダイレクト
  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-10">
        {/* ページタイトル */}
        <h1 className="text-2xl font-bold mb-6 font-noto-sans-jp">
          新規登録
        </h1>

        <RegistrationFlowGuide variant="page" />

        {/* ログインへの導線 */}
        <p className="text-center mt-6 text-sm text-muted-foreground font-noto-sans-jp">
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" className="text-primary hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default Signup;
