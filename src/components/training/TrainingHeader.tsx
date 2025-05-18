
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { LogIn, Menu, X, FileEdit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TrainingHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isSubscribed, planMembers } = useSubscriptionContext();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/training');
  };

  // 管理者（plan_members=true）ユーザーかどうか
  const isAdmin = user && planMembers;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* ロゴ */}
        <Link to="/training" className="flex items-center">
          <span className="text-xl font-bold text-training-accent dark:text-training-accent-dark">BONO</span>
          <span className="ml-1 text-xl font-semibold">Training</span>
        </Link>
        
        {/* デスクトップナビ */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/training" className="text-gray-600 hover:text-training-accent dark:text-gray-300 dark:hover:text-training-accent-dark">
            ホーム
          </Link>
          <Link to="/training/about" className="text-gray-600 hover:text-training-accent dark:text-gray-300 dark:hover:text-training-accent-dark">
            概要
          </Link>
          {isAdmin && (
            <Link to="/training/content-manager" className="flex items-center text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
              <FileEdit className="mr-1 h-4 w-4" />
              コンテンツ管理
            </Link>
          )}
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>ログアウト</Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/training/login')} size="sm" className="bg-training-accent hover:bg-training-accent/90 text-white">
              <LogIn className="mr-2 h-4 w-4" />
              ログイン
            </Button>
          )}
        </nav>
        
        {/* モバイルメニューボタン */}
        <button 
          className="md:hidden focus:outline-none"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* モバイルメニュー */}
      <div className={cn(
        "fixed inset-0 bg-white dark:bg-gray-900 z-30 flex flex-col pt-16 px-4 md:hidden transition-transform duration-300",
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <nav className="flex flex-col space-y-4 pt-4">
          <Link 
            to="/training" 
            className="text-lg py-2 border-b dark:border-gray-800"
            onClick={() => setIsMenuOpen(false)}
          >
            ホーム
          </Link>
          <Link 
            to="/training/about" 
            className="text-lg py-2 border-b dark:border-gray-800"
            onClick={() => setIsMenuOpen(false)}
          >
            概要
          </Link>
          {isAdmin && (
            <Link 
              to="/training/content-manager" 
              className="text-lg py-2 border-b dark:border-gray-800 text-green-600 dark:text-green-400 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <FileEdit className="mr-2 h-5 w-5" />
              コンテンツ管理
            </Link>
          )}
          
          <div className="pt-4">
            {user ? (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user.email}</p>
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  ログアウト
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/training/login');
                }} 
                className="w-full bg-training-accent hover:bg-training-accent/90 text-white"
              >
                <LogIn className="mr-2 h-4 w-4" />
                ログイン
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default TrainingHeader;
