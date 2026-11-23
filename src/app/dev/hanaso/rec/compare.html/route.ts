import { REC_HEADERS } from "../_inject";

/**
 * /dev/hanaso/rec/compare.html — ビフォーとアフターを左右に並べた収録専用の画面（#296）。
 * 中身は ./before.html と ./after.html の iframe。キー操作は下の HTML コメントに書いてある。
 * 本番では src/proxy.ts の DEV_ONLY_PATH_PREFIXES（"/dev"）で 404 になる。
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>ハナソ 収録用 ビフォー・アフター</title>
<!--
  キー操作（画面には何も出さない。iPhone の中をクリックした後でも効く）
    1 = 最初の画面（両方）
    2 = メールとパスワード（両方）
    3 = プロフィール（両方。ビフォーは「名前・ユーザー名」）
    4 = 興味（両方）
    5 = ホーム（両方）
    6 = 言語（アフターだけ。ビフォーは今の画面のまま）
    7 = 生年月日（アフターだけ。ビフォーは今の画面のまま）
    H = 「ビフォー」「アフター」の文字を出す・隠す
    R = 両方を最初の画面に戻す（入力もリセット）。iPhone の中をクリックした後は、その1台だけ
    ← = 両方を1画面戻す。iPhone の中をクリックした後は、その1台だけ
  文字を入力している最中（入力欄にカーソルがあるとき）は、どのキーも反応しない
-->
<style>
:root { --rec-bg: #e6ebe8; --rec-label: #5c6b64; --label-h: 28px; }
html, body { height: 100%; margin: 0; }
body {
  background: var(--rec-bg); overflow: hidden;
  display: flex; align-items: center; justify-content: center; gap: 0;
  font-family: "Noto Sans JP", "Hiragino Sans", system-ui, sans-serif;
}
.col { display: flex; flex-direction: column; align-items: center; }
.label {
  height: var(--label-h); line-height: var(--label-h); font-size: 13px; font-weight: 600;
  letter-spacing: .08em; color: var(--rec-label);
}
.labels-off .label { visibility: hidden; }
iframe {
  display: block; border: 0; background: transparent;
  height: calc(100vh - var(--label-h));
  /* iPhone の影（左右に約60px広がる）が iframe の端で切れて四角く見えないよう、横に余裕を持たせる */
  width: min(calc((100vh - var(--label-h)) * 0.62), 50vw);
}
</style>
</head>
<body>
<div class="col"><div class="label">ビフォー</div><iframe id="f-before" src="before.html" title="ビフォー"></iframe></div>
<div class="col"><div class="label">アフター</div><iframe id="f-after" src="after.html" title="アフター"></iframe></div>
<script>
(function () {
  var before = document.getElementById("f-before"), after = document.getElementById("f-after");
  // キー → 画面。before が null の画面はアフターだけ切り替える
  var KEYS = {
    "1": { before: "start", after: "start" },
    "2": { before: "account", after: "account" },
    "3": { before: "profile", after: "profile" },
    "4": { before: "interest", after: "interest" },
    "5": { before: "home", after: "home" },
    "6": { before: null, after: "lang" },
    "7": { before: null, after: "birth" }
  };
  function send(frame, msg) { frame.contentWindow.postMessage(msg, location.origin); }
  function handle(key) {
    if (key === "h") { document.body.classList.toggle("labels-off"); return; }
    var t = KEYS[key];
    if (!t) return;
    if (t.before) send(before, { type: "hanaso-rec", action: "goto", screen: t.before });
    if (t.after) send(after, { type: "hanaso-rec", action: "goto", screen: t.after });
  }
  document.addEventListener("keydown", function (e) {
    if (e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k === "r") { e.preventDefault(); [before, after].forEach(function (f) { send(f, { type: "hanaso-rec", action: "reset" }); }); return; }
    if (k === "arrowleft") { e.preventDefault(); [before, after].forEach(function (f) { send(f, { type: "hanaso-rec", action: "back" }); }); return; }
    if (/^[1-7]$/.test(k) || k === "h") { e.preventDefault(); handle(k); }
  });
  // iPhone の中にフォーカスがあるときは、iframe 側が 1〜7・H をここへ渡してくる
  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin) return;
    var d = e.data;
    if (!d || d.type !== "hanaso-rec-key") return;
    if (e.source !== before.contentWindow && e.source !== after.contentWindow) return;
    handle(String(d.key));
  });
})();
</script>
</body>
</html>
`;

export async function GET() {
  return new Response(HTML, { headers: REC_HEADERS });
}
