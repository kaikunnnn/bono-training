
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="flex justify-between w-full items-center">
          <div className="font-semibold text-lg">サービス名</div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium hover:underline">
              ホーム
            </a>
            <a href="#" className="text-sm font-medium hover:underline">
              機能
            </a>
            <a href="#" className="text-sm font-medium hover:underline">
              料金
            </a>
            <a href="#" className="text-sm font-medium hover:underline">
              お問い合わせ
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline">ログイン</Button>
            <Button>新規登録</Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
