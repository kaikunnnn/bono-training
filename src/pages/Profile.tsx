
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, User } from "lucide-react";

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
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
