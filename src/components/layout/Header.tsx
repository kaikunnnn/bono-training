import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * アプリケーションヘッダーコンポーネント
 */
const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = useState(false);
  
  // クライアントサイドレンダリングのためのマウント状態確認
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const ListItem = React.forwardRef<
    React.ElementRef<'a'>,
    React.ComponentPropsWithoutRef<'a'>
  >(({ className, title, children, ...props }, ref) => (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  ));
  
  ListItem.displayName = "ListItem";

  const learnLinks = [
    {
      href: '/courses',
      title: 'コース',
      description: '体系的にUIUXデザインを学ぶコース'
    },
    {
      href: '/content',
      title: 'コンテンツライブラリ',
      description: '動画や記事でスキルアップ'
    },
    { href: '/roadmap', title: '学習ロードマップ', description: 'UIUXデザイナーへの近道' },
    { href: '/tips', title: 'デザインのヒント', description: '実践で役立つテクニック' }
  ];

  const toolLinks = [
    { href: '/figma', title: 'Figma', description: 'UI/UXデザインの主要ツール' },
    { href: '/sketch', title: 'Sketch', description: 'macOS向けのデザインツール' },
    { href: '/adobe-xd', title: 'Adobe XD', description: 'Adobeのデザイン&プロトタイピングツール' },
    { href: '/tools', title: 'その他のツール', description: '便利なデザインツール一覧' }
  ];

  // モバイル用メニュー
  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex h-full flex-col gap-4 py-4">
          <Link to="/" className="text-lg font-bold">
            UIUX DESIGN
          </Link>
          <div className="space-y-6">
            <div className="flex flex-col space-y-3">
              <span className="font-semibold">デザインを学ぶ</span>
              {learnLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex flex-col rounded-lg p-3 hover:bg-accent"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </Link>
              ))}
            </div>
            <div className="flex flex-col space-y-3">
              <span className="font-semibold">デザインツール</span>
              {toolLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex flex-col rounded-lg p-3 hover:bg-accent"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              to="/subscription"
              className="flex flex-col rounded-lg p-3 hover:bg-accent"
            >
              <span className="font-medium">プレミアム</span>
              <span className="text-sm text-muted-foreground">会員プランと特典</span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // デスクトップ用ナビゲーション
  const DesktopNavigation = () => (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {[
          { label: 'デザインを学ぶ', links: learnLinks },
          { label: 'デザインツール', links: toolLinks }
        ].map((group) => (
          <NavigationMenuItem key={group.label}>
            <NavigationMenuTrigger>{group.label}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {group.links.map((item) => (
                  <ListItem key={item.href} href={item.href} title={item.title}>
                    {item.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <Link to="/subscription">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              プレミアム会員
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-8">
        <div className="flex gap-6 md:gap-10">
          {isMobile && isMounted && <MobileMenu />}
          <Link to="/" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">UIUX DESIGN</span>
          </Link>
          {!isMobile && isMounted && <DesktopNavigation />}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {!user ? (
            <Button
              variant="default"
              onClick={() => navigate("/auth")}
              size="sm"
            >
              ログイン
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url}
                      alt={user.email || ""}
                    />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  プロフィール
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/content")}>
                  コンテンツライブラリ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  設定
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
