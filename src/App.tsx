
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { trackPageView } from "@/lib/analytics";
import { PlanType } from "@/utils/subscriptionPlans";
import PrivateRoute from "@/components/auth/PrivateRoute";
import ProtectedPremiumRoute from "@/components/subscription/ProtectedPremiumRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import TopPage from "./pages/top";
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
import FeedbackDetailPatterns from "./pages/dev/FeedbackDetailPatterns";
import TopPagePatterns from "./pages/dev/TopPagePatterns";
import TopPagePatternA from "./pages/dev/TopPagePatternA";
import TopPagePatternB from "./pages/dev/TopPagePatternB";
import TopPagePatternC from "./pages/dev/TopPagePatternC";
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
import QuestionsIndexOld from "./pages/questions";
import QuestionDetailOld from "./pages/questions/detail";
import QuestionNew from "./pages/questions/new";
import QuestionList from "./pages/questions/QuestionList";
import QuestionDetail from "./pages/questions/QuestionDetail";
import FeedbackList from "./pages/feedbacks/FeedbackList";
import FeedbackDetail from "./pages/feedbacks/FeedbackDetail";
import KnowledgeList from "./pages/knowledge/KnowledgeList";
import KnowledgeDetail from "./pages/knowledge/KnowledgeDetail";
import EventDetail from "./pages/events/EventDetail";
import ShareIndex from "./pages/share";
import ShareSubmit from "./pages/share/submit";
import FeedbackApplyIndex from "./pages/feedback-apply";
import FeedbackApplySubmit from "./pages/feedback-apply/submit";

// コンソールログでインポートの確認
console.log('App - SubscriptionProvider loaded:', SubscriptionProvider !== undefined);

const AppContent = () => {
  const location = useLocation();
  const urlPlan = new URLSearchParams(location.search).get('plan');

  // ページ遷移時にスクロール位置をリセット & GA4ページビュー送信
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

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
        <Route path="/top" element={<TopPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
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
        <Route path="/dev/feedback-detail-patterns" element={<DevRoute><FeedbackDetailPatterns /></DevRoute>} />
        <Route path="/dev/top-patterns" element={<DevRoute><TopPagePatterns /></DevRoute>} />
        <Route path="/dev/top-pattern-a" element={<DevRoute><TopPagePatternA /></DevRoute>} />
        <Route path="/dev/top-pattern-b" element={<DevRoute><TopPagePatternB /></DevRoute>} />
        <Route path="/dev/top-pattern-c" element={<DevRoute><TopPagePatternC /></DevRoute>} />

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

        {/* 質問ページ（Sanityベース） */}
        <Route path="/questions" element={<QuestionList />} />
        <Route path="/questions/new" element={<QuestionNew />} />
        <Route path="/questions/:slug" element={<QuestionDetail />} />
        {/* 旧質問ページ（テスト用 - 後で削除） */}
        <Route path="/questions-old" element={<PrivateRoute><QuestionsIndexOld /></PrivateRoute>} />
        <Route path="/questions-old/:questionId" element={<PrivateRoute><QuestionDetailOld /></PrivateRoute>} />

        {/* フィードバックページ（Sanityベース） */}
        <Route path="/feedbacks" element={<FeedbackList />} />
        <Route path="/feedbacks/:slug" element={<FeedbackDetail />} />

        {/* 15分フィードバック応募 */}
        <Route path="/feedback-apply" element={<FeedbackApplyIndex />} />
        <Route path="/feedback-apply/submit" element={<FeedbackApplySubmit />} />

        {/* ナレッジページ（Sanityベース） */}
        <Route path="/knowledge" element={<KnowledgeList />} />
        <Route path="/knowledge/:slug" element={<KnowledgeDetail />} />

        {/* 思考シェア記事（みんなの学びのアウトプット） */}
        <Route path="/share" element={<ShareIndex />} />
        <Route path="/share/submit" element={<ShareSubmit />} />

        <Route path="/events/:slug" element={<EventDetail />} />

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
