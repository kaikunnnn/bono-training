
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, LogIn } from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-lg">サービス名</Link>
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              ホーム
            </Link>
            {/* 認証が必要なページへのリンクはここに追加 */}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Button variant="ghost" onClick={signOut} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </Button>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link to="/auth">
                <LogIn className="h-4 w-4 mr-2" />
                ログイン
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
