/**
 * 11/23 別パターン「回の単位」（#319・AIの案・未決定）。
 * 根拠: 319_assets/11-23別パターン_回の単位で組み直す_AIの案.md
 * 13ページ → はじめに＋5回の6ページ。1回＝1ページ＝1つ作って出す。動画は分けず、ページの中の章にする。
 * 章の長さは完成版のファイル（01業種/完成版・02UIリサーチ/完成版）の実測。撮影済みの動画は変えない。
 */

export interface Chapter {
  /** もとの回の番号（例: 02-3前半） */
  from: string;
  title: string;
  duration?: string;
  thumb?: string;
  /** この章のあとに自分でやること */
  doAfter?: string;
  /** 章に足すテロップ（11/20案3から） */
  telop?: string;
}

export interface Kai {
  /** 0 = はじめに */
  n: number;
  title: string;
  free: boolean;
  /** 1人でやる量（3段階） */
  mode: "はじめに" | "一緒にやる" | "型を渡して自分で" | "丸ごと1人で";
  total?: string;
  time: string;
  example: { label: string; href?: string; image?: string };
  frame: string[];
  done: string[];
  promptWhere?: string;
  chapters: Chapter[];
  submit: string;
  review: string;
  more?: { label: string; note: string };
}

const T = (n: string) => `/images/lesson-ai-research/thumbs/${n}.jpg`;

export const KAI: Kai[] = [
  {
    n: 0,
    title: "はじめに：このレッスンで作るものと、5回の進め方",
    free: true,
    mode: "はじめに",
    time: "約5分（01-1の長さは編集後に決まる）",
    example: { label: "最後に作るもの：リサーチをもとに作り直した、ハナソの新規登録（04で撮る）" },
    frame: [],
    done: ["5回それぞれで、何を作って、どこに出すかが分かった"],
    chapters: [
      { from: "01-1", title: "できるデザイナーはなぜ「作る前」にAIでリサーチするのか？" },
    ],
    submit: "なし（読んだら回1へ）",
    review: "なし",
    more: {
      label: "もっと知りたい人向け：AIリサーチした方がUIのクオリティもスキルも上がるよ（01-2・約35分）",
      note: "完了には数えない。回の外に置く",
    },
  },
  {
    n: 1,
    title: "回1：ハナソに足りない業種の要素を、AIリサーチで見つける",
    free: true,
    mode: "一緒にやる",
    total: "28:10",
    time: "動画 約28分＋作業 約40分（AIのレポート待ち10分以上を含む）",
    example: {
      label: "完成例：言語交換SNS 新規登録フロー リサーチレポート（撮影で作ったもの）",
      href: "https://claude.ai/artifact/TEYbx9Rdz7He1M2a7h5pLT",
      image: T("02-3b"),
    },
    frame: [
      "ハナソを触って、足りなそうなもの（3つ）",
      "AIに頼んだ文（下の頼み方をコピーして、［ ］を埋める）",
      "レポートを読んで分かったこと（3行）",
    ],
    done: ["AIのレポートが手元にある", "「足りなそうなもの」と「分かったこと」を3つずつ書いた"],
    promptWhere: "02-3",
    chapters: [
      { from: "02-1", title: "このUI、何が問題？ 触って、足りないものをメモする", duration: "03:49", thumb: T("02-1"), doAfter: "書く枠に「足りなそうなもの」を3つ書く" },
      { from: "02-2", title: "AIリサーチの強みと弱み。頼む前に決める2つのこと", duration: "08:09", thumb: T("02-2") },
      { from: "02-3前半", title: "AIに業種のリサーチを頼む", duration: "06:24", thumb: T("02-3"), doAfter: "頼み方をコピーして、自分のAIに頼む（レポートまで10分以上かかる）" },
      { from: "02-3後半", title: "リサーチ結果を読む", duration: "09:48", thumb: T("02-3b"), telop: "早送りの所「実際は約11分」", doAfter: "結論 → 使う人 → 機能 → ビジネスモデル → 新規登録 の順に読み、分かったことを3行書く" },
    ],
    submit: "レポートのリンクと、「分かったこと」3行",
    review: "メンバー同士（終わりの基準で見る）",
  },
  {
    n: 2,
    title: "回2：レポートを実物で確かめて、足りない要素を5つにまとめる",
    free: true,
    mode: "一緒にやる",
    total: "17:15",
    time: "動画 約17分＋作業 約40分",
    example: { label: "完成例：オーナーがFigmaの付箋でまとめた「足りない要素」", image: T("02-4-done") },
    frame: [
      "触った実物のアプリ（1つ以上。例: HelloTalk・Tandem）",
      "足りない要素5つ（付箋1枚に1つ）",
      "それぞれの理由（1行）",
    ],
    done: ["足りない要素が5つあり、それぞれに理由が1行ある", "回1のメモと見比べた"],
    chapters: [
      { from: "02-4前半", title: "HelloTalkで確かめる", duration: "08:53", thumb: T("02-4"), doAfter: "実物のアプリを1つ以上触る" },
      { from: "02-4後半", title: "新規登録に必要なUI要素をまとめる", duration: "08:22", thumb: T("02-4b"), telop: "16:37ごろ「02-1で書いたメモと見比べてみよう」", doAfter: "回1のメモと見比べて、付箋で5つにまとめる" },
    ],
    submit: "足りない要素5つの付箋（スクショ1枚）",
    review: "メンバー同士",
  },
  {
    n: 3,
    title: "回3：新規登録の、仕様と挙動の「ふつう」を調べる",
    free: false,
    mode: "型を渡して自分で",
    total: "18:58",
    time: "動画 約19分＋作業 約40分",
    example: {
      label: "完成例：新規登録フロー 基本の動き（やさしい版）",
      href: "https://claude.ai/artifact/9Uc11ieB1uf4xk95eq7Zs1",
      image: T("03-2b"),
    },
    frame: ["頼み方の型（目的と背景・参考元・欲しい出力）を埋めた文", "自分の新規登録で直すべき仕様と挙動（3つ）"],
    done: ["仕様と挙動のレポートが手元にある", "直すべきことを3つ、レポートの根拠つきで書いた"],
    promptWhere: "03-2",
    chapters: [
      { from: "03-1", title: "メールアドレスを間違えても、進んでしまう。このUIの不自然なところ", duration: "05:10", thumb: T("03-1") },
      { from: "03-2前半", title: "仕様と挙動のふつうをAIに頼む", duration: "07:14", thumb: T("03-2"), doAfter: "型を埋めて、自分のAIに頼む" },
      { from: "03-2後半", title: "レポートを読んで聞き返す", duration: "06:34", thumb: T("03-2b"), telop: "7:51ごろ「レポートが重すぎたら、UIの体験に寄せて書き直してと頼む」", doAfter: "直すべきことを3つ書く" },
    ],
    submit: "直すべき仕様と挙動3つ（レポートのリンクつき）",
    review: "メンバー同士",
  },
  {
    n: 4,
    title: "回4：部品の「ふつう」を調べ、参考アプリで確かめる",
    free: false,
    mode: "型を渡して自分で",
    total: "23:54",
    time: "動画 約24分＋作業 約50分",
    example: {
      label: "完成例：新規登録フロー 部品ごとのUI表現リサーチ（デザインシステム編）",
      href: "https://claude.ai/artifact/H5VvB7dXTxbVT5syM9zCYu",
      image: T("03-3b"),
    },
    frame: ["使う部品と、そのふつうの形（出典のリンクつき）", "参考アプリ3つで気づいたこと（1つ1行）"],
    done: ["部品ごとに、出典のリンクがある", "参考アプリを3つ触って、気づいたことを3行書いた"],
    promptWhere: "03-3",
    chapters: [
      { from: "03-3前半", title: "部品のふつうをAIに頼む", duration: "05:54", thumb: T("03-3"), doAfter: "型を埋めて、自分のAIに頼む" },
      { from: "03-3後半", title: "デザインシステムを読む", duration: "08:34", thumb: T("03-3b"), telop: "6:27ごろ「画像が出ないときは、リンクを付けてもらって自分で開く」" },
      { from: "03-4", title: "触れるUIを探して、参考アプリを3つ触る", duration: "09:26", thumb: T("03-4"), doAfter: "参考アプリを3つ触り、気づいたことを1つ1行で書く" },
    ],
    submit: "部品のメモと、参考アプリ3つで気づいたこと",
    review: "メンバー同士",
  },
  {
    n: 5,
    title: "回5：リサーチをもとに、ハナソの新規登録を作り直す",
    free: false,
    mode: "丸ごと1人で",
    time: "動画 約24分以内（04はこれから撮る）＋作業 約2〜3時間",
    example: { label: "完成例：オーナーが作り直した新規登録（04で撮る）" },
    frame: ["回1〜4で出したもの（ここに並ぶ）", "作り直した新規登録（Figmaのプロトタイプ）", "次に直すこと（講評のあとに3行）"],
    done: ["回2の「足りない要素5つ」が、すべて画面に入っている", "回3・回4の「ふつう」と違う所には、理由を書いた"],
    chapters: [
      { from: "04-1", title: "実演①：調べたことをAIに渡すだけで、新規登録はここまで変わる", duration: "12分以内で撮る" },
      { from: "04-2", title: "実演②：AI任せでは残る所を、手で仕上げる", duration: "12分以内で撮る" },
    ],
    submit: "作り直した新規登録のリンク",
    review: "オーナーが講評（この回だけ）→ 次に直すこと3行を書いて出し直す",
  },
];
