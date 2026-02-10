export interface QuestionComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface QuestionItem {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  tags?: string[];
  comments: QuestionComment[];
  reactions: QuestionReactions;
}

const STORAGE_KEY = "bono-questions-prototype-v4";

const AVATAR_BY_USER: Record<string, string> = {
  "user-misaki": "/avatars/avatar-01.svg",
  "user-ryo": "/avatars/avatar-02.svg",
  "user-yui": "/avatars/avatar-03.svg",
  "user-tomo": "/avatars/avatar-04.svg",
  "user-aya": "/avatars/avatar-05.svg",
  "user-demo": "/avatars/avatar-06.svg",
};

const DEFAULT_AVATAR = "/avatars/avatar-07.svg";

const resolveAvatar = (authorId: string, avatar?: string): string => {
  return avatar || AVATAR_BY_USER[authorId] || DEFAULT_AVATAR;
};

export type ReactionKey = "cheer" | "thanks" | "insight";

export type QuestionReactions = {
  [key in ReactionKey]: number;
};

const defaultReactions = (): QuestionReactions => ({
  cheer: 0,
  thanks: 0,
  insight: 0,
});

const seedQuestions: QuestionItem[] = [
  {
    id: "q-001",
    title: "配色迷子です…みんなの決め方、教えてほしい",
    body:
      "学習用のダッシュボードを作っているのですが、色が全然決めきれず…。\n\n「安心できるトーン」にしたいと思って、ブルー系とグリーン系で2案作ってみました。読みやすさはOKなのに、どっちが“安心”っぽいのか自分では決めきれません。\n\nブランドカラーはまだなくて、ロゴはグレー基調。アクセントは1色だけにしようと思っています。\n\nみなさんなら、こういう時どうやって色相を決めますか？\n「アクセント1色で失敗しにくいコツ」があれば教えてほしいです。",
    authorId: "user-misaki",
    authorName: "みさき",
    authorAvatar: resolveAvatar("user-misaki"),
    createdAt: "2026-02-02T09:30:00+09:00",
    tags: ["配色", "UI"],
    reactions: {
      cheer: 4,
      thanks: 2,
      insight: 1,
    },
    comments: [
      {
        id: "c-001",
        authorId: "user-ryo",
        authorName: "りょう",
        authorAvatar: resolveAvatar("user-ryo"),
        content:
          "まずは目的（信頼/楽しさ/落ち着きなど）を決めて、色相の方向性を絞るのが早いです。最後に配色パターンを3つ作って比較すると決めやすいですよ。",
        createdAt: "2026-02-02T10:15:00+09:00",
      },
    ],
  },
  {
    id: "q-002",
    title: "Figmaのコンポ整理、途中からやるなら何から？",
    body:
      "途中からコンポーネントが増えすぎて、命名がバラバラになってきました…。今さらでもいいので、チームが迷わず使える状態に整えたいです。\n\nいまは40〜50個くらいあって、既存デザインはあまり崩せません。とりあえず命名ルールをメモ化して、Auto Layoutだけ軽く合わせたところです。\n\nみなさんなら、途中整理するときはどこから手を付けますか？\n「優先順位」や「分解の粒度の目安」があれば教えてください。",
    authorId: "user-yui",
    authorName: "ゆい",
    authorAvatar: resolveAvatar("user-yui"),
    createdAt: "2026-02-03T14:05:00+09:00",
    tags: ["Figma", "設計"],
    reactions: {
      cheer: 2,
      thanks: 0,
      insight: 3,
    },
    comments: [],
  },
  {
    id: "q-003",
    title: "ポートフォリオの並べ順、みんなならどうする？",
    body:
      "UI/UX転職用のポートフォリオを作ってます。面接官に「設計力がある」って伝わる並べ方にしたいのですが、順番でずっと悩んでます。\n\n構成は、実案件2つ＋個人制作2つ。実案件は守秘の関係で詳細が出せません。\n今は「実案件→個人制作」の順にする案と、逆に「個人制作で世界観を見せる案」で迷っています。\n\nみなさんなら、1番目に置く作品はどう選びますか？\n守秘案件の見せ方の工夫もあれば知りたいです。",
    authorId: "user-tomo",
    authorName: "とも",
    authorAvatar: resolveAvatar("user-tomo"),
    createdAt: "2026-02-04T11:20:00+09:00",
    tags: ["ポートフォリオ", "転職"],
    reactions: {
      cheer: 1,
      thanks: 1,
      insight: 2,
    },
    comments: [
      {
        id: "c-002",
        authorId: "user-aya",
        authorName: "あや",
        authorAvatar: resolveAvatar("user-aya"),
        content:
          "最初に一番強い案件を置くのがおすすめです。あとは課題の種類が被らないように並べると、幅がある印象になります。",
        createdAt: "2026-02-04T12:10:00+09:00",
      },
    ],
  },
];

const createId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

const normalizeQuestions = (questions: QuestionItem[]): QuestionItem[] => {
  return questions.map((question) => ({
    ...question,
    authorAvatar: resolveAvatar(question.authorId, question.authorAvatar),
    reactions: {
      ...defaultReactions(),
      ...(question.reactions || {}),
    },
    comments: question.comments.map((comment) => ({
      ...comment,
      authorAvatar: resolveAvatar(comment.authorId, comment.authorAvatar),
    })),
  }));
};

const loadFromStorage = (): QuestionItem[] => {
  if (typeof window === "undefined") {
    return normalizeQuestions(seedQuestions);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = normalizeQuestions(seedQuestions);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as QuestionItem[];
    if (!Array.isArray(parsed)) {
      return normalizeQuestions(seedQuestions);
    }
    return normalizeQuestions(parsed);
  } catch (error) {
    console.error("Failed to parse questions prototype data:", error);
    return normalizeQuestions(seedQuestions);
  }
};

const saveToStorage = (questions: QuestionItem[]) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
};

export const getPrototypeQuestions = (): QuestionItem[] => loadFromStorage();

export const getPrototypeQuestionById = (questionId: string): QuestionItem | undefined => {
  const questions = loadFromStorage();
  return questions.find((question) => question.id === questionId);
};

export const createPrototypeQuestion = (params: {
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
}): QuestionItem => {
  const questions = loadFromStorage();
  const newQuestion: QuestionItem = {
    id: createId(),
    title: params.title,
    body: params.body,
    authorId: params.authorId,
    authorName: params.authorName,
    authorAvatar: resolveAvatar(params.authorId, params.authorAvatar),
    createdAt: new Date().toISOString(),
    comments: [],
    reactions: defaultReactions(),
  };
  const next = [newQuestion, ...questions];
  saveToStorage(next);
  return newQuestion;
};

export const addPrototypeComment = (params: {
  questionId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
}): QuestionItem | undefined => {
  const questions = loadFromStorage();
  const next = questions.map((question) => {
    if (question.id !== params.questionId) return question;

    const newComment: QuestionComment = {
      id: createId(),
      authorId: params.authorId,
      authorName: params.authorName,
      authorAvatar: resolveAvatar(params.authorId, params.authorAvatar),
      content: params.content,
      createdAt: new Date().toISOString(),
    };

    return {
      ...question,
      comments: [...question.comments, newComment],
    };
  });

  saveToStorage(next);
  return next.find((question) => question.id === params.questionId);
};

export const updatePrototypeComment = (params: {
  questionId: string;
  commentId: string;
  content: string;
}): QuestionItem | undefined => {
  const questions = loadFromStorage();
  const next = questions.map((question) => {
    if (question.id !== params.questionId) return question;

    const comments = question.comments.map((comment) => {
      if (comment.id !== params.commentId) return comment;
      return {
        ...comment,
        content: params.content,
        updatedAt: new Date().toISOString(),
      };
    });

    return {
      ...question,
      comments,
    };
  });

  saveToStorage(next);
  return next.find((question) => question.id === params.questionId);
};

export const deletePrototypeComment = (params: {
  questionId: string;
  commentId: string;
}): QuestionItem | undefined => {
  const questions = loadFromStorage();
  const next = questions.map((question) => {
    if (question.id !== params.questionId) return question;

    return {
      ...question,
      comments: question.comments.filter((comment) => comment.id !== params.commentId),
    };
  });

  saveToStorage(next);
  return next.find((question) => question.id === params.questionId);
};

export const addPrototypeReaction = (params: {
  questionId: string;
  reaction: ReactionKey;
}): QuestionItem | undefined => {
  const questions = loadFromStorage();
  const next = questions.map((question) => {
    if (question.id !== params.questionId) return question;

    return {
      ...question,
      reactions: {
        ...question.reactions,
        [params.reaction]: (question.reactions[params.reaction] || 0) + 1,
      },
    };
  });

  saveToStorage(next);
  return next.find((question) => question.id === params.questionId);
};
