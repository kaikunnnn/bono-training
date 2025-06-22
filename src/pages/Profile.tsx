
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import { createCustomerPortalSession } from "@/services/stripe";
import { Mail, User, ChevronRight, Settings, CreditCard, LogOut, ExternalLink } from "lucide-react";

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isSubscribed, planType, hasMemberAccess, loading } = useSubscriptionContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customerPortalLoading, setCustomerPortalLoading] = useState(false);
  
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

  // プランのステータスバッジを取得
  const getPlanStatusBadge = () => {
    if (!isSubscribed) {
      return <Badge variant="secondary">未登録</Badge>;
    }
    return <Badge variant="default">アクティブ</Badge>;
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Stripe Customer Portalへの遷移を処理
  const handleManageSubscription = async () => {
    if (!isSubscribed) {
      navigate("/training/plan");
      return;
    }

    setCustomerPortalLoading(true);
    try {
      // 現在のページのURLを取得してリターンURLとして設定
      const returnUrl = `${window.location.origin}/profile`;
      
      const { url, error } = await createCustomerPortalSession(returnUrl);
      
      if (error) {
        throw error;
      }
      
      if (url) {
        // Customer Portalページに遷移
        window.location.href = url;
      } else {
        throw new Error("Customer PortalのURLが取得できませんでした。");
      }
    } catch (error) {
      console.error("Customer Portal error:", error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "サブスクリプション管理ページを開けませんでした。",
        variant: "destructive"
      });
    } finally {
      setCustomerPortalLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">マイページ</h1>
          <p className="text-muted-foreground">アカウント情報とサブスクリプションの管理</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* ユーザー情報カード */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                アカウント情報
              </CardTitle>
              <CardDescription>ログイン中のアカウント詳細</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">メールアドレス</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">ユーザーID</p>
                    <p className="font-mono text-sm">{user?.id?.substring(0, 8)}...</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* サブスクリプション情報カード */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                サブスクリプション
              </CardTitle>
              <CardDescription>現在のプランとサービス利用状況</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{getPlanDisplayName()}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isSubscribed 
                          ? "ご利用中のプラン" 
                          : "現在未登録"}
                      </p>
                    </div>
                    {getPlanStatusBadge()}
                  </div>
                  
                  {hasMemberAccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        ✓ トレーニングメンバーシップ有効
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        すべてのコンテンツにアクセス可能です
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* サブスクリプション管理セクション */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                サブスクリプション管理
              </CardTitle>
              <CardDescription>
                プランの詳細確認、変更、お支払い方法の管理を行えます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isSubscribed ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button 
                        variant="default"
                        className="flex items-center gap-2"
                        onClick={handleManageSubscription}
                        disabled={customerPortalLoading}
                      >
                        {customerPortalLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        サブスクリプション管理
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => navigate("/training/plan")}
                      >
                        <span>他のプランを見る</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-sm text-muted-foreground">
                      <p>• プラン変更、お支払い方法の更新、請求履歴の確認</p>
                      <p>• サブスクリプションの一時停止や解約</p>
                      <p>• 次回請求日の確認</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">
                        サブスクリプションに登録して、すべてのトレーニングコンテンツにアクセスしましょう
                      </p>
                      <Button 
                        size="lg"
                        className="flex items-center gap-2"
                        onClick={() => navigate("/training/plan")}
                      >
                        プランを選択する
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* アカウント操作 */}
        <div className="mt-8 flex justify-end">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            ログアウト
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
