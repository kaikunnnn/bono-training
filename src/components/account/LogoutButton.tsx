// src/components/account/LogoutButton.tsx
// ログアウトボタン（アカウント設定ページ用）
"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(auth)/actions";

export function LogoutButton() {
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
      ログアウト
    </Button>
  );
}
