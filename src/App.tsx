
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import PrivateRoute from "@/components/auth/PrivateRoute";
import ProtectedPremiumRoute from "@/components/subscription/ProtectedPremiumRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Subscription from "./pages/Subscription";
import PaidContent from "./pages/PaidContent";
import Content from "./pages/Content";
import ContentDetail from "./pages/ContentDetail";
import VideoDetailTest from "./pages/VideoDetailTest";
import Profile from "./pages/Profile";
import TrainingHome from "./pages/Training";
import TrainingDetail from "./pages/TrainingDetail";
import TaskDetailPage from './pages/Training/TaskDetailPage';
import TrainingPlan from "./pages/Training/Plan";
import TrainingAbout from "./pages/Training/About";
import TrainingLogin from "./pages/Training/Login";
import TrainingSignup from "./pages/Training/Signup";
import TrainingDebug from '@/pages/Training/Debug';

// コンソールログでインポートの確認
console.log('App - SubscriptionProvider loaded:', SubscriptionProvider !== undefined);

const AppContent = () => {
  const location = useLocation();
  const urlPlan = new URLSearchParams(location.search).get('plan');
  
  // ページ遷移時にスクロール位置をリセット
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // クエリパラメータに基づいてモックのサブスクリプション状態を生成
  const mockSubscription = urlPlan ? {
    planType: urlPlan as any, // PlanType
    isSubscribed: urlPlan !== 'free',
    hasMemberAccess: ['standard', 'growth', 'community'].includes(urlPlan),
    hasLearningAccess: ['standard', 'growth'].includes(urlPlan),
    loading: false,
    error: null,
    refresh: async () => {}
  } : undefined;

  // デバッグ用ログ
  if (urlPlan) {
    console.log('Phase 3 Debug Mode:', {
      urlPlan,
      mockSubscription
    });
  }

  return (
    <SubscriptionProvider overrideValue={mockSubscription}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/training" element={<TrainingHome />} />
        <Route path="/training/login" element={<TrainingLogin />} />
        <Route path="/training/signup" element={<TrainingSignup />} />
        <Route path="/training/:trainingSlug" element={<TrainingDetail />} />
        <Route path="/training/:trainingSlug/:taskSlug" element={<TaskDetailPage />} />
        <Route path="/training/plan" element={<TrainingPlan />} />
        <Route path="/training/about" element={<TrainingAbout />} />
        <Route path="/training/debug" element={<TrainingDebug />} />
        
        <Route path="/subscription" element={<PrivateRoute><Subscription /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        
        <Route path="/content" element={<Content />} />
        <Route path="/content/:id" element={<ContentDetail />} />
        
        <Route path="/video-detail-test/:id" element={<VideoDetailTest />} />
        
        <Route path="/paid-only" element={
          <ProtectedPremiumRoute>
            <PaidContent />
          </ProtectedPremiumRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </SubscriptionProvider>
  );
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
