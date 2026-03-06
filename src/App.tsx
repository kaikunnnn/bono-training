
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
import RoadmapPatterns from "./pages/dev/RoadmapPatterns";
import RoadmapPattern1 from "./pages/dev/RoadmapPattern1";
import RoadmapPattern2 from "./pages/dev/RoadmapPattern2";
import RoadmapPattern3 from "./pages/dev/RoadmapPattern3";
import RoadmapPattern4 from "./pages/dev/RoadmapPattern4";
import RoadmapPattern5 from "./pages/dev/RoadmapPattern5";
import RoadmapPattern5A from "./pages/dev/RoadmapPattern5A";
import RoadmapPattern5B from "./pages/dev/RoadmapPattern5B";
import RoadmapPattern5C from "./pages/dev/RoadmapPattern5C";
import RoadmapPattern10 from "./pages/dev/RoadmapPattern10";
import RoadmapPattern11 from "./pages/dev/RoadmapPattern11";
import RoadmapPattern12 from "./pages/dev/RoadmapPattern12";
import RoadmapPattern13 from "./pages/dev/RoadmapPattern13";
import RoadmapPattern14 from "./pages/dev/RoadmapPattern14";
import RoadmapPattern15 from "./pages/dev/RoadmapPattern15";
import RoadmapPattern16 from "./pages/dev/RoadmapPattern16";
import RoadmapTest from "./pages/dev/RoadmapTest";
import RoadmapListPage from "./pages/roadmaps";
import RoadmapDetail from "./pages/roadmaps/RoadmapDetail";
import LessonDetailPatterns from "./pages/dev/LessonDetailPatterns";
import LessonIdea1 from "./pages/dev/lesson-ideas/LessonIdea1";
import LessonIdea2 from "./pages/dev/lesson-ideas/LessonIdea2";
import LessonIdea3 from "./pages/dev/lesson-ideas/LessonIdea3";
import LessonIdea4 from "./pages/dev/lesson-ideas/LessonIdea4";
import LessonIdea5 from "./pages/dev/lesson-ideas/LessonIdea5";
import LessonIdea6 from "./pages/dev/lesson-ideas/LessonIdea6";
import LessonIdea7 from "./pages/dev/lesson-ideas/LessonIdea7";
import LessonIdea8 from "./pages/dev/lesson-ideas/LessonIdea8";
import LessonIdea9 from "./pages/dev/lesson-ideas/LessonIdea9";
import LessonIdea10 from "./pages/dev/lesson-ideas/LessonIdea10";
import LessonIdea11 from "./pages/dev/lesson-ideas/LessonIdea11";
import LessonIdea12 from "./pages/dev/lesson-ideas/LessonIdea12";
import LessonIdea13 from "./pages/dev/lesson-ideas/LessonIdea13";
import LessonIdea14 from "./pages/dev/lesson-ideas/LessonIdea14";
import LessonIdea15 from "./pages/dev/lesson-ideas/LessonIdea15";
import LessonIdea16 from "./pages/dev/lesson-ideas/LessonIdea16";
import LessonIdea17 from "./pages/dev/lesson-ideas/LessonIdea17";
import LessonIdea18 from "./pages/dev/lesson-ideas/LessonIdea18";
import LessonIdea19 from "./pages/dev/lesson-ideas/LessonIdea19";
import LessonIdea20 from "./pages/dev/lesson-ideas/LessonIdea20";
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
        <Route path="/dev/roadmap-patterns" element={<DevRoute><RoadmapPatterns /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-1" element={<DevRoute><RoadmapPattern1 /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-2" element={<DevRoute><RoadmapPattern2 /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-3" element={<DevRoute><RoadmapPattern3 /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-4" element={<DevRoute><RoadmapPattern4 /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-5" element={<DevRoute><RoadmapPattern5 /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-5a" element={<DevRoute><RoadmapPattern5A /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-5b" element={<DevRoute><RoadmapPattern5B /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-5c" element={<DevRoute><RoadmapPattern5C /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-10" element={<DevRoute><RoadmapPattern10 /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-11" element={<DevRoute><RoadmapPattern11 /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-12" element={<DevRoute><RoadmapPattern12 /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-13" element={<DevRoute><RoadmapPattern13 /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-14" element={<DevRoute><RoadmapPattern14 /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-15" element={<DevRoute><RoadmapPattern15 /></DevRoute>} />
        <Route path="/dev/roadmap-pattern-16" element={<DevRoute><RoadmapPattern16 /></DevRoute>} />
        <Route path="/dev/roadmap-test" element={<DevRoute><RoadmapTest /></DevRoute>} />
        <Route path="/dev/lesson-detail-patterns" element={<DevRoute><LessonDetailPatterns /></DevRoute>} />
        <Route path="/dev/lesson-idea-1" element={<DevRoute><LessonIdea1 /></DevRoute>} />
        <Route path="/dev/lesson-idea-2" element={<DevRoute><LessonIdea2 /></DevRoute>} />
        <Route path="/dev/lesson-idea-3" element={<DevRoute><LessonIdea3 /></DevRoute>} />
        <Route path="/dev/lesson-idea-4" element={<DevRoute><LessonIdea4 /></DevRoute>} />
        <Route path="/dev/lesson-idea-5" element={<DevRoute><LessonIdea5 /></DevRoute>} />
        <Route path="/dev/lesson-idea-6" element={<DevRoute><LessonIdea6 /></DevRoute>} />
        <Route path="/dev/lesson-idea-7" element={<DevRoute><LessonIdea7 /></DevRoute>} />
        <Route path="/dev/lesson-idea-8" element={<DevRoute><LessonIdea8 /></DevRoute>} />
        <Route path="/dev/lesson-idea-9" element={<DevRoute><LessonIdea9 /></DevRoute>} />
        <Route path="/dev/lesson-idea-10" element={<DevRoute><LessonIdea10 /></DevRoute>} />
        <Route path="/dev/lesson-idea-11" element={<DevRoute><LessonIdea11 /></DevRoute>} />
        <Route path="/dev/lesson-idea-12" element={<DevRoute><LessonIdea12 /></DevRoute>} />
        <Route path="/dev/lesson-idea-13" element={<DevRoute><LessonIdea13 /></DevRoute>} />
        <Route path="/dev/lesson-idea-14" element={<DevRoute><LessonIdea14 /></DevRoute>} />
        <Route path="/dev/lesson-idea-15" element={<DevRoute><LessonIdea15 /></DevRoute>} />
        <Route path="/dev/lesson-idea-16" element={<DevRoute><LessonIdea16 /></DevRoute>} />
        <Route path="/dev/lesson-idea-17" element={<DevRoute><LessonIdea17 /></DevRoute>} />
        <Route path="/dev/lesson-idea-18" element={<DevRoute><LessonIdea18 /></DevRoute>} />
        <Route path="/dev/lesson-idea-19" element={<DevRoute><LessonIdea19 /></DevRoute>} />
        <Route path="/dev/lesson-idea-20" element={<DevRoute><LessonIdea20 /></DevRoute>} />

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
        <Route path="/roadmaps" element={<RoadmapListPage />} />
        <Route path="/roadmaps/:slug" element={<RoadmapDetail />} />

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
