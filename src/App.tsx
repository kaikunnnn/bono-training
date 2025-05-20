
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';

// Pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Content from './pages/Content';
import ContentDetail from './pages/ContentDetail';
import ContentTest from './pages/ContentTest';
import VideoDetailTest from './pages/VideoDetailTest';
import PaidContent from './pages/PaidContent';
import Subscription from './pages/Subscription';
import NotFound from './pages/NotFound';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

// Components
import PrivateRoute from './components/auth/PrivateRoute';
import ProtectedPremiumRoute from './components/subscription/ProtectedPremiumRoute';
import Profile from './pages/Profile';
import TrainingIndex from './pages/Training';
import TrainingDetail from './pages/TrainingDetail';
import TaskDetailPage from './pages/Training/TaskDetailPage';
import TaskDetailError from './pages/Training/TaskDetailError';
import TrainingAbout from './pages/Training/About';
import TrainingPlan from './pages/Training/Plan';
import TrainingLogin from './pages/Training/Login';
import ContentManager from './pages/Training/ContentManager';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* コンテンツページ */}
            <Route path="/content" element={<Content />} />
            <Route path="/content/:contentId" element={<ContentDetail />} />
            <Route path="/content-test" element={<ContentTest />} />
            <Route path="/video-test" element={<VideoDetailTest />} />
            
            {/* プレミアムコンテンツ */}
            <Route 
              path="/paid-content" 
              element={<ProtectedPremiumRoute><PaidContent /></ProtectedPremiumRoute>} 
            />
            
            {/* サブスクリプション */}
            <Route path="/subscription" element={<Subscription />} />
            
            {/* プロフィール */}
            <Route 
              path="/profile" 
              element={<PrivateRoute><Profile /></PrivateRoute>} 
            />
            
            {/* トレーニング関連ページ */}
            <Route path="/training" element={<TrainingIndex />} />
            <Route path="/training/about" element={<TrainingAbout />} />
            <Route path="/training/plan" element={<TrainingPlan />} />
            <Route path="/training/login" element={<TrainingLogin />} />
            <Route path="/training/content-manager" element={<PrivateRoute><ContentManager /></PrivateRoute>} />
            <Route path="/training/:slug" element={<TrainingDetail />} />
            <Route path="/training/:trainingSlug/:taskSlug" element={<TaskDetailPage />} />
            <Route path="/training/error" element={<TaskDetailError />} />
            
            {/* 404ページ */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          
          <Toaster richColors position="top-center" />
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
