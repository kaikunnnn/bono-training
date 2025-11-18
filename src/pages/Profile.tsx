
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { Mail, User, ChevronRight } from "lucide-react";
import { FlowerCollection } from "@/components/flower/FlowerCollection";
import { useAllFlowersProgress } from "@/hooks/useFlowerProgress";

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isSubscribed, planType, hasMemberAccess, loading } = useSubscriptionContext();
  const navigate = useNavigate();

  // 璃奈フラワーの進捗を取得
  const { data: flowers = [], isLoading: flowersLoading } = useAllFlowersProgress(user?.id || '');
  
  // プラン名を取得する関数
  const getPlanDisplayName = () => {
    if (!isSubscribed || !planType) return "フリープラン";
    
    const planNames: Record<string, string> = {
      standard: "スタンダード",
      growth: "グロース",
      community: "コミュニティ"
    };
    
    return planNames[planType] || "不明なプラン";
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };
  
  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">アカウント情報</h1>
        
        <div className="space-y-6">
          {/* ユーザー情報カード */}
          <Card>
            <CardHeader>
              <CardTitle>ユーザー情報</CardTitle>
              <CardDescription>あなたの基本情報</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ユーザーID</p>
                    <p className="font-medium">{user?.id?.substring(0, 8)}...</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">メールアドレス</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* サブスクリプション情報カード */}
          <Card>
            <CardHeader>
              <CardTitle>サブスクリプション情報</CardTitle>
              <CardDescription>現在のプラン</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{getPlanDisplayName()}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isSubscribed 
                        ? "アクティブなサブスクリプション" 
                        : "登録中のプランはありません"}
                    </p>
                    
                    {hasMemberAccess && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ トレーニングメンバーシップ有効
                      </p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <Button 
                    variant="outline"
                    className="w-full flex justify-between"
                    onClick={() => navigate("/training/plan")}
                  >
                    <span>
                      {isSubscribed 
                        ? "他プランを確認・変更する"
                        : "プラン登録へ進む"}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 璃奈フラワーコレクションセクション */}
          <Card>
            <CardHeader>
              <CardTitle>🌸 璃奈フラワーコレクション</CardTitle>
              <CardDescription>
                レッスンの進捗に応じて花が成長します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FlowerCollection flowers={flowers} isLoading={flowersLoading} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleSignOut}>
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
