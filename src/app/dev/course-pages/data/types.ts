/**
 * コースの元（データの形）— #241
 *
 * data/ ＝ コースごとに差し替える「中身」。このファイルはその形を決める。
 * template/ ＝ 全コース共通の「見た目」。この形を受け取って描画するだけ。
 *
 * kari: true の文言は推測で書いた仮の文。画面下のトグルで「仮」タグを表示して区別する。
 */

/** 文言＋仮フラグ（course-card-patterns の MockField と同じ形） */
export interface Field {
  text: string;
  kari?: boolean;
}

/** 既存レッスン（Sanity の slug で参照。タイトルや画像は Sanity から引く） */
export interface LessonRef {
  type: "lesson";
  slug: string;
}

/** 未制作レッスン（予定タイトルと概要だけを持つ） */
export interface PlannedLessonRef {
  type: "planned";
  title: Field;
  summary: Field;
}

export type CourseItem = LessonRef | PlannedLessonRef;

/** 小ゴール（ステップ）またはチャレンジ */
export interface CourseStep {
  kind: "goal" | "challenge";
  /** ステップ名（Figma のカリキュラム名） */
  title: Field;
  /** なぜやるのか（1文。控えめに見出しの下へ） */
  why: Field;
  /** 終えるとできるようになること（1文。ステップの最後にチェックポイントとして出す） */
  gain: Field;
  /** レッスンの並び（チャレンジにもレッスンがあれば入れる。お題の行と並べて出す） */
  items: CourseItem[];
  /** challenge のときのお題 */
  brief?: {
    description: Field;
    deliverables: Field[];
  };
}

export interface CourseChangeRow {
  before: Field;
  after: Field;
}

export interface CourseAudienceItem {
  title: Field;
  body: Field;
}

export interface CourseFaqItem {
  question: Field;
  answer: Field;
}

/** v2（完成形）で足す項目 — #242 問1の改善点 */
export interface CourseV2 {
  /** ヒーローのタイトル直下「こんな人向け」1行 */
  audienceLine: Field;
  /** 得られる変化（「〜できるようになり、その結果〜できる」の形。Figma 原文は Course.change に残す） */
  change: Field;
  /** FAQ に足す「向いていない人」 */
  notFor: CourseFaqItem;
  /** 修了したら次は: おすすめのコース */
  nextCourse: { slug: string; reason: Field };
  /** 修了したら次は: 転職ロードマップのどこまで来たか（モック） */
  roadmap: { position: number; total: number; note: Field };
}

export interface Course {
  slug: string;
  /** 正式タイトル。「：」の前を主見出し、後ろをサブ行として表示する */
  title: Field;
  /** コース名の短い呼び名（アイキャッチのラベル・カード用） */
  shortTitle: Field;
  /** ヒーローのひとこと説明 */
  tagline: Field;
  /** 得られる変化／期間／制作物（カードと共通の3点） */
  change: Field;
  period: Field;
  deliverable: Field;
  /** 目指す状態（受ける前 → 受けた後） */
  changeRows: CourseChangeRow[];
  /** コース全体のゴール（流れの終着点に出す1文） */
  finalGoal: Field;
  steps: CourseStep[];
  /** 制作するもの（最終お題）の詳細 */
  output: {
    lead: Field;
    points: Field[];
    /** 完成イメージ枠に並べる見本のラベル（3つ。画像ができるまでの仮） */
    samples?: string[];
  };
  audience: CourseAudienceItem[];
  author: {
    name: Field;
    role: Field;
    bio: Field;
    image: string;
  };
  faq: CourseFaqItem[];
  /** v2（完成形）用。入っているコースだけ /dev/course-pages/v2/[course] で見られる */
  v2?: CourseV2;
}

/** Sanity から引いたレッスンの表示用データ（template に渡す） */
export interface ResolvedLesson {
  slug: string;
  title: string;
  iconImageUrl: string | null;
  description: string | null;
  purposes: string[];
  questCount: number;
  articleCount: number;
  /** 記事の動画の長さ（videoDuration）の合計（分）。1本も取れなければ null */
  videoMinutes: number | null;
  /** 長さが取れた記事の数（articleCount より少なければ一部だけの合計） */
  videoTimedCount: number;
}

/** slug → 取得結果（見つからない・取得失敗は null） */
export type LessonMap = Record<string, ResolvedLesson | null>;

/** 進捗モック: slug → 完了した記事数（"all" は全記事、"half" は半分） */
export type ProgressMock = Record<string, number | "all" | "half">;
