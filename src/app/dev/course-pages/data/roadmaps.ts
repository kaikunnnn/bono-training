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

/** 区切りに共通の文言: 何をするか／なぜこの順番か／次へ進んでよい目安 */
interface StopText {
  note: Field;
  /** なぜこの順番か（1行） */
  whyHere: Field;
  /** 終えたら次へ進んでよい目安（チェックポイント、1行） */
  checkpoint: Field;
}

export type OutsideKind = "portfolio" | "feedback" | "job";

export type RoadmapStop =
  | ({ type: "course"; slug: string } & StopText)
  | ({ type: "planned-course"; title: string } & StopText)
  | ({
      type: "outside";
      kind: OutsideKind;
      title: string;
      href: string;
    } & StopText);

/** コースの外でやること（道しるべ）の短いガイド */
export interface RoadmapGuide {
  kind: OutsideKind;
  title: string;
  /** 2〜3行 */
  body: Field;
  links: { label: string; href: string }[];
}

export interface RoadmapFaq {
  question: Field;
  answer: Field;
}

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
  /** 自分に合うか: 向いている人／別の行き先が合う人（slug で別のロードマップへ） */
  fit: { good: Field[]; other: { text: Field; slug: string }[] };
  /** たどり着いたときの姿: できること3つ＋手元に残るもの */
  arrival: { can: Field[]; keep: Field };
  /** コースの外でやること（道しるべ） */
  guides: RoadmapGuide[];
  /** 進め方の目安: 週の時間別の期間 */
  pace: { hours: string; period: Field }[];
  /** よくある迷い（4つ） */
  faq: RoadmapFaq[];
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
const FEEDBACK = { type: "outside", kind: "feedback", title: "15分フィードバック", href: "/how-to/feedback" } as const;
const JOB = {
  type: "outside",
  kind: "job",
  title: "転職活動",
  href: "https://kaikun.bo-no.design/career/beginner",
} as const;

const CAREER_GUIDE_URL = JOB.href;

const GUIDE_PORTFOLIO: RoadmapGuide = {
  kind: "portfolio",
  title: "ポートフォリオ",
  body: k("画面を並べるだけでなく、誰の何のためにどう考えたかを1作品ずつ書きます。まず1作品を仕上げてから、2つ目に広げます。"),
  links: [
    { label: "ポートフォリオのレッスン", href: "/lessons/portfolio" },
    { label: "作品を見せ合うイベント", href: "/events" },
  ],
};
const GUIDE_FEEDBACK: RoadmapGuide = {
  kind: "feedback",
  title: "フィードバック",
  body: k("仕上げる前に、現役のデザイナーに15分見てもらえます。直す場所が分かると、ひとりで迷う時間が減ります。"),
  links: [{ label: "15分フィードバックの使い方", href: "/how-to/feedback" }],
};
const GUIDE_JOB: RoadmapGuide = {
  kind: "job",
  title: "転職活動",
  body: k("応募先の選び方、書類、面接で作品を話す順番を準備します。ポートフォリオが1作品できた時点で、求人を見始めて構いません。"),
  links: [
    { label: "転職の進め方ガイド", href: CAREER_GUIDE_URL },
    { label: "転職の相談ができるイベント", href: "/events" },
  ],
};

/** よくある迷い（質問は4本とも共通。答えはロードマップごと） */
const CHANGE_ANSWER = k(
  "終えたコースは、ほかのロードマップでも完了のまま数えます。行き先を選び直すと、残りの区切りが新しい順番で並びます。"
);
function faq(skip: string, experienced: string, ai: string): RoadmapFaq[] {
  return [
    { question: k("順番を飛ばして進めてもいい？"), answer: k(skip) },
    { question: k("すでに経験がある場合は？"), answer: k(experienced) },
    { question: k("AIはいつ学べばいい？"), answer: k(ai) },
    { question: k("途中で行き先を変えたくなったら？"), answer: CHANGE_ANSWER },
  ];
}

const pace = (five: string, ten: string) => [
  { hours: "週5時間", period: k(five) },
  { hours: "週10時間", period: k(ten) },
];

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
      {
        type: "course",
        slug: "ui-design-first",
        note: k("Figmaで1画面をつくりきり、画面を構造と部品で組み立てる土台をつくる"),
        whyHere: k("Figmaの操作と画面の組み立て方が分からないと、次の見た目の練習で手が止まるため"),
        checkpoint: k("見本を見ずに、ログイン画面を1枚Figmaでつくれる"),
      },
      {
        type: "course",
        slug: "ui-design-visual",
        note: k("良いデザインを分解して学ぶ習慣と、見た目の6要素で画面を整える"),
        whyHere: k("画面を組めるようになったら、次は「整って見える理由」が分かるようにするため"),
        checkpoint: k("好きなアプリの画面を1枚選び、余白と文字の決まりを書き出せる"),
      },
      {
        type: "course",
        slug: "ui-experience",
        note: k("一覧・詳細・編集の流れと操作への反応を設計し、サービスとして使える画面にする"),
        whyHere: k("1枚の画面が整ったら、画面と画面のつながりを考える段階に進むため"),
        checkpoint: k("一覧から詳細、編集までの流れをプロトタイプで動かせる"),
      },
      {
        ...PORTFOLIO,
        note: k("3つのコースでつくったものを、考えた過程が伝わる形にまとめる。仕上げ前にフィードバックをもらう"),
        whyHere: k("3つのコースの制作物がそろってからまとめる方が、見せられる中身が多いため"),
        checkpoint: k("フィードバックの指摘を直し、1作品を人に見せられる形にしている"),
      },
      {
        ...JOB,
        note: k("応募先の選び方、書類、面接での説明の仕方を準備して応募する"),
        whyHere: k("ポートフォリオが見せられる状態なら、面接で話す材料がそろっているため"),
        checkpoint: k("応募したい会社を5社選び、書類を出している"),
      },
    ],
    fit: {
      good: [
        k("今の仕事を続けながら、週に数時間ずつ学ぶ時間をつくれる人"),
        k("何から手をつければいいか分からず、順番ごと決めてほしい人"),
      ],
      other: [
        { text: k("バナーやWebサイトをつくった経験がある"), slug: "web-graphic-to-ui" },
        { text: k("転職より、今の仕事でAIを使ってつくれるものを増やしたい"), slug: "ai-design" },
      ],
    },
    arrival: {
      can: [
        k("Figmaで、一覧・詳細・編集の画面をそろえて設計できる"),
        k("良いデザインを見て、余白や文字のどこが効いているかを言葉にできる"),
        k("なぜその画面にしたのかを、面接で順を追って説明できる"),
      ],
      keep: k("3つのコースでつくった画面と、考えた過程をまとめたポートフォリオ"),
    },
    guides: [GUIDE_PORTFOLIO, GUIDE_FEEDBACK, GUIDE_JOB],
    pace: pace("約9ヶ月", "約5ヶ月"),
    faq: faq(
      "前のコースでつくった画面を次のコースで使うので、順に進めるのがおすすめです。区切りの目安ができていれば、先へ進んで構いません。",
      "Figmaで画面をつくったことがあれば、最初のコースは目安ができるか確かめる程度にして、基礎のコースから始めて構いません。",
      "3つのコースを終えてからがおすすめです。見た目を判断できるようになると、AIが出した画面を自分で直せます。"
    ),
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
      {
        type: "course",
        slug: "ui-design-visual",
        note: k("見た目の基本はおさらい程度に。UIならではの余白・文字・部品の決まりを確かめる"),
        whyHere: k("見た目の力はすでにあるので、UIならではの決まりだけを先に確かめるため"),
        checkpoint: k("ボタンや入力欄の大きさと余白の決まりを、自分の言葉で説明できる"),
      },
      {
        type: "course",
        slug: "ui-experience",
        note: k("Webページとの一番の違いである、操作と画面遷移の設計を身につける"),
        whyHere: k("WebページとUIで一番違う、操作と画面遷移を早めに身につけるため"),
        checkpoint: k("押したときの反応と次の画面を、プロトタイプで見せられる"),
      },
      {
        type: "planned-course",
        title: "情報設計",
        note: k("情報の分け方と並べ方を決めて、迷わないサービスの骨組みをつくる"),
        whyHere: k("画面の流れが分かったら、その土台になる情報の整理に進むため"),
        checkpoint: k("メニューの分け方を、理由とあわせて図にできる"),
      },
      {
        ...PORTFOLIO,
        note: k("これまでの制作物とUIの制作物を、UIデザイナーとしての強みが伝わる順に並べ直す"),
        whyHere: k("UIの制作物がそろってから並べ直すと、強みが伝わりやすいため"),
        checkpoint: k("最初の3作品で、UIデザイナーとしての強みが伝わる順になっている"),
      },
      {
        ...JOB,
        note: k("経験を活かせる応募先を選び、UIに移る理由を言葉にして応募する"),
        whyHere: k("UIの作品がそろうと、移りたい理由を作品と一緒に話せるため"),
        checkpoint: k("UIに移りたい理由を1分で話せて、応募を始めている"),
      },
    ],
    fit: {
      good: [
        k("バナーやLPはつくれるが、アプリの画面はつくったことがない人"),
        k("今までの制作物を活かして、UIデザイナーの求人に応募したい人"),
      ],
      other: [
        { text: k("デザインの仕事をしたことがない"), slug: "career-change" },
        { text: k("見た目より、使う人の課題から考える力をつけたい"), slug: "user-centered" },
      ],
    },
    arrival: {
      can: [
        k("Webページとの違いをふまえて、操作のある画面を設計できる"),
        k("情報を分けて並べ、迷わない画面の骨組みをつくれる"),
        k("これまでの経験をUIの仕事にどう活かすかを説明できる"),
      ],
      keep: k("今までの制作物と、新しくつくったUIの画面を並べ直したポートフォリオ"),
    },
    guides: [GUIDE_PORTFOLIO, GUIDE_FEEDBACK, GUIDE_JOB],
    pace: pace("約7ヶ月", "約4ヶ月"),
    faq: faq(
      "見た目のコースは、目安ができると感じたら飛ばして構いません。体験のコースは、Webページとの違いが一番出るので飛ばさないのがおすすめです。",
      "アプリの画面をつくった経験があれば、体験のコースの最後の制作物から始めて、足りないところだけ戻る進め方もできます。",
      "体験のコースを終えたあたりがおすすめです。画面の流れを自分で決められると、AIに頼む範囲もはっきりします。"
    ),
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
      {
        type: "course",
        slug: "ai-ui-design",
        note: k("CursorとClaude Codeで、細かい動きまでコードで動くプロトタイプをつくる"),
        whyHere: k("まず手を動かして、AIで何ができるかを体で知るため"),
        checkpoint: k("自分のアイデアを1つ、AIと一緒に動くプロトタイプにできている"),
      },
      {
        type: "course",
        slug: "ui-design-visual",
        note: k("AIが出した画面を「なんとなく良い」で採用しないために、見た目を判断する目を持つ"),
        whyHere: k("判断する目がないと、つくる量だけ増えて質が上がらないため"),
        checkpoint: k("AIが出した画面の、余白と文字のおかしな所を3つ挙げられる"),
      },
      {
        type: "planned-course",
        title: "AIで実装の発展",
        note: k("デザインシステムやデータを扱う画面まで、AIと一緒に実装の範囲を広げる"),
        whyHere: k("判断する目がついてから扱う範囲を広げる方が、やり直しが少ないため"),
        checkpoint: k("部品をそろえたまま、5画面以上をAIと一緒に実装できる"),
      },
    ],
    fit: {
      good: [
        k("UIデザインの基本は分かっていて、AIで手を速くしたい人"),
        k("Figmaの静止画だけでなく、動くもので確かめたい人"),
      ],
      other: [
        { text: k("UIデザインをこれから始める"), slug: "career-change" },
        { text: k("AIより、つくった案を説明して通す力をつけたい"), slug: "proposal" },
      ],
    },
    arrival: {
      can: [
        k("CursorやClaude Codeに指示して、動くプロトタイプをつくれる"),
        k("AIが出した画面のどこが良くないかを見つけて直せる"),
        k("部品の決まりをAIに渡して、そろった画面をつくれる"),
      ],
      keep: k("自分で触って動かせるプロトタイプと、AIへの指示の記録"),
    },
    guides: [GUIDE_PORTFOLIO, GUIDE_FEEDBACK],
    pace: pace("約5ヶ月", "約3ヶ月"),
    faq: faq(
      "AIのコースから始めるのがおすすめですが、AIの出力に違和感があって直せないと感じたら、先に見た目のコースへ進んでも構いません。",
      "仕事でUIをつくっていれば、見た目のコースは目安ができるか確かめる程度で十分です。",
      "このロードマップは最初からAIを使います。見た目のコースを挟むのは、AIの出力を自分で判断できるようにするためです。"
    ),
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
      {
        type: "planned-course",
        title: "ユーザー中心のデザイン",
        note: k("自分の仕事を、ユーザーの課題から考えた過程として説明できるようにする"),
        whyHere: k("選考で聞かれる「なぜそうしたか」の土台が、ユーザーの課題だから"),
        checkpoint: k("担当した画面1つを、誰のどんな困りごとのためか説明できる"),
      },
      {
        type: "planned-course",
        title: "提案力",
        note: k("デザインの判断を、根拠と選択肢をそろえて人に伝える"),
        whyHere: k("課題が言えるようになったら、次はそれを人に伝える形にするため"),
        checkpoint: k("1つの画面について、2案を比べて選んだ理由を話せる"),
      },
      {
        ...PORTFOLIO,
        note: k("仕事の成果ではなく、考えた過程と判断が伝わる構成で作り直す"),
        whyHere: k("説明する材料がそろってから作り直す方が、やり直しが少ないため"),
        checkpoint: k("作品ごとに、課題→判断→結果の順でまとまっている"),
      },
    ],
    fit: {
      good: [
        k("UIデザイナーとして1年以上働き、作品はあるのに書類で落ちることが多い人"),
        k("担当した仕事を、考えた過程として説明しきれていないと感じる人"),
      ],
      other: [
        { text: k("デザインの仕事はまだしたことがない"), slug: "career-change" },
        { text: k("転職より、今の職場で案を通せるようになりたい"), slug: "proposal" },
      ],
    },
    arrival: {
      can: [
        k("担当した画面を、ユーザーの課題から順に説明できる"),
        k("案を選んだ理由を、比べた案と根拠をあわせて話せる"),
        k("面接官が知りたい順番で、作品を見せられる"),
      ],
      keep: k("考えた過程と判断が伝わるように作り直したポートフォリオ"),
    },
    guides: [GUIDE_PORTFOLIO, GUIDE_FEEDBACK, GUIDE_JOB],
    pace: pace("約5ヶ月", "約3ヶ月"),
    faq: faq(
      "応募の時期が決まっているなら、ポートフォリオの作り直しを先に始めて、2つのコースで気づいたことを足していく進め方もできます。",
      "ユーザー調査を仕事でしていれば、最初のコースは目安ができるか確かめる程度にして、提案力から始めて構いません。",
      "ポートフォリオの作り直しで、文章の整理や画面の清書に使うのがおすすめです。考えた過程そのものは自分の言葉で書きます。"
    ),
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
      {
        type: "planned-course",
        title: "UX基礎",
        note: k("ユーザーを調べて、困りごとと理想の体験を言葉にする"),
        whyHere: k("画面を考える前に、誰の何のためのサービスかを決めるため"),
        checkpoint: k("3人に話を聞き、困りごとを1枚にまとめられる"),
      },
      {
        type: "planned-course",
        title: "ペルソナ中心のUIデザイン",
        note: k("ペルソナの課題と配慮から、画面の体験をつくって評価する"),
        whyHere: k("決めた困りごとを、画面の体験に落とし込むため"),
        checkpoint: k("ペルソナの1日の中で、画面が使われる場面を描ける"),
      },
      {
        type: "planned-course",
        title: "情報設計",
        note: k("体験を支える情報の分け方と並べ方を設計する"),
        whyHere: k("体験が決まってから、それを支える情報の整理に進むため"),
        checkpoint: k("サービス全体の画面一覧と、そのつながりを図にできる"),
      },
    ],
    fit: {
      good: [
        k("画面はつくれるが、「なぜこの機能が必要か」と聞かれると詰まる人"),
        k("画面づくりだけでなく、サービスの企画や改善にも関わりたい人"),
      ],
      other: [
        { text: k("画面のつくり方から学びたい"), slug: "career-change" },
        { text: k("考えたことを人に伝える力を先につけたい"), slug: "proposal" },
      ],
    },
    arrival: {
      can: [
        k("ユーザーに話を聞いて、困りごとを言葉にまとめられる"),
        k("ペルソナの課題から、画面の体験を考えて評価できる"),
        k("体験を支える情報の分け方と並べ方を決められる"),
      ],
      keep: k("調査から画面までの流れが見える、1つのサービスの設計資料"),
    },
    guides: [GUIDE_PORTFOLIO, GUIDE_FEEDBACK],
    pace: pace("約8ヶ月", "約4ヶ月"),
    faq: faq(
      "3つのコースは前の答えを次で使うので、順に進めるのがおすすめです。",
      "仕事でユーザー調査をしていれば、UX基礎は目安ができるか確かめる程度にして、ペルソナ中心のUIデザインから始めて構いません。",
      "話を聞いた記録の整理や、画面案をたくさん出す場面で使えます。困りごとを決めるところは、自分で話を聞いて決めます。"
    ),
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
      {
        type: "planned-course",
        title: "デザインの進め方",
        note: k("調べる→考える→つくる→見直すの流れを、人に見せられる形で進める"),
        whyHere: k("いまどの段階の話かが共有できていないと、提案がかみ合わないため"),
        checkpoint: k("いまの仕事を、4つの段階に分けて説明できる"),
      },
      {
        type: "planned-course",
        title: "ペルソナ中心のUIデザイン",
        note: k("誰のどんな課題のための案かを、判断の根拠として持つ"),
        whyHere: k("根拠の中心になる「誰のための案か」を先に持つため"),
        checkpoint: k("案ごとに、誰のどの課題のためかを一言で言える"),
      },
      {
        type: "planned-course",
        title: "提案・見せ方",
        note: k("案の比べ方、資料の組み立て、話す順番で、納得してもらえる提案にする"),
        whyHere: k("根拠がそろってから、伝える順番と資料の形を整えるため"),
        checkpoint: k("2案を比べた資料で、5分の提案ができる"),
      },
    ],
    fit: {
      good: [
        k("レビューで「なんとなく違う」と言われ、言い返せなかったことがある人"),
        k("1案だけ持っていき、やり直しが続いている人"),
      ],
      other: [
        { text: k("画面のつくり方そのものに自信がない"), slug: "career-change" },
        { text: k("提案の前に、ユーザーの課題を深く調べる力をつけたい"), slug: "user-centered" },
      ],
    },
    arrival: {
      can: [
        k("いま進め方のどこにいるかを、相手と共有しながら進められる"),
        k("案ごとに、誰のどの課題に効くかを根拠として話せる"),
        k("2〜3案を比べた資料をつくり、選ぶ理由まで提案できる"),
      ],
      keep: k("比べた案と根拠をまとめた、自分用の提案資料のひな形"),
    },
    guides: [GUIDE_FEEDBACK, GUIDE_PORTFOLIO],
    pace: pace("約5ヶ月", "約3ヶ月"),
    faq: faq(
      "来週に提案が控えているなら、提案・見せ方から読んでも構いません。そのあと最初に戻ると、根拠の弱いところが分かります。",
      "進め方を仕事で決めている立場なら、最初のコースは目安ができるか確かめる程度で十分です。",
      "案を何パターンも出す場面や、資料の清書に使えます。どの案を選ぶかの理由は、自分の言葉で話せるようにします。"
    ),
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
