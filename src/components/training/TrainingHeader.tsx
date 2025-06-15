
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

const TrainingHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <header className="border-b border-orange-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="text-orange-600 hover:bg-orange-50"
            >
              <Home className="w-4 h-4 mr-2" />
              ホーム
            </Button>
            <Link 
              to="/training" 
              className="text-xl font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              🏃‍♂️ BONO Training
            </Link>
          </div>
          
          <nav className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="text-gray-600 hover:bg-orange-50"
            >
              <Link to="/training">トレーニング一覧</Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <Link to="/training/plan">プランを見る</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default TrainingHeader;
