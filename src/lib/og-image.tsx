import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * 汎用OGP画像生成（Figma「自動OGP」テンプレート準拠）
 * https://www.figma.com/design/guBDXL60A3s92APyeH7KQq/自動OGP?node-id=1-76
 *
 * 固定部分（ぼかしグラデーション背景 + BONOアウトラインロゴ）は Satori が
 * blur(215px) を再現できないため、Figma から書き出した画像をそのまま敷く。
 * 可変部分はタイトル（M PLUS 1 Medium 40px）とサブコピー（Regular 24px）のみ。
 */

// Figma 実測値（node 1:76）
const TEXT_LEFT = 80;
const TEXT_TOP = 453;
const TEXT_WIDTH = 1012;
const TEXT_GAP = 25;
const LOGO = { left: 81, top: 125, width: 1033, height: 240 };
// 40px時に1012px幅へ収まる目安（約25文字）。超えたら2行想定で縮小する
const TITLE_MAX_CHARS_1LINE = 25;

/**
 * Google Fonts から M PLUS 1 を「必要な文字だけ」サブセット取得する（動的OGPの定石）。
 * Satori は woff2 非対応のため、woff2 を返さない古いUAを名乗って TTF を受け取る。
 */
async function loadMPlus1(weight: 400 | 500, text: string): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=M+PLUS+1:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (
    await fetch(cssUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:10.0) Gecko/20100101 Firefox/10.0" },
    })
  ).text();
  // Satori は ttf/otf/woff 対応（woff2 のみ非対応）
  const match = css.match(/src:\s*url\((.+?)\)\s*format\(['"]?(?:opentype|truetype|woff)['"]?\)/);
  if (!match) throw new Error(`M PLUS 1 (${weight}) のフォントCSSを解釈できませんでした`);
  const res = await fetch(match[1]);
  if (!res.ok) throw new Error(`M PLUS 1 (${weight}) の取得に失敗しました: ${res.status}`);
  return res.arrayBuffer();
}

async function loadAssets() {
  // Node.js ランタイム前提（Edge は Hobby プランの 1MB 上限を超えるため不使用）。
  // Next.js 16 の OGP ガイドに従い、ローカルアセットはプロジェクトルート基準で読む。
  // import.meta.url 基準の URL は webpack に公開URLへ変換され、readFile では扱えない。
  const [bgBuf, logoSvg] = await Promise.all([
    readFile(join(process.cwd(), "src/lib/og-assets/og-bg.jpg")),
    readFile(join(process.cwd(), "src/lib/og-assets/bono-outline.svg"), "utf8"),
  ]);
  const bg = bgBuf.buffer.slice(bgBuf.byteOffset, bgBuf.byteOffset + bgBuf.byteLength);
  // SVG は data URI で渡す（ArrayBuffer だと Satori が MIME を判別できない）
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;
  return { bg, logoDataUri };
}

export async function generateOgImage({
  title,
  description,
}: {
  /** 旧テンプレートのバッジ文言。新デザインでは使用しない（互換のため受け取りは許容） */
  label?: string;
  title: string;
  description?: string;
}) {
  const sub = description ?? "";
  const { bg, logoDataUri } = await loadAssets();
  const [fontBold, fontRegular] = await Promise.all([
    loadMPlus1(500, title),
    sub ? loadMPlus1(400, sub) : Promise.resolve(null),
  ]);

  // 長いタイトル（2行想定）は 40px → 34px に自動縮小してセーフエリアを守る
  const titleSize = title.length > TITLE_MAX_CHARS_1LINE ? 34 : 40;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#ffffff",
          overflow: "hidden",
        }}
      >
        {/* 固定背景（ぼかしグラデーション + ノイズ） */}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          // @ts-expect-error Satori は ArrayBuffer を src に受け付ける
          src={bg}
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630 }}
        />

        {/* BONO アウトラインロゴ（固定） */}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={logoDataUri}
          style={{
            position: "absolute",
            left: LOGO.left,
            top: LOGO.top,
            width: LOGO.width,
            height: LOGO.height,
          }}
        />

        {/* 可変テキスト（タイトル + サブコピー） */}
        <div
          style={{
            position: "absolute",
            left: TEXT_LEFT,
            top: TEXT_TOP,
            width: TEXT_WIDTH,
            display: "flex",
            flexDirection: "column",
            gap: TEXT_GAP,
            color: "#000000",
          }}
        >
          <div
            style={{
              fontFamily: "M PLUS 1",
              fontWeight: 500,
              fontSize: titleSize,
              lineHeight: 1.32,
              wordBreak: "break-word",
            }}
          >
            {title}
          </div>
          {sub && (
            <div
              style={{
                fontFamily: "M PLUS 1",
                fontWeight: 400,
                fontSize: 24,
                lineHeight: 1.32,
                wordBreak: "break-word",
              }}
            >
              {sub}
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "M PLUS 1", data: fontBold, weight: 500 as const, style: "normal" as const },
        ...(fontRegular
          ? [{ name: "M PLUS 1", data: fontRegular, weight: 400 as const, style: "normal" as const }]
          : []),
      ],
    }
  );
}
