#!/usr/bin/env node
/* ============================================================
   rec.mjs — 撮影メモ（color-fix-rec.src.html）を書き出す
     node knowledge/img/color-fix/rec.mjs && node knowledge/img/color-fix/inline.mjs
   - 動画の撮影中に横目で見る手元メモ。記事「ダメなUIを4段階で直す」と同じ順に、変えた場所ごとのカード（33枚）
   - カードの中身（変える値・話すポイント）はこのファイルの STAGES が正。直すときはここを直して上の2つを実行する
   - 値の出どころ: 前の値は bad-ui/color-bad-ui.html の :root と各ルール、後の値は同じファイルの直し（f1〜f18）、
     比率と彩度は bad-ui/contrast.py の出力、文は docs/50-knowledge/05-color-fix-spots.md と記事の本文
   - 画像は記事と同じもの（spots.json の切り抜き・full-*.webp）。alt は記事の src から借りる
   - CSS の先頭は、シリーズの記事に共通する先頭の行をそのまま写す（build-series.mjs の共通部分を壊さないため）
   Node標準モジュールのみ。
   ============================================================ */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const KN = join(HERE, "..", "..");
const OUT = join(HERE, "color-fix-rec.src.html");

/* ---------- データ ----------
   vals: [何を, 前, 後]。前が無い所は ""（後だけ出す）
   talk: [ダメ, 直す, なぜ]。どれも40字以内
   extra: 補足（言えたら）。会社によって分かれる所だけ */
const ITEMS = {
  1: "青は「押せる所」の色にする", 2: "選択中のナビは、ボタンと張り合わせない", 4: "通知の数は、塗りと文字の組で決める",
  5: "画面の大半はニュートラルで組む", 6: "目立つ色のボタンは1画面に1つ", 7: "削除は赤くする", 18: "押せるボタンをグレーにしない",
  11: "状態の色は借りてくる", 12: "注意には強さの段階がある", 13: "状態の色を飾りに使わない", 14: "色だけで伝えない",
  8: "本文は背景と4.5:1以上", 9: "入力欄の枠やアイコンも3:1以上", 10: "文中のリンクには下線",
};

const STAGES = [
  {
    no: 1, ch: "A", name: "色は役割で決める", short: "役割", items: "1・2・4", from: "ダメUI",
    lead: "何色にするかの前に、その色に何をさせるかを決める",
    cards: [
      { img: "s01-logo", item: 1, name: "ロゴ",
        vals: [["ロゴの印の塗り", "#3B6CF6", "#1f2328"]],
        talk: ["ロゴの印が、押せるボタンと同じ青", "青を外して、濃い文字色で塗る", "青＝押せる、の覚え方を崩さない（Apple・NN/g）"] },
      { img: "s01-new", item: 1, name: "新規タスクのボタン",
        vals: [["塗り", "#3B6CF6", "#1552E0"], ["白文字との比", "4.50:1", "6.33:1"]],
        talk: ["白文字との比が4.50:1で、余裕がない", "押せる青を #1552E0 の1色に決め直す", "6.33:1で余裕ができる。これが「押せる」の色"] },
      { img: "s01-link", item: 1, name: "文中のリンク",
        vals: [["文字", "#3B6CF6", "#1552E0"], ["カードの地との比", "4.32:1", "6.07:1"]],
        talk: ["カードの地に4.32:1で、本文の4.5:1に届かない", "ボタンと同じ #1552E0 にそろえる", "押せる青は1つにする。下線は段階4で足す"] },
      { img: "s01-tab", item: 1, name: "選択中のタブ",
        vals: [["文字と下線", "#3B6CF6", "#1f2328＋太字"], ["カードの地との比", "4.32:1", "15.14:1"]],
        talk: ["選ばれている印が、押せる青と同じ", "濃い文字色・太字・下線で示す", "「選ばれている」と「押せる」は役割が違う"] },
      { img: "s01-bar", item: 1, name: "進み具合のバー",
        vals: [["バーの塗り", "#3B6CF6", "#1f2328"], ["溝（残りの部分）", "#FFFFFF", "#e6eaef"], ["比", "溝とカードの地 1.04:1", "塗りと溝 13.07:1"]],
        talk: ["バーが青で、溝はカードと同じ白で見えない", "塗りは濃い文字色、溝は淡いニュートラル", "押せないので青を外す。100%の端も見える"] },
      { img: "s01-pj", item: 1, name: "プロジェクトの印",
        vals: [["印（見出しとサイドバー）", "#3B6CF6", "#bf3989（ピンク）"], ["地との比", "", "4.54:1"]],
        talk: ["今のプロジェクトの印も、押せる青", "見分けのための色（ピンク）にする", "押せない印に青を使わない。両方の印が色でつながる"] },
      { img: "s02-nav", item: 2, name: "サイドバーの選択中",
        vals: [["塗り", "#3B6CF6", "#e6eaef"], ["文字", "#FFFFFF", "#1f2328＋太字"], ["左線（幅3px）", "なし", "#1f2328"], ["比", "", "文字 13.07:1／左線と地 14.22:1"]],
        talk: ["選択中が青の塗りで、ボタンと同じ見た目", "淡いニュートラルの塗り＋濃い左線＋太字", "主ボタンと注目を取り合わない（Spectrum）"],
        extra: "Apple・Fluent は選択中もブランド色。Material 3・Atlassian・Spectrum は主ボタンと別の色" },
      { img: "s04-badge", item: 4, name: "通知のバッジ",
        vals: [["塗り", "#F37509（橙）", "#cf222e（赤）"], ["白い数字との比", "2.85:1", "5.36:1"]],
        talk: ["橙の塗りに白い数字で、2.85:1しかない", "赤の塗りと白い数字の組に変える", "塗りだけ先に決めると起きるミス。組で決める"],
        extra: "赤は慣習に合わせた例外。ブランド色にするかは会社で分かれる（Apple）" },
    ],
  },
  {
    no: 2, ch: "B", name: "色の量を絞る", short: "量", items: "5・6・7・18", from: "段階1",
    lead: "色は出す場所を絞るほど、見せたい物が目立つ",
    cards: [
      { img: "s05-app", item: 5, name: "アプリの地",
        vals: [["アプリの地", "#EEF3FF", "#eff2f5"], ["色みの強さ（CIELAB の彩度）", "6.4", "1.9"]],
        talk: ["地の青みが、見て分かるほど強い（彩度6.4）", "Primer の青みのあるニュートラルに替える", "画面の大半はニュートラル（Carbon・Atlassian ほか）"],
        extra: "Material 3 の地はブランドの色相のまま彩度を下げる。Gmail の地 #F8FAFD は彩度1.7" },
      { img: "s05-card", item: 5, name: "カードの地",
        vals: [["カードの地", "#FAFAFA", "#f6f8fa"]],
        talk: ["カードが純粋なグレーで、地と色みが違う", "地と同じ系統のニュートラルにそろえる", "色みがばらばらだと、くすんだ印象になる"] },
      { img: "s05-av", item: 5, name: "アバター",
        vals: [["丸の地", "#E3EBFF", "#e6eaef"], ["文字", "#3B6CF6", "#59636e"], ["文字との比", "", "5.06:1"]],
        talk: ["アバターが、淡い青の地に青い文字", "ニュートラルの地に、グレーの文字にする", "押せない物なので、押せる青を使わない"] },
      { img: "s06-invite", item: 6, name: "招待のボタン",
        vals: [["塗り", "#3B6CF6", "#FFFFFF"], ["文字", "#FFFFFF", "#1f2328"], ["枠（1px）", "なし", "#d1d9e0"], ["文字との比", "", "15.80:1"]],
        talk: ["「招待」も青の塗りで、主役が2つある", "白地に枠のボタンにする", "目立つ色のボタンは1画面に1つ（Apple・Spectrum）"] },
      { img: "s07-del", item: 7, name: "詳細の「タスクを削除」",
        vals: [["塗り", "#3B6CF6", "#FFFFFF"], ["文字", "#FFFFFF", "#d1242f（赤）"], ["枠（1px）", "なし", "#d1d9e0"], ["文字との比", "", "5.24:1"]],
        talk: ["削除が、ふだんの主ボタンと同じ青", "白地に赤い文字と枠のボタンにする", "最初の入口は控えめに（Apple・GOV.UK）"] },
      { img: "s07-modal", item: 7, name: "確認の「削除する」",
        vals: [["塗り", "#3B6CF6", "#cf222e（赤）"], ["白文字との比", "", "5.36:1"]],
        talk: ["取り消せない最後の確認も、青の塗り", "赤の塗りに白い文字にする", "最後の確認ははっきり示す（GOV.UK・Spectrum）"] },
      { img: "s18-save", item: 18, name: "変更を保存",
        vals: [["塗り", "#EBEBEB", "#1552E0"], ["文字", "#A1A1AA", "#FFFFFF"], ["文字との比", "2.15:1", "6.33:1"]],
        talk: ["グレーの塗りに薄い文字で、押せないように見える", "主な操作なので、押せる青の塗りにする", "グレーは押せない状態の色（NN/g・Carbon）"] },
      { img: "s18-dup", item: 18, name: "複製と、確認の「キャンセル」",
        vals: [["キャンセルの塗り", "#EBEBEB", "#FFFFFF"], ["キャンセルの文字", "#A1A1AA", "#1f2328"], ["枠（1px）", "複製 #EBEBEB／キャンセル なし", "#d1d9e0"], ["文字との比", "", "15.80:1"]],
        talk: ["キャンセルも、グレーの塗りに薄い文字", "控えめな操作は、白地に枠のボタンにする", "グレーの塗りは、本当に押せない状態に取っておく"] },
    ],
  },
  {
    no: 3, ch: "D", name: "意味を持つ色", short: "意味", items: "11・12・13・14", from: "段階2",
    lead: "エラー・成功・注意のように、意味を伝える色を整える",
    cards: [
      { img: "s11-status", item: 11, name: "状態の札",
        valsNote: "文字／地",
        vals: [["進行中", "#3B6CF6／#E3EBFF 3.77:1", "#0969da／#ddf4ff 4.56:1"], ["レビュー待ち", "#EAB308／#FEF9C3 1.79:1", "#9a6700／#fff8c5 4.52:1"], ["差し戻し", "#EF4444／#FEE2E2 3.08:1", "#bc4c00／#fff1e5 4.55:1"], ["未着手", "#A1A1AA／#EFEFF1", "#59636e／#e6eaef 5.06:1"], ["完了", "#22C55E／#DCFCE7 2.07:1", "#1a7f37／#dafbe1 4.56:1"]],
        talk: ["淡い地に明るい文字で、どれも4.5:1未満", "Primer の「淡い地＋濃い文字」の組を借りる", "比率が確かめ済みで、画面ごとにばらつかない（Primer）"] },
      { img: "s11-chip", item: 11, name: "先週との比較のチップ",
        vals: [["▲と「1件」の文字", "#22C55E", "#1a7f37"], ["白い地との比", "", "5.08:1"]],
        talk: ["▲1件の緑が明るく、白い地との差が小さい", "状態の札の「完了」と同じ緑にそろえる", "5.08:1で読める。借りた緑を使い回す"] },
      { img: "s12-notice", item: 12, name: "メンテナンスのお知らせ",
        vals: [["帯の地", "#FEF2F2", "#fff8c5（黄）"], ["文字", "#EF4444", "#1f2328"], ["アイコン", "#EF4444", "#9a6700（黄土色）"], ["下の線", "#EF4444", "#d4a72c（不透明度40%）"], ["比", "文字 3.44:1", "文字 14.66:1／アイコン 4.52:1"]],
        talk: ["お知らせが、入力エラーと同じ赤", "黄色の地にふつうの文字、アイコンだけ黄土色", "知っておけばよい情報は弱い注意（Carbon ほか）"] },
      { img: "s12-err", item: 12, name: "入力エラー",
        vals: [["地", "#FEF2F2", "#ffebe9"], ["文字", "#EF4444", "#d1242f"], ["枠", "#EF4444", "#ff8182（不透明度40%）"], ["文字との比", "", "4.57:1"]],
        talk: ["お知らせと同じ赤で、強さの差がなかった", "赤のまま、Primer の赤の組にする", "すぐ直してほしいエラーだけを赤にする"] },
      { img: "s12-late", item: 12, name: "期限切れの日付",
        vals: [["日付の文字", "#EF4444", "#d1242f"], ["カードの地との比", "3.61:1", "4.93:1"]],
        talk: ["赤は残すが、明るい赤で地との比が3.61:1しかない", "エラーと同じ赤 #d1242f にそろえる", "赤はエラーと期限切れにだけ使う"] },
      { img: "s13-tags", item: 13, name: "タグ",
        vals: [["地", "緑 #DCFCE7・青 #E3EBFF・黄 #FEF3C7", "塗らない"], ["文字", "#22C55E・#3B6CF6・#F59E0B", "#59636e"], ["枠（1px）", "なし", "#d1d9e0"], ["カードの地との比", "", "5.74:1"]],
        talk: ["「デザイン」が成功の緑、「企画」が注意の黄", "地を塗らない、枠だけの札にする", "タグに良い・悪いの意味はない（Fluent ほか）"] },
      { img: "s13-new", item: 13, name: "NEW の印",
        vals: [["地", "#FEE2E2", "塗らない"], ["文字", "#EF4444", "#59636e"], ["枠（1px）", "なし", "#d1d9e0"]],
        talk: ["NEW が、エラーと同じ赤", "タグと同じ、枠だけの札にする", "エラーの赤を飾りに使わない"] },
      { img: "s13-pj", item: 13, name: "サイドバーのほかのプロジェクトの印",
        vals: [["採用ページ改善", "#22C55E（緑）", "#1b7c83（青緑）"], ["11月キャンペーン", "#F59E0B（黄）", "#7a6f1c（オリーブ）"], ["地との比", "", "4.39:1／4.54:1"]],
        talk: ["印の緑と黄が、状態の色と同じ", "色は残して、青緑とオリーブにする", "見分ける色は残す。意味のある色とは重ねない"] },
      { img: "s14-pri", item: 14, name: "優先度",
        vals: [["示し方", "色の点だけ", "棒の数のアイコン＋「高・中・低」"], ["点・棒の色", "高 #EF4444・中 #F59E0B・低 #22C55E", "高 #bc4c00・中と低 #59636e・空き #d0d7de"], ["「高・中・低」の文字", "", "#4C4C4C"], ["比", "", "高の棒 4.73:1／中・低 5.74:1／文字 8.07:1"]],
        talk: ["赤・黄・緑の点だけで、段階を伝えている", "棒の数のアイコンと「高・中・低」の文字", "色は「高」の橙だけ（Linear と同じ付け方）"],
        extra: "Jira・Asana は全段階に色を付ける。Linear は一番上だけに付ける" },
      { img: "s14-req", item: 14, name: "必須の項目",
        vals: [["ラベルの文字", "#EF4444", "#4C4C4C"], ["足す文字", "", "「必須」#4C4C4C"], ["比", "", "8.07:1"]],
        talk: ["必須を、ラベルの赤だけで示している", "ラベルを濃いグレーに戻し「必須」を足す", "色の区別がつきにくい人にも伝わる"] },
      { img: "s12-late", item: 14, name: "期限切れ",
        vals: [["足すアイコン", "", "丸に「!」（14px・#d1242f）"], ["読み上げ", "", "「期限切れ」"]],
        talk: ["期限切れを、日付の赤だけで示している", "日付の右に「!」のアイコンを足す", "白黒の印刷でも、読み上げでも伝わる"] },
    ],
  },
  {
    no: 4, ch: "C", name: "数値で確かめる", short: "数値", items: "8・9・10", from: "段階3",
    lead: "見やすさを、感覚ではなく数字で確かめる",
    cards: [
      { img: "s08-sub", item: 8, name: "説明文とサブの文字",
        vals: [["文字", "#A1A1AA", "#59636e"], ["カードの地との比", "2.46:1", "5.74:1"], ["アプリの地との比", "", "5.44:1"]],
        talk: ["薄いグレーで、カードの地に2.46:1", "Primer のサブ文字の色 #59636e にする", "本文は背景と4.5:1以上（WCAG 2.2）"] },
      { img: "s08-tabs", item: 8, name: "選ばれていないタブ",
        vals: [["文字", "#A1A1AA", "#59636e"], ["カードの地との比", "2.46:1", "5.74:1"]],
        talk: ["選ばれていないタブも、同じ薄いグレー", "サブの文字と同じ色に直す", "選択中との違いは、太字と下線で残る"] },
      { img: "s09-inp", item: 9, name: "入力欄の枠",
        vals: [["枠（1px）", "#EBEBEB", "#818b98"], ["白との比", "1.19:1", "3.45:1"]],
        talk: ["枠が白に1.19:1で、ほとんど見えない", "枠を #818b98 にして3.45:1にする", "操作に要る物は3:1以上（WCAG 2.2）"] },
      { img: "s09-search", item: 9, name: "検索欄とアイコン",
        vals: [["虫めがね", "#CFCFD4", "#59636e"], ["白との比", "1.55:1", "6.11:1"], ["検索欄の枠", "#EBEBEB", "#818b98"]],
        talk: ["虫めがねが、白に1.55:1しかない", "アイコンを #59636e に、枠も濃くする", "意味のあるアイコンも3:1以上（WCAG 2.2）"] },
      { img: "s09-acct", item: 9, name: "アカウントの「…」",
        vals: [["「…」", "#A1A1AA", "#59636e"]],
        talk: ["メニューが開くボタンなのに、薄いグレー", "検索のアイコンと同じ色に濃くする", "押せるアイコンも3:1以上（WCAG 2.2）"] },
      { img: "s10-link", item: 10, name: "記入ルールのリンク",
        vals: [["下線", "なし", "あり（文字から2px離す）"], ["文字", "", "#1552E0（段階1のまま）"], ["カードの地との比", "", "5.95:1"]],
        talk: ["色だけでリンクだと示している", "下線を引く。色は段階1の青のまま", "色だけのリンクは失敗例（WCAG F73）"] },
    ],
  },
];

/* ---------- 検査（このページは記事のチェック対象外なので、ここで止める） ---------- */
const errs = [];
let n = 0;
for (const s of STAGES) for (const c of s.cards) {
  n++;
  if (c.talk.length !== 3) errs.push(`${c.name}: 話すポイントは3つ`);
  for (const t of c.talk) {
    if ([...t].length > 40) errs.push(`${c.name}: 40字を超える（${[...t].length}字）: ${t}`);
    if (/ですよね/.test(t)) errs.push(`${c.name}: 「ですよね」: ${t}`);
  }
  if (c.extra && /ですよね/.test(c.extra)) errs.push(`${c.name}: 補足に「ですよね」`);
}
if (n !== 33) errs.push(`カードが ${n} 枚（33枚のはず）`);
if (errs.length) throw new Error(errs.join("\n"));

/* ---------- 画像の情報（記事と同じもの） ---------- */
const sizes = JSON.parse(readFileSync(join(HERE, "sizes.json"), "utf8"));
const spots = Object.fromEntries(JSON.parse(readFileSync(join(HERE, "spots.json"), "utf8")).spots.map((s) => [s.id, s]));
const article = readFileSync(join(HERE, "color-fix.src.html"), "utf8");
const alts = {};
for (const m of article.matchAll(/data-img="([^"]+)" alt="([^"]*)"/g)) alts[m[1]] ??= m[2];
const VER = ["before", "step1", "step2", "step3", "step4"];
const verOf = (stage) => [VER[stage.no - 1], VER[stage.no]];
const altOf = (name) => {
  if (!alts[name]) throw new Error(`alt が無い: ${name}`);
  return alts[name];
};
for (const s of STAGES) for (const c of s.cards) for (const v of verOf(s)) {
  if (!sizes[`${c.img}-${v}`]) throw new Error(`画像が無い: ${c.img}-${v}`);
}

/* ---------- CSS: 先頭はシリーズの記事に共通する行をそのまま ---------- */
const SIBLINGS = ["color-points.html", "color-fix.html", "nav-points.html", "modal-points.html"];
const cssOf = (f) => (readFileSync(join(KN, f), "utf8").match(/<style[^>]*>([\s\S]*?)<\/style>/i) || [])[1].split("\n");
const sib = SIBLINGS.map(cssOf);
let common = 0;
while (sib.every((l) => common < l.length && l[common] === sib[0][common])) common++;
const depthAt = (lines, k) => lines.slice(0, k).join("\n").replace(/\/\*[\s\S]*?\*\//g, "").split("").reduce((d, ch) => d + (ch === "{") - (ch === "}"), 0);
while (common > 0 && depthAt(sib[0], common) !== 0) common--;
const sharedCss = sib[0].slice(0, common).join("\n");

const recCss = `
  /* ===== 撮影メモ（color-fix-rec）に固有。色は tokens.css の変数だけ ===== */
  .rec-page { max-width: 1560px; margin: 0 auto; padding-left: var(--gutter-l); padding-right: var(--gutter-r); font-size: 18px; line-height: 1.6; }
  @media (min-width: 1024px) { .rec-page { padding-left: var(--space-40); padding-right: var(--space-40); font-size: 19px; } }
  .rec-page img { display: block; max-width: 100%; height: auto; }
  .rec-page a { overflow-wrap: anywhere; }
  main.rec-page { padding-block: var(--space-24) var(--space-64); }

  .rec-head { padding-block: var(--space-24) var(--space-20); border-bottom: 3px solid var(--color-ink); }
  .rec-head__back { font-size: 16px; margin: 0 0 var(--space-8); }
  .rec-head h1 { font-size: 28px; font-weight: 900; line-height: var(--leading-heading); }
  @media (min-width: 768px) { .rec-head h1 { font-size: 36px; } }
  .rec-head__lede { margin: var(--space-8) 0 0; color: var(--color-ink-2); }

  /* 全体の流れ */
  .rec-flow h2 { font-size: 26px; line-height: var(--leading-heading); margin: 0 0 var(--space-16); }
  .rec-steps { list-style: none; display: grid; gap: var(--space-12); grid-template-columns: minmax(0, 1fr); }
  @media (min-width: 640px) { .rec-steps { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
  @media (min-width: 1200px) { .rec-steps { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  .rec-steps > li { background: var(--color-surface); border: 2px solid var(--color-border); border-radius: var(--radius-m); padding: var(--space-16); min-width: 0; }
  .rec-steps__head { display: block; text-decoration: none; color: var(--color-ink); }
  .rec-steps__head:hover .rec-steps__ch { color: var(--color-accent); }
  .rec-steps__no { display: block; font-size: 15px; font-weight: 900; letter-spacing: 0.06em; color: var(--color-accent); }
  .rec-steps__ch { display: block; font-size: 23px; font-weight: 900; line-height: var(--leading-heading); margin: var(--space-2) 0 var(--space-6); }
  .rec-steps__lead { display: block; font-size: 18px; font-weight: 700; line-height: 1.5; }
  .rec-steps__items { font-size: 15px; color: var(--color-ink-3); margin: var(--space-8) 0 0; }
  .rec-steps__spots { list-style: none; display: flex; flex-wrap: wrap; gap: var(--space-6); margin: var(--space-10) 0 0; }
  .rec-steps__spots a { display: inline-block; font-size: 15px; line-height: 1.4; padding: var(--space-2) var(--space-10); border: 1px solid var(--color-border); border-radius: var(--radius-l); background: var(--color-surface-2); color: var(--color-ink); text-decoration: none; }
  .rec-steps__spots a:hover { border-color: var(--color-accent); color: var(--color-accent); }
  .rec-steps__spots b { color: var(--color-ink-3); font-weight: 700; margin: 0 var(--space-4) 0 0; }
  .rec-rules { margin: var(--space-20) 0 0; padding: 0 0 0 1.2em; font-size: 18px; }
  .rec-rules li { margin: 0 0 var(--space-4); }

  /* 画像の枠と札 */
  .rec-pair { display: grid; gap: var(--space-16); margin: var(--space-24) 0 0; grid-template-columns: minmax(0, 1fr); }
  @media (min-width: 900px) { .rec-pair { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
  .rec-fig { background: var(--color-surface-2); border-radius: var(--radius-m); padding: var(--space-10); min-width: 0; max-width: 100%; }
  .rec-fig img { border: 1px solid var(--color-border); border-radius: var(--radius-s); background: var(--color-surface); }
  .rec-lbl { font-size: 15px; font-weight: 900; letter-spacing: 0.08em; line-height: 1.4; margin: 0 0 var(--space-6); }
  .rec-lbl--now { color: var(--color-interp); }
  .rec-lbl--goal { color: var(--color-fact); }

  /* 段階の帯 */
  .rec-stage { padding: var(--space-56) 0 0; }
  .rec-band { background: var(--grad-1); color: var(--color-on-grad); border-radius: var(--radius-m); padding: var(--space-20) var(--space-24); }
  .rec-band a { color: var(--color-on-grad); }
  .rec-band__no { font-size: 17px; font-weight: 900; letter-spacing: 0.06em; margin: 0 0 var(--space-4); }
  .rec-band h2 { font-size: 30px; font-weight: 900; line-height: var(--leading-heading); margin: 0 0 var(--space-8); }
  @media (min-width: 768px) { .rec-band h2 { font-size: 36px; } }
  .rec-band__lead { font-size: 21px; font-weight: 700; line-height: 1.5; margin: 0 0 var(--space-8); }
  .rec-band__meta { font-size: 16px; margin: 0; }

  /* カード */
  .rec-card { margin: var(--space-24) 0 0; background: var(--color-surface); border: 2px solid var(--color-border); border-radius: var(--radius-m); padding: var(--space-16); }
  @media (min-width: 768px) { .rec-card { padding: var(--space-20) var(--space-24); } }
  .rec-card__head { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--space-4) var(--space-12); margin: 0 0 var(--space-16); padding: 0 0 var(--space-12); border-bottom: 1px solid var(--color-border); }
  .rec-card__no { font-size: 18px; font-weight: 900; color: var(--color-accent); font-variant-numeric: tabular-nums; }
  .rec-card h3 { font-size: 26px; font-weight: 900; line-height: var(--leading-heading); }
  .rec-card__item { font-size: 16px; color: var(--color-ink-2); }
  .rec-card__item a { color: var(--color-ink-2); }
  .rec-card__body { display: grid; gap: var(--space-20); grid-template-columns: minmax(0, 1fr); }
  @media (min-width: 1024px) { .rec-card__body { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); align-items: start; } }
  /* 狭い画面: 今（上）→ ゴール（下）。640px から横並び（今は小さく左、ゴールは大きく右）。横長の切り抜き（rows）は常に縦 */
  .rec-imgs { display: flex; flex-direction: column; gap: var(--space-12); min-width: 0; }
  @media (min-width: 640px) {
    .rec-imgs { flex-direction: row; align-items: flex-start; }
    .rec-fig--now { flex: 0 1 auto; max-width: 40%; }
    .rec-fig--goal { flex: 0 1 auto; }
    .rec-card--rows .rec-imgs { flex-direction: column; align-items: flex-start; }
    .rec-card--rows .rec-fig--now { max-width: 100%; }
  }
  .rec-h { font-size: 15px; font-weight: 900; letter-spacing: 0.08em; color: var(--color-ink-3); margin: 0 0 var(--space-8); }
  .rec-h small { font-size: 14px; font-weight: 500; letter-spacing: 0; margin: 0 0 0 var(--space-8); }

  /* Figmaで変える値 */
  .rec-vals { margin: 0 0 var(--space-20); border-top: 1px solid var(--color-border); }
  .rec-val { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-2) var(--space-12); padding: var(--space-6) 0; border-bottom: 1px solid var(--color-border); }
  @media (min-width: 640px) { .rec-val { grid-template-columns: 9em minmax(0, 1fr); } }
  .rec-val dt { font-size: 16px; font-weight: 700; color: var(--color-ink-2); line-height: 1.5; padding: var(--space-2) 0 0; }
  .rec-val dd { line-height: 1.5; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
  .rec-val__was { color: var(--color-ink-2); }
  .rec-val__to { color: var(--color-ink-3); margin: 0 var(--space-6); }
  .rec-val__now { font-weight: 700; color: var(--color-ink); background: var(--color-fact-bg); border-radius: var(--radius-s); padding: 0 var(--space-6); box-decoration-break: clone; -webkit-box-decoration-break: clone; }

  /* 話すポイント */
  .rec-talk { list-style: none; display: grid; gap: var(--space-10); }
  .rec-talk li { display: flex; gap: var(--space-10); align-items: flex-start; font-size: 20px; font-weight: 500; line-height: 1.5; }
  .rec-talk__tag { flex: none; font-size: 14px; font-weight: 900; line-height: 1.5; padding: var(--space-2) var(--space-8); margin: var(--space-2) 0 0; border-radius: var(--radius-s); }
  .rec-talk__tag--ng { background: var(--color-interp-bg); color: var(--color-interp); }
  .rec-talk__tag--fix { background: var(--color-fact-bg); color: var(--color-fact); }
  .rec-talk__tag--why { background: var(--color-surface-2); color: var(--color-ink-2); }
  .rec-extra { margin: var(--space-16) 0 0; padding: var(--space-10) var(--space-14); border-left: 4px solid var(--color-accent); background: var(--color-surface-2); border-radius: 0 var(--radius-s) var(--radius-s) 0; font-size: 17px; line-height: 1.6; }
  .rec-extra b { color: var(--color-accent); margin: 0 var(--space-8) 0 0; }

  /* この段階のゴール */
  .rec-stagegoal { margin: var(--space-32) 0 0; padding: var(--space-16); background: var(--color-fact-bg); border-radius: var(--radius-m); }
  @media (min-width: 768px) { .rec-stagegoal { padding: var(--space-20) var(--space-24); } }
  .rec-stagegoal h3 { font-size: 24px; font-weight: 900; line-height: var(--leading-heading); margin: 0 0 var(--space-4); }
  .rec-stagegoal p { font-size: 17px; margin: 0 0 var(--space-12); }
  .rec-stagegoal img { border: 1px solid var(--color-border); border-radius: var(--radius-s); margin: 0 auto; }
  .rec-top { font-size: 16px; margin: var(--space-12) 0 0; }
`;

/* ---------- HTML ---------- */
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pad2 = (k) => String(k).padStart(2, "0");
let k = 0;
for (const s of STAGES) for (const c of s.cards) c.no = ++k;

const flow = STAGES.map((s) => `
        <li>
          <a class="rec-steps__head" href="#s${s.no}">
            <span class="rec-steps__no">段階${s.no}　章${s.ch}</span>
            <span class="rec-steps__ch">${esc(s.short)}：${esc(s.name)}</span>
            <span class="rec-steps__lead">${esc(s.lead)}</span>
          </a>
          <p class="rec-steps__items">項目${s.items}／${s.cards.length}か所</p>
          <ul class="rec-steps__spots">
${s.cards.map((c) => `            <li><a href="#c${pad2(c.no)}"><b>${pad2(c.no)}</b>${esc(c.name)}</a></li>`).join("\n")}
          </ul>
        </li>`).join("");

function valRow([what, was, now]) {
  const left = was ? `<span class="rec-val__was">${esc(was)}</span><span class="rec-val__to">→</span>` : "";
  return `                <div class="rec-val"><dt>${esc(what)}</dt><dd>${left}<span class="rec-val__now">${esc(now)}</span></dd></div>`;
}

function card(s, c) {
  const [vb, va] = verOf(s);
  const rows = spots[c.img]?.rows ? " rec-card--rows" : "";
  const tags = [["ng", "ダメ"], ["fix", "直す"], ["why", "なぜ"]];
  return `
      <article class="rec-card${rows}" id="c${pad2(c.no)}">
        <header class="rec-card__head">
          <span class="rec-card__no">${pad2(c.no)}</span>
          <h3>${esc(c.name)}</h3>
          <span class="rec-card__item"><a href="color-fix.html#p${pad2(c.item)}">項目${c.item}</a>　${esc(ITEMS[c.item])}</span>
        </header>
        <div class="rec-card__body">
          <div class="rec-imgs">
            <figure class="rec-fig rec-fig--now">
              <figcaption class="rec-lbl rec-lbl--now">今（直す前）</figcaption>
              <img class="zoom" data-img="${c.img}-${vb}" alt="${esc(altOf(`${c.img}-${vb}`))}">
            </figure>
            <figure class="rec-fig rec-fig--goal">
              <figcaption class="rec-lbl rec-lbl--goal">ゴール</figcaption>
              <img class="spot" data-img="${c.img}-${va}" alt="${esc(altOf(`${c.img}-${va}`))}">
            </figure>
          </div>
          <div class="rec-text">
            <h4 class="rec-h">Figmaで変える値${c.valsNote ? `<small>（${esc(c.valsNote)}）</small>` : ""}</h4>
            <dl class="rec-vals">
${c.vals.map(valRow).join("\n")}
            </dl>
            <h4 class="rec-h">話すポイント</h4>
            <ul class="rec-talk">
${c.talk.map((t, i) => `              <li><span class="rec-talk__tag rec-talk__tag--${tags[i][0]}">${tags[i][1]}</span><span>${esc(t)}</span></li>`).join("\n")}
            </ul>${c.extra ? `
            <p class="rec-extra"><b>補足（言えたら）</b>${esc(c.extra)}</p>` : ""}
          </div>
        </div>
      </article>`;
}

const FULL_ALT = {
  "full-step1": "段階1まで直した画面の全体。押せる所だけが青になり、サイドバーの選択中は淡いグレーに濃い左線",
  "full-step2": "段階2まで直した画面の全体。地はほぼ無彩色になり、青い塗りのボタンは「新規タスク」と「変更を保存」だけ",
  "full-step3": "段階3まで直した画面の全体。お知らせは黄色、状態の札は淡い地に濃い文字、タグは枠だけ、優先度に文字",
  "full-step4": "4段階すべてを直したアフターの全体",
};

const stagesHtml = STAGES.map((s) => `
    <section class="rec-stage" id="s${s.no}" aria-labelledby="s${s.no}-h">
      <div class="rec-band">
        <p class="rec-band__no">段階${s.no}　章${s.ch}　項目${s.items}</p>
        <h2 id="s${s.no}-h">${esc(s.name)}</h2>
        <p class="rec-band__lead">${esc(s.lead)}</p>
        <p class="rec-band__meta">スタートは${s.from}の画面。${s.cards.length}か所を直す　<a href="color-fix.html#s${s.no}">記事の段階${s.no}</a>　<a href="#flow">↑ 全体の流れ</a></p>
      </div>
${s.cards.map((c) => card(s, c)).join("\n")}
      <div class="rec-stagegoal">
        <h3>この段階のゴール</h3>
        <p>段階${s.no}を直し終えた画面（${s.no === 4 ? "アフター" : `次は段階${s.no + 1}`}）。</p>
        <img class="shot" data-img="full-step${s.no}" alt="${esc(FULL_ALT[`full-step${s.no}`])}">
      </div>
    </section>`).join("\n");

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>撮影メモ：ダメなUIを4段階で直す</title>
<meta name="description" content="記事「ダメなUIを4段階で直す」の動画を撮るときの手元メモ。変えた33か所ごとに、直す前とゴールの画像、Figmaで変える値、話すポイントを並べます。">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="tokens.css">
<style>${sharedCss}
${recCss}
</style>
</head>
<body>
  <!-- 生成物: knowledge/img/color-fix/rec.mjs → inline.mjs。ここを直接直さない -->
  <header class="rec-page rec-head">
    <p class="rec-head__back"><a href="color-fix.html">← 記事「ダメなUIを4段階で直す」</a></p>
    <h1>撮影メモ：ダメなUIを4段階で直す</h1>
    <p class="rec-head__lede">Figmaで直しながら話すための手元メモ。1か所ずつ、ゴールの画像・変える値・話すポイント。</p>
  </header>

  <main class="rec-page">
    <section class="rec-flow" id="flow" aria-labelledby="flow-h">
      <h2 id="flow-h">全体の流れ</h2>
      <ol class="rec-steps">${flow}
      </ol>
      <ul class="rec-rules">
        <li>直すのは色だけ。ボタンや行の大きさと位置は変えない</li>
        <li>1か所は1回だけ変える。前の段階と見比べれば、その章の差だけが見える</li>
        <li>章の順はA・B・D・C。数値で確かめるのは最後に1回だけ</li>
        <li>画像の紫の枠は変えた場所の目印（画面の一部ではない）</li>
      </ul>
      <div class="rec-pair">
        <figure class="rec-fig">
          <figcaption class="rec-lbl rec-lbl--now">今（ダメUI）</figcaption>
          <img class="shot" data-img="full-before" alt="${esc(altOf("full-before"))}">
        </figure>
        <figure class="rec-fig">
          <figcaption class="rec-lbl rec-lbl--goal">ゴール（4段階の後）</figcaption>
          <img class="shot" data-img="full-step4" alt="${esc(FULL_ALT["full-step4"])}">
        </figure>
      </div>
    </section>
${stagesHtml}
  </main>
</body>
</html>
`;
writeFileSync(OUT, html);
console.log(`OK: ${OUT}（カード ${n} 枚・共通CSS ${common} 行）`);
