
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { PlanType } from "@/utils/subscriptionPlans";
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
import Lessons from "./pages/Lessons";
import GuidePage from "./pages/Guide";
import GuideDetailPage from "./pages/Guide/GuideDetail";
import DevRoute from "./pages/dev";
import DevHome from "./pages/dev/DevHome";
import ComponentsReferencePage from "./pages/dev/Components";
import WebflowTest from "./pages/dev/WebflowTest";
import GuideManual from "./pages/dev/GuideManual";
import ProgressComponents from "./pages/dev/ProgressComponents";
import CelebrationComponents from "./pages/dev/CelebrationComponents";
import QuestComponents from "./pages/dev/QuestComponents";
import LessonHeaderComponents from "./pages/dev/LessonHeaderComponents";
import IconAnimations from "./pages/dev/IconAnimations";
import QuestItemLayouts from "./pages/dev/QuestItemLayouts";
import IconComparison from "./pages/dev/IconComparison";
import LessonDetail from "./pages/LessonDetail";
import ArticleDetail from "./pages/ArticleDetail";
import SanityTest from "./pages/SanityTest";
import MyPage from "./pages/MyPage";
import Account from "./pages/Account";
import Roadmap from "./pages/Roadmap";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionUpdated from "./pages/SubscriptionUpdated";
import DevEnvironmentBanner from "./components/dev/DevEnvironmentBanner";
// Blog pages
import ComponentsPreview from './pages/blog/components-preview';
import BlogIndex from './pages/blog/index';
import BlogDetail from './pages/blog/detail';
import CategoryPage from './pages/blog/category';
import TagsIndex from './pages/blog/tags';
import TagDetail from './pages/blog/tag';
import BlogGuide from './pages/dev/BlogGuide';
import VideoPlayerTest from './pages/dev/VideoPlayerTest';
import BlogHeaderPatterns from './pages/dev/BlogHeaderPatterns';
import IconButtonBurstPlayground from "./pages/dev/IconButtonBurstPlayground";
import EmailTemplates from "./pages/dev/EmailTemplates";
import ArticleLayoutCompare from "./pages/dev/ArticleLayoutCompare";

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
    planType: urlPlan as PlanType,
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

        <Route path="/guide" element={<GuidePage />} />
        <Route path="/guide/:slug" element={<GuideDetailPage />} />

        <Route path="/dev" element={<DevRoute><DevHome /></DevRoute>} />
        <Route path="/dev/components" element={<DevRoute><ComponentsReferencePage /></DevRoute>} />
        <Route path="/dev/webflow-test" element={<DevRoute><WebflowTest /></DevRoute>} />
        <Route path="/dev/guide-manual" element={<DevRoute><GuideManual /></DevRoute>} />
        <Route path="/dev/blog" element={<DevRoute><BlogGuide /></DevRoute>} />
        <Route path="/dev/blog-header" element={<DevRoute><BlogHeaderPatterns /></DevRoute>} />
        <Route path="/dev/progress-components" element={<DevRoute><ProgressComponents /></DevRoute>} />
        <Route path="/dev/celebration" element={<DevRoute><CelebrationComponents /></DevRoute>} />
        <Route path="/dev/quest" element={<DevRoute><QuestComponents /></DevRoute>} />
        <Route path="/dev/lesson-header" element={<DevRoute><LessonHeaderComponents /></DevRoute>} />
        <Route path="/dev/icon-animations" element={<DevRoute><IconAnimations /></DevRoute>} />
        <Route path="/dev/icon-button-burst" element={<DevRoute><IconButtonBurstPlayground /></DevRoute>} />
        <Route path="/dev/quest-layouts" element={<DevRoute><QuestItemLayouts /></DevRoute>} />
        <Route path="/dev2" element={<DevRoute><IconComparison /></DevRoute>} />
        <Route path="/dev/video-player" element={<DevRoute><VideoPlayerTest /></DevRoute>} />
        <Route path="/dev/email-templates" element={<DevRoute><EmailTemplates /></DevRoute>} />
        <Route path="/dev/article-layout-compare" element={<DevRoute><ArticleLayoutCompare /></DevRoute>} />
        <Route path="/dev/article-layout-compare/:slug" element={<DevRoute><ArticleLayoutCompare /></DevRoute>} />

        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/components-preview" element={<ComponentsPreview />} />
        <Route path="/blog/tags" element={<TagsIndex />} />
        <Route path="/blog/tag/:slug" element={<TagDetail />} />
        <Route path="/blog/category/:category" element={<CategoryPage />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />

        <Route path="/subscription" element={<PrivateRoute><Subscription /></PrivateRoute>} />
        <Route path="/subscription/success" element={<PrivateRoute><SubscriptionSuccess /></PrivateRoute>} />
        <Route path="/subscription/updated" element={<PrivateRoute><SubscriptionUpdated /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
        <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />

        <Route path="/roadmap" element={<Roadmap />} />

        <Route path="/lessons" element={<Lessons />} />
        <Route path="/lessons/:slug" element={<LessonDetail />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        <Route path="/sanity-test" element={<SanityTest />} />

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
            <DevEnvironmentBanner />
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
