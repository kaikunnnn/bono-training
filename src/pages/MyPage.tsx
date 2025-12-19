import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { BookmarkList } from "@/components/ui/bookmark-list";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProgressLesson } from "@/components/progress";
import { TabNavigation, TabId } from "@/components/navigation";
import { getBookmarkedArticles, toggleBookmark, type BookmarkedArticle } from "@/services/bookmarks";
import { getAllLessonsWithArticles, getNextIncompleteArticle, type LessonWithArticles } from "@/services/lessons";
import {
  getMultipleLessonProgress,
  getMultipleLessonStatus,
  markLessonAsCompleted,
  type LessonProgress,
  type LessonStatus,
} from "@/services/progress";
import { User, Settings } from "lucide-react";

// Figma仕様に基づくスタイル定数
const styles = {
  // カラー
  colors: {
    titleText: "#020817",
    seeAllText: "rgba(2, 8, 23, 0.64)",
    accountButtonBg: "#DBEAFE",
    profileButtonBg: "#F3F4F6",
    cardBg: "#FFFFFF",
    emptyStateBg: "rgba(0, 0, 0, 0.02)",
  },
  // スペーシング
  spacing: {
    containerPaddingTop: "40px",
    containerPaddingBottom: "64px",
    containerPaddingHorizontal: "16px",
    sectionGap: "24px",
    headerTitleTabGap: "16px",
    headerButtonGap: "12px",
    sectionContentGap: "20px",
    sectionHeadingGap: "16px",
    lessonGridGap: "10px",
  },
  // タイポグラフィ
  typography: {
    fontFamily: "'Rounded Mplus 1c', sans-serif",
    buttonFontFamily: "'Inter', 'Noto Sans JP', sans-serif",
  },
};

export default function MyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [lessons, setLessons] = useState<LessonWithArticles[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [lessonStatusMap, setLessonStatusMap] = useState<Record<string, LessonStatus>>({});
  const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      const articles = await getBookmarkedArticles();
      setBookmarks(articles);

      const allLessons = await getAllLessonsWithArticles();
      setLessons(allLessons);

      const lessonData = allLessons.map(lesson => ({
        lessonId: lesson._id,
        articleIds: lesson.articleIds,
      }));

      const progress = await getMultipleLessonProgress(lessonData);
      setProgressMap(progress);

      const lessonIds = allLessons.map(lesson => lesson._id);
      const statuses = await getMultipleLessonStatus(lessonIds);
      setLessonStatusMap(statuses);

      setLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  const handleRemoveBookmark = async (articleId: string) => {
    await toggleBookmark(articleId, false);
  };

  // 進行中のレッスン（0% < 進捗 < 100%）- 新しく更新された順
  const inProgressLessonsData = lessons
    .filter(lesson => {
      const progress = progressMap[lesson._id];
      return progress && progress.percentage > 0 && progress.percentage < 100;
    })
    .map(lesson => {
      const progress = progressMap[lesson._id];
      const nextArticle = getNextIncompleteArticle(
        lesson.articles,
        progress.completedArticleIds
      );

      return {
        title: lesson.title,
        progress: progress.percentage,
        currentStep: nextArticle?.title || "次のステップ",
        iconImageUrl: lesson.iconImageUrl || "https://via.placeholder.com/48x73",
        nextArticleUrl: nextArticle ? `/articles/${nextArticle.slug.current}` : undefined,
        lessonSlug: lesson.slug.current,
        lastUpdatedAt: progress.lastUpdatedAt,
      };
    })
    .sort((a, b) => {
      // 新しい順にソート（lastUpdatedAtが新しいものが先）
      if (!a.lastUpdatedAt) return 1;
      if (!b.lastUpdatedAt) return -1;
      return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
    });

  // 100%達成したが完了ボタン未押下のレッスン - 新しく更新された順
  const readyToCompleteLessonsData = lessons
    .filter(lesson => {
      const progress = progressMap[lesson._id];
      const status = lessonStatusMap[lesson._id];
      return progress && progress.percentage === 100 && status !== 'completed';
    })
    .map(lesson => {
      const progress = progressMap[lesson._id];

      return {
        lessonId: lesson._id,
        title: lesson.title,
        progress: progress.percentage,
        currentStep: "全て完了",
        iconImageUrl: lesson.iconImageUrl || "https://via.placeholder.com/48x73",
        lessonSlug: lesson.slug.current,
        showCompleteButton: true,
        onCompleteClick: () => handleCompleteLesson(lesson._id),
        isCompleting: completingLessonId === lesson._id,
        lastUpdatedAt: progress.lastUpdatedAt,
      };
    })
    .sort((a, b) => {
      // 新しい順にソート（lastUpdatedAtが新しいものが先）
      if (!a.lastUpdatedAt) return 1;
      if (!b.lastUpdatedAt) return -1;
      return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
    });

  // 完了済みレッスン
  const completedLessonsData = lessons
    .filter(lesson => {
      const status = lessonStatusMap[lesson._id];
      return status === 'completed';
    })
    .map(lesson => {
      return {
        title: lesson.title,
        progress: 100,
        currentStep: "全て完了",
        iconImageUrl: lesson.iconImageUrl || "https://via.placeholder.com/48x73",
        lessonSlug: lesson.slug.current,
      };
    });

  const handleCardClick = (title: string) => {
    const lesson = lessons.find(l => l.title === title);
    if (lesson) {
      navigate(`/lessons/${lesson.slug.current}`);
    }
  };

  const handleNextArticleClick = (url: string) => {
    navigate(url);
  };

  const handleViewAllProgress = () => {
    setActiveTab('progress');
  };

  const handleViewAllFavorite = () => {
    setActiveTab('favorite');
  };

  const handleViewAllHistory = () => {
    setActiveTab('history');
  };

  const handleCompleteLesson = async (lessonId: string) => {
    setCompletingLessonId(lessonId);
    const result = await markLessonAsCompleted(lessonId);
    if (result.success) {
      setLessonStatusMap(prev => ({
        ...prev,
        [lessonId]: 'completed',
      }));
    }
    setCompletingLessonId(null);
  };

  if (loading) {
    return (
      <Layout>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: styles.spacing.sectionGap,
          alignItems: "flex-start",
          paddingTop: styles.spacing.containerPaddingTop,
          paddingBottom: styles.spacing.containerPaddingBottom,
          paddingLeft: styles.spacing.containerPaddingHorizontal,
          paddingRight: styles.spacing.containerPaddingHorizontal,
          width: "100%",
          minHeight: "100vh",
        }}>
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  const allActiveLessons = [...inProgressLessonsData, ...readyToCompleteLessonsData];
  // 進行中セクションは常に2つまで表示
  const displayedInProgressLessons = allActiveLessons.slice(0, 2);
  // 3つ目以降 + 完了済みを「その他の進捗」セクションに統合
  // 完了済み → 100%達成 → その他の順で表示
  const overflowFromActive = allActiveLessons.slice(2);
  const completedForOverflow = completedLessonsData.map(lesson => ({
    ...lesson,
    isCompleted: true,
  }));
  const overflowLessons = [...completedForOverflow, ...overflowFromActive].sort((a, b) => {
    // 完了済みを最上位に
    const aCompleted = 'isCompleted' in a && a.isCompleted;
    const bCompleted = 'isCompleted' in b && b.isCompleted;
    if (aCompleted && !bCompleted) return -1;
    if (!aCompleted && bCompleted) return 1;
    // 次に100%のものを上に
    if (a.progress === 100 && b.progress !== 100) return -1;
    if (a.progress !== 100 && b.progress === 100) return 1;
    return 0;
  });

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: styles.spacing.sectionGap,
          alignItems: "flex-start",
          paddingTop: styles.spacing.containerPaddingTop,
          paddingBottom: styles.spacing.containerPaddingBottom,
          paddingLeft: styles.spacing.containerPaddingHorizontal,
          paddingRight: styles.spacing.containerPaddingHorizontal,
          width: "100%",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        {/* ヘッダーセクション */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            width: "100%",
            flexShrink: 0,
          }}
        >
          {/* 左側：タイトル + タブ */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: styles.spacing.headerTitleTabGap,
              alignItems: "flex-start",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <h1
              style={{
                fontFamily: styles.typography.fontFamily,
                fontWeight: 700,
                fontSize: "20px",
                lineHeight: "normal",
                color: styles.colors.titleText,
                margin: 0,
              }}
            >
              マイページ
            </h1>
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* 右側：アカウント情報 + プロフィール */}
          <div
            style={{
              display: "flex",
              gap: styles.spacing.headerButtonGap,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Link
              to="/account"
              style={{
                backgroundColor: styles.colors.accountButtonBg,
                display: "flex",
                gap: "4px",
                alignItems: "center",
                padding: "5px 10px",
                borderRadius: "8px",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <Settings size={20} color={styles.colors.titleText} />
              <span
                style={{
                  fontFamily: styles.typography.buttonFontFamily,
                  fontWeight: 700,
                  fontSize: "13px",
                  lineHeight: "24px",
                  color: styles.colors.titleText,
                  whiteSpace: "nowrap",
                }}
              >
                アカウント情報
              </span>
            </Link>
            <Link
              to="/profile"
              style={{
                backgroundColor: styles.colors.profileButtonBg,
                display: "flex",
                gap: "4px",
                alignItems: "center",
                padding: "5px 10px",
                borderRadius: "8px",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <User size={20} color={styles.colors.titleText} />
              <span
                style={{
                  fontFamily: styles.typography.buttonFontFamily,
                  fontWeight: 700,
                  fontSize: "13px",
                  lineHeight: "24px",
                  color: styles.colors.titleText,
                  whiteSpace: "nowrap",
                }}
              >
                プロフィール
              </span>
            </Link>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: styles.spacing.sectionContentGap,
            alignItems: "flex-start",
            width: "100%",
            flexShrink: 0,
          }}
        >
          {/* 進行中セクション */}
          {(activeTab === 'all' || activeTab === 'progress') && (
            <section
              style={{
                display: "flex",
                flexDirection: "column",
                gap: styles.spacing.sectionHeadingGap,
                alignItems: "flex-start",
                width: "100%",
                flexShrink: 0,
              }}
            >
              {/* セクション見出し */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: styles.spacing.sectionHeadingGap,
                  alignItems: "flex-start",
                  width: "100%",
                  flexShrink: 0,
                }}
              >
                <SectionHeading
                  title="進行中"
                  onSeeAllClick={handleViewAllProgress}
                  totalCount={allActiveLessons.length}
                  displayLimit={2}
                  hideSeeAll={activeTab !== 'all'}
                />

                {/* サブタイトル */}
                {allActiveLessons.length > 0 && (
                  <h3
                    style={{
                      fontFamily: styles.typography.fontFamily,
                      fontWeight: 500,
                      fontSize: "13px",
                      lineHeight: "32px",
                      color: styles.colors.titleText,
                      margin: 0,
                    }}
                  >
                    レッスン
                  </h3>
                )}
              </div>

              {/* レッスングリッド or Empty State */}
              {allActiveLessons.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    gap: styles.spacing.lessonGridGap,
                    alignItems: "flex-start",
                    width: "100%",
                  }}
                >
                  {displayedInProgressLessons.map((lesson, index) => (
                    <div key={`${lesson.title}-${index}`} style={{ flex: 1, minWidth: 0 }}>
                      <ProgressLesson
                        title={lesson.title}
                        progress={lesson.progress}
                        currentStep={lesson.currentStep}
                        iconImageUrl={lesson.iconImageUrl}
                        nextArticleUrl={lesson.nextArticleUrl}
                        onCardClick={() => handleCardClick(lesson.title)}
                        onNextArticleClick={lesson.nextArticleUrl ? () => handleNextArticleClick(lesson.nextArticleUrl!) : undefined}
                        showCompleteButton={'showCompleteButton' in lesson ? lesson.showCompleteButton : false}
                        onCompleteClick={'onCompleteClick' in lesson ? lesson.onCompleteClick : undefined}
                        isCompleting={'isCompleting' in lesson ? lesson.isCompleting : false}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State - 進行中 */
                <div
                  style={{
                    alignSelf: "stretch",
                    padding: "32px 16px",
                    backgroundColor: styles.colors.emptyStateBg,
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "14px",
                    color: "rgba(2, 8, 23, 1)",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      color: "#000000",
                      fontSize: "14px",
                      fontWeight: 500,
                      fontFamily: styles.typography.fontFamily,
                      lineHeight: "24px",
                    }}
                  >
                    デザインスキルの獲得を<br />はじめよう
                  </div>
                  <Link
                    to="/lessons"
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#FFFFFF",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      display: "inline-flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "4px",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      style={{
                        color: "#020817",
                        fontSize: "12px",
                        fontWeight: 700,
                        fontFamily: styles.typography.buttonFontFamily,
                        lineHeight: "24px",
                      }}
                    >
                      身につけるレッスンを探す
                    </span>
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* その他の進捗（進捗タブのみ、3つ目以降のレッスン + 完了済み） */}
          {activeTab === 'progress' && overflowLessons.length > 0 && (() => {
            const completedLessons = overflowLessons.filter(l => 'isCompleted' in l && l.isCompleted);
            const inProgressLessons = overflowLessons.filter(l => !('isCompleted' in l && l.isCompleted));

            return (
              <section
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: styles.spacing.sectionHeadingGap,
                  alignItems: "flex-start",
                  width: "100%",
                  flexShrink: 0,
                }}
              >
                <SectionHeading title="その他の進捗" />

                {/* 完了ブロック */}
                {completedLessons.length > 0 && (
                  <div style={{ width: "100%" }}>
                    <h3
                      style={{
                        fontFamily: styles.typography.fontFamily,
                        fontWeight: 500,
                        fontSize: "13px",
                        lineHeight: "32px",
                        color: styles.colors.titleText,
                        margin: 0,
                        marginBottom: "8px",
                      }}
                    >
                      完了
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
                        gap: styles.spacing.lessonGridGap,
                        width: "100%",
                      }}
                    >
                      {completedLessons.map((lesson, index) => (
                        <div
                          key={`completed-${lesson.title}-${index}`}
                          onClick={() => navigate(`/lessons/${lesson.lessonSlug}`)}
                          style={{
                            backgroundColor: styles.colors.cardBg,
                            borderRadius: "16px",
                            padding: "16px",
                            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                            cursor: "pointer",
                            transition: "box-shadow 0.2s",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img
                              src={lesson.iconImageUrl}
                              alt={lesson.title}
                              style={{
                                width: "48px",
                                height: "73px",
                                objectFit: "cover",
                                borderTopRightRadius: "8px",
                                borderBottomRightRadius: "8px",
                              }}
                            />
                            <div>
                              <h4
                                style={{
                                  fontFamily: styles.typography.fontFamily,
                                  fontSize: "16px",
                                  fontWeight: 700,
                                  color: styles.colors.titleText,
                                  margin: "0 0 4px 0",
                                }}
                              >
                                {lesson.title}
                              </h4>
                              <span
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#22C55E",
                                }}
                              >
                                ✓ 完了
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 取り組み中ブロック */}
                {inProgressLessons.length > 0 && (
                  <div style={{ width: "100%", marginTop: completedLessons.length > 0 ? "16px" : 0 }}>
                    <h3
                      style={{
                        fontFamily: styles.typography.fontFamily,
                        fontWeight: 500,
                        fontSize: "13px",
                        lineHeight: "32px",
                        color: styles.colors.titleText,
                        margin: 0,
                        marginBottom: "8px",
                      }}
                    >
                      取り組み中
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
                        gap: styles.spacing.lessonGridGap,
                        width: "100%",
                      }}
                    >
                      {inProgressLessons.map((lesson, index) => (
                        <div key={`inprogress-${lesson.title}-${index}`}>
                          <ProgressLesson
                            title={lesson.title}
                            progress={lesson.progress}
                            currentStep={lesson.currentStep}
                            iconImageUrl={lesson.iconImageUrl}
                            nextArticleUrl={'nextArticleUrl' in lesson ? lesson.nextArticleUrl : undefined}
                            onCardClick={() => handleCardClick(lesson.title)}
                            onNextArticleClick={'nextArticleUrl' in lesson && lesson.nextArticleUrl ? () => handleNextArticleClick(lesson.nextArticleUrl!) : undefined}
                            showCompleteButton={'showCompleteButton' in lesson ? lesson.showCompleteButton : false}
                            onCompleteClick={'onCompleteClick' in lesson ? lesson.onCompleteClick : undefined}
                            isCompleting={'isCompleting' in lesson ? lesson.isCompleting : false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })()}

          {/* お気に入りセクション */}
          {(activeTab === 'all' || activeTab === 'favorite') && (
            <section
              style={{
                display: "flex",
                flexDirection: "column",
                gap: styles.spacing.sectionHeadingGap,
                alignItems: "flex-start",
                width: "100%",
                flexShrink: 0,
              }}
            >
              {/* セクション見出し */}
              <SectionHeading
                title="お気に入り"
                onSeeAllClick={handleViewAllFavorite}
                totalCount={bookmarks.length}
                displayLimit={4}
                hideSeeAll={activeTab !== 'all'}
              />

              {/* お気に入りリスト or Empty State */}
              {bookmarks.length > 0 ? (
                <BookmarkList
                  articles={activeTab === 'all' ? bookmarks.slice(0, 4) : bookmarks}
                  emptyMessage=""
                  onRemoveBookmark={handleRemoveBookmark}
                />
              ) : (
                /* Empty State - お気に入り */
                <div
                  style={{
                    alignSelf: "stretch",
                    padding: "32px 16px",
                    backgroundColor: styles.colors.emptyStateBg,
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      color: "#000000",
                      fontSize: "14px",
                      fontWeight: 700,
                      fontFamily: styles.typography.fontFamily,
                      lineHeight: "24px",
                    }}
                  >
                    記事をお気に入りすると<br />こちらに表示されます
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 閲覧履歴セクション */}
          {(activeTab === 'all' || activeTab === 'history') && (
            <section
              style={{
                display: "flex",
                flexDirection: "column",
                gap: styles.spacing.sectionHeadingGap,
                alignItems: "flex-start",
                width: "100%",
                flexShrink: 0,
              }}
            >
              {/* セクション見出し */}
              {/* TODO: 閲覧履歴の件数が取得できたら totalCount と displayLimit を設定 */}
              <SectionHeading
                title="閲覧履歴"
                onSeeAllClick={handleViewAllHistory}
                hideSeeAll={activeTab !== 'all'}
              />

              {/* Empty State - 閲覧履歴（機能未実装のため常にEmpty） */}
              <div
                style={{
                  alignSelf: "stretch",
                  padding: "32px 16px",
                  backgroundColor: styles.colors.emptyStateBg,
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    color: "#000000",
                    fontSize: "14px",
                    fontWeight: 700,
                    fontFamily: styles.typography.fontFamily,
                    lineHeight: "24px",
                  }}
                >
                  記事を閲覧した履歴が<br />こちらに表示されます
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}
