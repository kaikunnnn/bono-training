"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle>リンクが無効です</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            このリンクは無効または期限切れです。
            <br />
            パスワード設定ページから再度お試しください。
          </p>
          <Button asChild className="w-full">
            <Link href="/forgot-password">確認コードを取得する</Link>
          </Button>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:underline block"
          >
            ログインページに戻る
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
