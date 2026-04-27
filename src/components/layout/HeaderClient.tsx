"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { signOut } from "@/app/(auth)/actions";

interface HeaderUser {
  id: string;
  email: string;
  avatarUrl?: string;
}

interface HeaderClientProps {
  user: HeaderUser | null;
}

/**
 * ヘッダークライアントコンポーネント
 */
export function HeaderClient({ user }: HeaderClientProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // SSR/CSR hydration対策のため必要
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-8">
        <div className="flex gap-6 md:gap-10">
          {isMobile && isMounted && <MobileMenu />}
          <Link href="/" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              UIUX DESIGN
            </span>
          </Link>
          {!isMobile && isMounted && <DesktopNavigation />}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {!user ? (
            <Button variant="default" size="sm" asChild>
              <Link href="/login">ログイン</Link>
            </Button>
          ) : (
            <UserMenu user={user} onSignOut={handleSignOut} />
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * ナビゲーションリストアイテム
 */
const ListItem = React.forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href || "#"}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

/**
 * モバイルメニュー
 */
function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex h-full flex-col gap-4 py-4">
          <Link href="/" className="text-lg font-bold">
            UIUX DESIGN
          </Link>
          <div className="flex flex-col space-y-3">
            <Link
              href="/lessons"
              className="flex flex-col rounded-lg p-3 hover:bg-accent"
            >
              <span className="font-medium">コンテンツ</span>
              <span className="text-sm text-muted-foreground">
                ビデオ、記事、チュートリアル
              </span>
            </Link>
            <Link
              href="/lessons"
              className="flex flex-col rounded-lg p-3 hover:bg-accent"
            >
              <span className="font-medium">コース</span>
              <span className="text-sm text-muted-foreground">
                スキルを身につけるコース一覧
              </span>
            </Link>
            <Link
              href="/subscription"
              className="flex flex-col rounded-lg p-3 hover:bg-accent"
            >
              <span className="font-medium">プレミアム</span>
              <span className="text-sm text-muted-foreground">
                会員プランと特典
              </span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * デスクトップナビゲーション
 */
function DesktopNavigation() {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>デザインを学ぶ</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem href="/lessons" title="コース">
                体系的にUIUXデザインを学ぶコース
              </ListItem>
              <ListItem href="/articles" title="コンテンツライブラリ">
                動画や記事でスキルアップ
              </ListItem>
              <ListItem href="/roadmap" title="学習ロードマップ">
                UIUXデザイナーへの近道
              </ListItem>
              <ListItem href="/tips" title="デザインのヒント">
                実践で役立つテクニック
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>デザインツール</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem href="/figma" title="Figma">
                UI/UXデザインの主要ツール
              </ListItem>
              <ListItem href="/sketch" title="Sketch">
                macOS向けのデザインツール
              </ListItem>
              <ListItem href="/adobe-xd" title="Adobe XD">
                Adobeのデザイン&プロトタイピングツール
              </ListItem>
              <ListItem href="/tools" title="その他のツール">
                便利なデザインツール一覧
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/subscription" className={navigationMenuTriggerStyle()}>
              プレミアム会員
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

/**
 * ユーザーメニュー
 */
function UserMenu({
  user,
  onSignOut,
}: {
  user: HeaderUser;
  onSignOut: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.email} />
            <AvatarFallback>
              {user.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem asChild>
          <Link href="/profile">プロフィール</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/lessons">コンテンツライブラリ</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">設定</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>ログアウト</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
