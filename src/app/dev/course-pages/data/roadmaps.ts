/**
 * data ＝ ロードマップ（行き先）6本 — #243
 *
 * ロードマップ＝地図。レッスンは並べず、コースとコース外のやることを並べる。
 * 区切りは3種類
 * - course: 既存のコース（slug で参照。詳細は v2 のコースページへ）
 * - planned-course: まだないコース（「準備中のコース」）
 * - outside: コースの外でやること（ポートフォリオ、フィードバック、転職活動など）
 * 行き先・区切りは issue 243 のたたき台どおり。文言はすべて推測（kari）。
 */

import type { Field } from "./types";

const k = (text: string): Field => ({ text, kari: true });

export type RoadmapStop =
  | { type: "course"; slug: string; note: Field }
  | { type: "planned-course"; title: string; note: Field }
  | {
      type: "outside";
      kind: "portfolio" | "feedback" | "job";
      title: string;
      href: string;
      note: Field;
    };

export interface Roadmap {
  slug: string;
  /** 行き先の名前 */
  name: string;
  /** 誰向け1行 */
  audience: Field;
  /** このロードマップを進むとどうなれるか（到達する状態） */
  outcome: Field;
  /** 期間の目安 */
  period: Field;
  stops: RoadmapStop[];
  /** ?progress=1 のモック: 終えた区切りの数（この次の区切りが「いまここ」） */
  progressDone: number;
}

export const ROADMAP_BASE = "/dev/course-pages/prototyping/roadmap";

/** 区切りの短い名前（コースの slug → 呼び名）。course データとの循環 import を避けるためここに持つ */
export const COURSE_SHORT: Record<string, string> = {
  "ui-design-first": "はじめて",
  "ui-design-visual": "基礎",
  "ui-experience": "体験",
  "ai-ui-design": "AI×UI入門",
};

const PORTFOLIO = { type: "outside", kind: "portfolio", title: "ポートフォリオ", href: "/lessons/portfolio" } as const;
const FEEDBACK = { type: "outside", kind: "feedback", title: "15分フィードバック", href: "/feedback-apply" } as const;
const JOB = {
  type: "outside",
  kind: "job",
  title: "転職活動",
  href: "https://kaikun.bo-no.design/career/beginner",
} as const;

export const roadmaps: Roadmap[] = [
  {
    slug: "career-change",
    name: "未経験から転職",
    audience: k("デザインの仕事はしたことがなく、UIデザイナーとして転職したい人"),
    outcome: k(
      "画面の見た目と構造、使う流れまでを自分で設計でき、その過程をポートフォリオで説明して、UIデザイナーとして応募できる状態になります。"
    ),
    period: k("6ヶ月〜1年"),
    progressDone: 1,
    stops: [
      { type: "course", slug: "ui-design-first", note: k("Figmaで1画面をつくりきり、画面を構造と部品で組み立てる土台をつくる") },
      { type: "course", slug: "ui-design-visual", note: k("良いデザインを分解して学ぶ習慣と、見た目の6要素で画面を整える") },
      { type: "course", slug: "ui-experience", note: k("一覧・詳細・編集の流れと操作への反応を設計し、サービスとして使える画面にする") },
      { ...PORTFOLIO, note: k("3つのコースでつくったものを、考えた過程が伝わる形にまとめる。仕上げ前にフィードバックをもらう") },
      { ...JOB, note: k("応募先の選び方、書類、面接での説明の仕方を準備して応募する") },
    ],
  },
  {
    slug: "web-graphic-to-ui",
    name: "Web・グラフィックから転職",
    audience: k("Webデザインやグラフィックの経験があり、UIデザイナーに移りたい人"),
    outcome: k(
      "見た目をつくる力はそのままに、画面の流れと情報の整理を設計できるようになり、UIデザイナーとして応募できるポートフォリオがそろいます。"
    ),
    period: k("4〜8ヶ月"),
    progressDone: 1,
    stops: [
      { type: "course", slug: "ui-design-visual", note: k("見た目の基本はおさらい程度に。UIならではの余白・文字・部品の決まりを確かめる") },
      { type: "course", slug: "ui-experience", note: k("Webページとの一番の違いである、操作と画面遷移の設計を身につける") },
      { type: "planned-course", title: "情報設計", note: k("情報の分け方と並べ方を決めて、迷わないサービスの骨組みをつくる") },
      { ...PORTFOLIO, note: k("これまでの制作物とUIの制作物を、UIデザイナーとしての強みが伝わる順に並べ直す") },
      { ...JOB, note: k("経験を活かせる応募先を選び、UIに移る理由を言葉にして応募する") },
    ],
  },
  {
    slug: "ai-design",
    name: "AIを使いデザイン力を上げたい",
    audience: k("UIデザインの仕事や学習の中で、AIを使ってつくれるものと速さを広げたい人"),
    outcome: k(
      "AIに指示して動くプロトタイプをつくり、その出力を自分の目で判断して直せるようになり、デザインの質と速さの両方を上げられる状態になります。"
    ),
    period: k("3〜6ヶ月"),
    progressDone: 1,
    stops: [
      { type: "course", slug: "ai-ui-design", note: k("CursorとClaude Codeで、細かい動きまでコードで動くプロトタイプをつくる") },
      { type: "course", slug: "ui-design-visual", note: k("AIが出した画面を「なんとなく良い」で採用しないために、見た目を判断する目を持つ") },
      { type: "planned-course", title: "AIで実装の発展", note: k("デザインシステムやデータを扱う画面まで、AIと一緒に実装の範囲を広げる") },
    ],
  },
  {
    slug: "strong-portfolio",
    name: "強いポートフォリオで転職",
    audience: k("UIデザイナーとして働いていて、より良い環境へ転職したい現場のデザイナー"),
    outcome: k(
      "ユーザーの課題から考えた過程と、それを人に伝えて合意をとった経験を、選考で評価されるポートフォリオとして見せられる状態になります。"
    ),
    period: k("3〜6ヶ月"),
    progressDone: 0,
    stops: [
      { type: "planned-course", title: "ユーザー中心のデザイン", note: k("自分の仕事を、ユーザーの課題から考えた過程として説明できるようにする") },
      { type: "planned-course", title: "提案力", note: k("デザインの判断を、根拠と選択肢をそろえて人に伝える") },
      { ...PORTFOLIO, note: k("仕事の成果ではなく、考えた過程と判断が伝わる構成で作り直す") },
    ],
  },
  {
    slug: "user-centered",
    name: "ユーザー中心でサービス価値をデザイン",
    audience: k("見た目だけでなく、使う人の課題から価値のあるサービスを考えたい人"),
    outcome: k(
      "ユーザーを調べて課題と理想の体験を決め、それを画面の構造と情報設計に落とし込めるようになり、サービスの価値から考えるデザイナーになれます。"
    ),
    period: k("4〜8ヶ月"),
    progressDone: 0,
    stops: [
      { type: "planned-course", title: "UX基礎", note: k("ユーザーを調べて、困りごとと理想の体験を言葉にする") },
      { type: "planned-course", title: "ペルソナ中心のUIデザイン", note: k("ペルソナの課題と配慮から、画面の体験をつくって評価する") },
      { type: "planned-course", title: "情報設計", note: k("体験を支える情報の分け方と並べ方を設計する") },
    ],
  },
  {
    slug: "proposal",
    name: "自分のデザインの提案力を強くしたい",
    audience: k("つくったデザインを、チームやクライアントに納得してもらう場面で苦労している人"),
    outcome: k(
      "デザインの進め方と判断の根拠を自分の言葉で説明でき、複数案を比べて提案し、合意をとってから次へ進められる状態になります。"
    ),
    period: k("3〜6ヶ月"),
    progressDone: 0,
    stops: [
      { type: "planned-course", title: "デザインの進め方", note: k("調べる→考える→つくる→見直すの流れを、人に見せられる形で進める") },
      { type: "planned-course", title: "ペルソナ中心のUIデザイン", note: k("誰のどんな課題のための案かを、判断の根拠として持つ") },
      { type: "planned-course", title: "提案・見せ方", note: k("案の比べ方、資料の組み立て、話す順番で、納得してもらえる提案にする") },
    ],
  },
];

export function getRoadmap(slug: string): Roadmap | null {
  return roadmaps.find((r) => r.slug === slug) ?? null;
}

export function stopLabel(stop: RoadmapStop): string {
  if (stop.type === "course") return COURSE_SHORT[stop.slug] ?? stop.slug;
  return stop.title;
}

/** コースの v2「修了したら次は」で使う形（名前・詳細ページ・区切りの呼び名） */
export interface RoadmapPath {
  name: string;
  href: string;
  stops: string[];
}

function toPath(slug: string): RoadmapPath {
  const r = getRoadmap(slug)!;
  return { name: r.name, href: `${ROADMAP_BASE}/${r.slug}`, stops: r.stops.map(stopLabel) };
}

/** 未経験から転職: はじめて → 基礎 → 体験 → （ポートフォリオ）→ 転職活動 */
export const careerChangeRoadmap = toPath("career-change");

/** AIを使いデザイン力を上げたい: AI → 基礎 → （AIで実装の発展） */
export const aiDesignRoadmap = toPath("ai-design");

export { FEEDBACK };
