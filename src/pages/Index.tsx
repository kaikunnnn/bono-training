
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">ようこそ</h1>
          <p className="text-lg text-muted-foreground mb-8">
            こちらはサブスクリプションサービスのデモページです。
            ログインして様々な機能をお試しください。
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 max-w-md mx-auto">
            <Button asChild>
              <Link to="/auth">ログイン / 登録</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/subscription">サブスクリプション</Link>
            </Button>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">メンバー限定コンテンツ</h2>
            <p className="mb-4">
              以下のリンクからメンバー限定コンテンツにアクセスできます。
              サブスクリプションがない場合は登録画面が表示されます。
            </p>
            <Button asChild variant="secondary">
              <Link to="/paid-only">プレミアムコンテンツを見る</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
