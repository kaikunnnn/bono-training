
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">ようこそ</h1>
          <p className="text-lg mb-8">
            ログインして、アプリケーションの全機能をお試しください。
          </p>

          <div className="space-y-4">
            {!user ? (
              <Button asChild size="lg">
                <Link to="/auth">ログイン</Link>
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-lg">
                  ログイン済み: {user.email}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild>
                    <Link to="/subscription">サブスクリプション管理</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/paid-only">メンバー限定コンテンツ</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/content-test">コンテンツアクセステスト</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
