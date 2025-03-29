
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            新しいサービスへようこそ
          </h1>
          <p className="max-w-[600px] text-lg text-muted-foreground">
            このプロジェクトは新しいサービスの基盤として構築されています。
            詳細な実装を開始する準備ができています。
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg">
              はじめる
            </Button>
            <Button variant="outline" size="lg">
              詳細を見る
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
