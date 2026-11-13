import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * /dev/hanaso/rec/*（動画の収録専用の画面・#296）で共通に使う、配信時の差し込み処理。
 *
 * 元のHTML（hanaso-signup.html / hanaso-signup-after.html）はファイルを一切変えず、
 * 返す直前の文字列に次の3つを足す:
 *   1. 元のスクリプトの中にある show / goBack / clearTimers / screens を window.__hanasoRec に出す
 *      （「指定の画面へ移動」で元の画面遷移と戻る履歴をそのまま使うため）
 *   2. fit() の縮小を、操作バーの分（60px）と「等倍まで」の上限を外した計算に置き換える
 *      （1920×1080 で iPhone を縦いっぱいに近く出すため）
 *   3. 収録用のCSS（操作バー・仕様メモを隠す、背景を無地に）とJS（キー操作・postMessage）を </body> の前に足す
 * アフターの間違い（言語リストのはみ出し・ずれ等）は撮影の材料なので、アプリ内のCSSには触れない。
 * 目印の文字列が見つからないときは、差し込み前のページを黙って返さずエラーにする。
 */

export type RecKind = "before" | "after";

const HTML_PATHS: Record<RecKind, string> = {
  before: "src/content/materials/ai-research-ui/hanaso-signup.html",
  after: "src/content/materials/ai-research-ui/hanaso-signup-after.html",
};

/** 元HTMLの中で置き換える箇所（ビフォー・アフターで同じ文字列） */
const PATCHES: { find: string; replace: string }[] = [
  {
    // 1. 閉じ込められた関数を外から呼べるようにする
    find: '  window.addEventListener("resize", fit);',
    replace:
      '  window.__hanasoRec = { show: show, goBack: goBack, clearTimers: clearTimers, screens: screens };\n' +
      '  window.addEventListener("resize", fit);',
  },
  {
    // 2. 縮小の計算：外側の余白12px・操作バーなし・等倍の上限なし
    find: "    var pad = 22;",
    replace: "    var pad = 14;",
  },
  {
    find: "    var w = window.innerWidth - 32 - pad * 2, h = window.innerHeight - 32 - 60 - pad * 2;",
    replace: "    var w = window.innerWidth - 24, h = window.innerHeight - 24;",
  },
  {
    find: "    var s = Math.min(1, w / 393, h / 812);",
    replace: "    var s = Math.min(w / (393 + pad * 2), h / (812 + pad * 2));",
  },
];

const REC_STYLE = `
<style id="rec-style">
/* 収録用：アプリ以外のもの（操作バー・仕様メモ）を映さない。背景は落ち着いた無地 */
:root { --rec-bg: #e6ebe8; }
html, body { background: var(--rec-bg) !important; }
body { padding: 0 !important; gap: 0 !important; }
.bar, #spec, aside.spec { display: none !important; }
</style>`;

function recScript(kind: RecKind) {
  return `
<script id="rec-script">
/* 収録用のキー操作（画面には何も出さない）
   R = 最初の画面に戻る（入力・選択もリセット。元の「最初から」と同じ処理）
   ← = 1画面戻る（元の「戻る」と同じ処理）
   1〜7・H = compare.html の中で開いているときだけ、親のページに渡す
   postMessage {type:"hanaso-rec", action:"goto"|"reset"|"back", screen} で画面を切り替える */
(function () {
  var KIND = ${JSON.stringify(kind)};
  var R = window.__hanasoRec;
  if (!R) { console.error("[rec] __hanasoRec が見つかりません"); return; }
  var embedded = window.parent !== window;

  // ビフォーには data-id がないので、data-step と並び順から決める（step 6 は「スタート」と「ホーム」の2枚）
  var BEFORE_STEP = { start: "1", account: "2", profile: "3", interest: "5" };
  function find(name) {
    var list = R.screens;
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (s.id === "ready") continue;
      if (KIND === "after" && s.dataset.id === name) return i;
      if (KIND === "before") {
        if (name === "home" && s.classList.contains("tl")) return i;
        if (BEFORE_STEP[name] && s.dataset.step === BEFORE_STEP[name]) return i;
      }
    }
    return -1;
  }
  function goTo(name) {
    var i = find(name);
    if (i < 0) return false; // その画面がない側（ビフォーの言語など）は今の画面のまま
    R.clearTimers();
    R.show(i);
    return true;
  }
  function reset() { document.getElementById("b-reset").click(); }
  function back() { document.getElementById("b-back").click(); }

  function isTyping(e) {
    if (e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return true;
    var t = e.target;
    if (!t || !t.tagName) return false;
    var tag = t.tagName.toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || t.isContentEditable;
  }
  document.addEventListener("keydown", function (e) {
    if (isTyping(e)) return;
    var k = e.key;
    if (k === "r" || k === "R") { e.preventDefault(); reset(); return; }
    if (k === "ArrowLeft") { e.preventDefault(); back(); return; }
    if (embedded && (/^[1-7]$/.test(k) || k === "h" || k === "H")) {
      e.preventDefault();
      window.parent.postMessage({ type: "hanaso-rec-key", key: k.toLowerCase() }, location.origin);
    }
  });

  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin) return;
    var d = e.data;
    if (!d || d.type !== "hanaso-rec") return;
    if (d.action === "goto") goTo(String(d.screen));
    else if (d.action === "reset") reset();
    else if (d.action === "back") back();
  });
})();
</script>`;
}

export async function buildRecHtml(kind: RecKind): Promise<string> {
  let html = await readFile(join(process.cwd(), HTML_PATHS[kind]), "utf8");
  for (const p of PATCHES) {
    if (!html.includes(p.find)) {
      throw new Error(`[rec] ${kind}: 差し込みの目印が見つかりません: ${p.find.trim()}`);
    }
    html = html.replace(p.find, p.replace);
  }
  const headEnd = html.lastIndexOf("</head>");
  const bodyEnd = html.lastIndexOf("</body>");
  if (headEnd < 0 || bodyEnd < 0) {
    throw new Error(`[rec] ${kind}: </head> か </body> が見つかりません`);
  }
  html =
    html.slice(0, headEnd) +
    REC_STYLE +
    "\n" +
    html.slice(headEnd, bodyEnd) +
    recScript(kind) +
    "\n" +
    html.slice(bodyEnd);
  return html;
}

export const REC_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
} as const;
