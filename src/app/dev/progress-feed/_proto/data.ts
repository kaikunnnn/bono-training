/**
 * フェーズ2（今のBONOのページに組み込んだプロト）用のダミーデータ（#251）
 *
 * コンテンツ名は前回の _data.ts（CONTENTS / INITIAL_POSTS）とそろえている。
 * BONOの構造どおり「レッスン > クエスト > 記事」で持つ。
 * - Figma入門 のクエスト1は記事2本。1本目は完了済みなので、2本目（フレームとレイヤーの基本）を
 *   終えるとクエスト完了＝節目になり、みんなの進捗に流れる
 * - クエスト2の記事を終えても記事1本だけの完了（トースト）なので流れない
 */

export const PROTO_BASE = "/dev/progress-feed";
export const PROTO_MYPAGE = `${PROTO_BASE}/mypage`;
export const PROTO_TOP = `${PROTO_BASE}/top`;
export const PROTO_FEED_TAB = `${PROTO_MYPAGE}?tab=feed`;

/** 自分の投稿のID。通知の戻り先は #post-mine */
export const MINE_POST_ID = "mine";
export const MINE_POST_HREF = `${PROTO_FEED_TAB}#post-${MINE_POST_ID}`;

export type ProtoArticleType = "explain" | "intro" | "practice" | "challenge" | "demo";

export interface ProtoArticle {
  id: string;
  slug: string;
  title: string;
  articleType: ProtoArticleType;
  excerpt: string;
  /** 目安時間（分） */
  minutes: number;
}

export interface ProtoQuest {
  id: string;
  questNumber: number;
  title: string;
  articles: ProtoArticle[];
}

export interface ProtoLesson {
  id: string;
  slug: string;
  title: string;
  iconImageUrl: string;
  quests: ProtoQuest[];
}

const LESSON_ICON = "/images/top/course-lesson-thumb.png";

export const PROTO_LESSONS: ProtoLesson[] = [
  {
    id: "lesson-figma",
    slug: "figma-basic",
    title: "Figma入門",
    iconImageUrl: LESSON_ICON,
    quests: [
      {
        id: "quest-figma-1",
        questNumber: 1,
        title: "Figmaにさわってみる",
        articles: [
          {
            id: "a-figma-screen",
            slug: "figma-screen",
            title: "Figmaの画面の見方",
            articleType: "intro",
            excerpt: "ツールバー・レイヤーパネル・プロパティパネルの役割を、実際の画面を見ながら確認します。",
            minutes: 10,
          },
          {
            id: "a-frame-and-layer",
            slug: "frame-and-layer",
            title: "フレームとレイヤーの基本",
            articleType: "explain",
            excerpt: "画面の土台になるフレームと、その中に重なるレイヤーの関係を、手を動かしながら覚えます。",
            minutes: 15,
          },
        ],
      },
      {
        id: "quest-figma-2",
        questNumber: 2,
        title: "レイアウトを組む",
        articles: [
          {
            id: "a-auto-layout",
            slug: "auto-layout",
            title: "オートレイアウトを使う",
            articleType: "explain",
            excerpt: "ボタンやリストを、中身に合わせて伸び縮みするように組む方法を学びます。",
            minutes: 20,
          },
          {
            id: "a-components",
            slug: "components",
            title: "コンポーネントを作る",
            articleType: "practice",
            excerpt: "何度も使う部品をコンポーネントにして、まとめて直せるようにします。",
            minutes: 25,
          },
        ],
      },
    ],
  },
  {
    id: "lesson-visual",
    slug: "ui-visual-basic",
    title: "UIビジュアル基礎",
    iconImageUrl: LESSON_ICON,
    quests: [
      {
        id: "quest-visual-1",
        questNumber: 1,
        title: "見やすさの基本",
        articles: [
          {
            id: "a-visual-size",
            slug: "visual-size",
            title: "文字の大きさで強弱をつける",
            articleType: "explain",
            excerpt: "見出しと本文の大きさの差で、どこから読めばいいかが伝わる画面にします。",
            minutes: 15,
          },
          {
            id: "a-visual-spacing",
            slug: "visual-spacing",
            title: "余白でまとまりを作る",
            articleType: "explain",
            excerpt: "近いものは近く、違うものは離す。余白だけで情報のまとまりを見せる方法を学びます。",
            minutes: 20,
          },
          {
            id: "a-visual-color",
            slug: "visual-color",
            title: "色の数をしぼる",
            articleType: "practice",
            excerpt: "使う色を3つまでにしぼって、目立たせたい場所だけが目に入るようにします。",
            minutes: 20,
          },
        ],
      },
      {
        id: "quest-visual-2",
        questNumber: 2,
        title: "ひとつの画面にまとめる",
        articles: [
          {
            id: "a-visual-profile",
            slug: "visual-profile",
            title: "プロフィール画面を整える",
            articleType: "challenge",
            excerpt: "ここまでの文字・余白・色のルールを使って、崩れたプロフィール画面を整えます。",
            minutes: 30,
          },
        ],
      },
    ],
  },
];

/** はじめから完了している記事（BONOを始めて2週目、各レッスン1本ずつ進めた想定） */
export const INITIAL_COMPLETED_ARTICLE_IDS = ["a-figma-screen", "a-visual-size"];

/** 体験の主役になる記事（クエスト1の最後の記事＝終えると節目） */
export const MILESTONE_ARTICLE_SLUG = "frame-and-layer";

export function articleHref(slug: string): string {
  return `${PROTO_BASE}/contents/${slug}`;
}

export interface ArticleLookup {
  lesson: ProtoLesson;
  quest: ProtoQuest;
  article: ProtoArticle;
  /** クエスト内での順番（1始まり） */
  indexInQuest: number;
}

export function findArticleBySlug(slug: string): ArticleLookup | null {
  for (const lesson of PROTO_LESSONS) {
    for (const quest of lesson.quests) {
      const i = quest.articles.findIndex((a) => a.slug === slug);
      if (i >= 0) return { lesson, quest, article: quest.articles[i], indexInQuest: i + 1 };
    }
  }
  return null;
}

export function findLesson(id: string): ProtoLesson | undefined {
  return PROTO_LESSONS.find((l) => l.id === id);
}

export function allArticles(lesson: ProtoLesson): ProtoArticle[] {
  return lesson.quests.flatMap((q) => q.articles);
}

export function lessonPercentage(lesson: ProtoLesson, completed: string[]): number {
  const all = allArticles(lesson);
  if (all.length === 0) return 0;
  const done = all.filter((a) => completed.includes(a.id)).length;
  return Math.round((done / all.length) * 100);
}

export function firstIncompleteArticle(lesson: ProtoLesson, completed: string[]): ProtoArticle | null {
  return allArticles(lesson).find((a) => !completed.includes(a.id)) ?? null;
}

export function prevNextArticles(lesson: ProtoLesson, slug: string) {
  const all = allArticles(lesson);
  const i = all.findIndex((a) => a.slug === slug);
  return {
    previous: i > 0 ? { slug: all[i - 1].slug, title: all[i - 1].title } : undefined,
    next: i >= 0 && i < all.length - 1 ? { slug: all[i + 1].slug, title: all[i + 1].title } : undefined,
  };
}

/** お気に入り・閲覧履歴の見た目用ダミー（押しても実ページには飛ばさない） */
export const DUMMY_BOOKMARKS = [
  { id: "b1", title: "オートレイアウトを使う", lessonTitle: "Figma入門", slug: "auto-layout" },
  { id: "b2", title: "色の数をしぼる", lessonTitle: "UIビジュアル基礎", slug: "visual-color" },
];

export const DUMMY_HISTORY = [
  { id: "h1", title: "Figmaの画面の見方", lessonTitle: "Figma入門", slug: "figma-screen", ago: "昨日" },
  { id: "h2", title: "文字の大きさで強弱をつける", lessonTitle: "UIビジュアル基礎", slug: "visual-size", ago: "2日前" },
  { id: "h3", title: "余白でまとまりを作る", lessonTitle: "UIビジュアル基礎", slug: "visual-spacing", ago: "3日前" },
];
