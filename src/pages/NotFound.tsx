
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="container flex flex-col items-center justify-center text-center py-20 md:py-32">
        <h1 className="text-7xl font-bold mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-4">ページが見つかりません</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          お探しのページは存在しないか、移動または削除された可能性があります。
        </p>
        <Button asChild>
          <a href="/">ホームに戻る</a>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
