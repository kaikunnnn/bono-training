#!/usr/bin/env node
/* ============================================================
   inline.mjs — *.src.html の画像を data URI にして knowledge/ に書き出す
     node knowledge/img/color-fix/inline.mjs
   - color-fix.src.html → knowledge/color-fix.html（記事）
     color-fix-rec.src.html → knowledge/color-fix-rec.html（撮影メモ。src は rec.mjs が書き出す）
   - 本文を直すときは src を直してから、これを実行する（knowledge/ の2つは生成物）
   - <img data-img="名前"> → src="data:image/webp;base64,…" と width / height を付ける
     （class="zoom" は2倍で撮った切り抜きなので、半分の大きさで表示する）
     （class="spot" は変えた場所の拡大。2倍の切り抜きをそのままの画素数＝画面の2倍で表示する。縦長は高さ480pxまでに縮める。
       実際の幅は CSS の max-width:100% で枠に収まる）
   - 画像は make-images.py で作る（撮影PNG → spots.json の範囲で切り抜き・WebP・sizes.json）
   Node標準モジュールのみ。
   ============================================================ */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGES = [["color-fix.src.html", "color-fix.html"], ["color-fix-rec.src.html", "color-fix-rec.html"]];
const sizes = JSON.parse(readFileSync(join(HERE, "sizes.json"), "utf8"));

const cache = {};
for (const [srcName, outName] of PAGES) {
  const OUT = join(HERE, "..", "..", outName);
  const src = readFileSync(join(HERE, srcName), "utf8");
  let n = 0;
  const html = src.replace(/<img class="(shot|zoom|spot)" data-img="([^"]+)"/g, (_, cls, name) => {
    const sz = sizes[name];
    if (!sz) throw new Error(`画像がない: ${name}`);
    cache[name] ??= readFileSync(join(HERE, name + ".webp")).toString("base64");
    let [w, h] = cls === "zoom" ? sz.map((v) => Math.round(v / 2)) : sz;
    if (cls === "spot" && h > 480) [w, h] = [Math.round((w * 480) / h), 480];
    n++;
    return `<img class="${cls}" src="data:image/webp;base64,${cache[name]}" width="${w}" height="${h}" loading="lazy" decoding="async"`;
  });
  if (/data-img=/.test(html)) throw new Error(`${srcName}: data-img が残っている`);
  writeFileSync(OUT, html);
  console.log(`OK: ${OUT}（画像 ${n} 枚・${Buffer.byteLength(html)} bytes）`);
}
