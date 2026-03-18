// 進捗管理
export {
  toggleArticleCompletion,
  getArticleProgress,
  isArticleCompleted,
  getLessonProgress,
  getMultipleLessonProgress,
  markLessonAsCompleted,
  getLessonStatus,
  getMultipleLessonStatus,
  removeLessonCompletion,
  type ArticleProgress,
  type LessonProgress,
  type LessonStatus,
} from "./progress";

// ブックマーク
export {
  toggleBookmark,
  isBookmarked,
  getBookmarks,
  getBookmarkedArticles,
  getBookmarkStatus,
  type BookmarkedArticle,
} from "./bookmarks";

// 閲覧履歴
export {
  recordViewHistory,
  getViewHistoryIds,
  getViewHistory,
  clearViewHistory,
  type ViewedArticle,
} from "./viewHistory";

// 認証
export {
  signUpService,
  signInService,
  signOutService,
  resetPasswordService,
  updatePasswordService,
  type AuthResponse,
} from "./auth";

// 料金
export {
  getPlanPrices,
  type PlanPrice,
  type PlanPrices,
  type GetPlanPricesResponse,
} from "./pricing";
