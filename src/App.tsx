
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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

// Code splitting for training routes
const TrainingIndex = lazy(() => import('./pages/Training'));
const TrainingDetail = lazy(() => import('./pages/TrainingDetail'));
const TaskDetailPage = lazy(() => import('./pages/Training/TaskDetailPage'));
const TaskDetailError = lazy(() => import('./pages/Training/TaskDetailError'));
const TrainingAbout = lazy(() => import('./pages/Training/About'));
const TrainingPlan = lazy(() => import('./pages/Training/Plan'));
const TrainingLogin = lazy(() => import('./pages/Training/Login'));
const ContentManager = lazy(() => import('./pages/Training/ContentManager'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分間はデータをstaleとみなさない
      cacheTime: 1000 * 60 * 30, // 30分間キャッシュを保持
      retry: 1, // エラー時に1回だけ再試行
      refetchOnWindowFocus: false, // ウィンドウフォーカス時に再フェッチしない（トレーニングデータは頻繁に変わらないため）
    },
  },
});

// Loading fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-pulse text-lg">読み込み中...</div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
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
              
              {/* トレーニング関連ページ - コードスプリッティング適用 */}
              <Route path="/training" element={
                <Suspense fallback={<LoadingFallback />}>
                  <TrainingIndex />
                </Suspense>
              } />
              <Route path="/training/about" element={
                <Suspense fallback={<LoadingFallback />}>
                  <TrainingAbout />
                </Suspense>
              } />
              <Route path="/training/plan" element={
                <Suspense fallback={<LoadingFallback />}>
                  <TrainingPlan />
                </Suspense>
              } />
              <Route path="/training/login" element={
                <Suspense fallback={<LoadingFallback />}>
                  <TrainingLogin />
                </Suspense>
              } />
              <Route path="/training/content-manager" element={
                <Suspense fallback={<LoadingFallback />}>
                  <PrivateRoute>
                    <ContentManager />
                  </PrivateRoute>
                </Suspense>
              } />
              <Route path="/training/:slug" element={
                <Suspense fallback={<LoadingFallback />}>
                  <TrainingDetail />
                </Suspense>
              } />
              <Route path="/training/:trainingSlug/:taskSlug" element={
                <Suspense fallback={<LoadingFallback />}>
                  <TaskDetailPage />
                </Suspense>
              } />
              <Route path="/training/error" element={
                <Suspense fallback={<LoadingFallback />}>
                  <TaskDetailError />
                </Suspense>
              } />
              
              {/* 404ページ */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            
            <Toaster richColors position="top-center" />
          </SubscriptionProvider>
        </AuthProvider>
      </Router>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
