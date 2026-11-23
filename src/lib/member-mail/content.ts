/**
 * 会員メール（#264）の文面の検査と組み立て。純粋関数のみ。
 *
 * 本文（campaign.body）の書き方（オーナーが毎週書く「差し込み型の入れ物」）:
 *   - 段落は空行で区切る。段落の中の改行はそのまま改行になる
 *   - 行頭 "## " は見出し、行頭 "- " は箇条書き
 *   - リンクは [文字](https://...)。BONO のサイトへのリンクには ?from=email_xxx を自動で付ける（264 §5-10）
 *   - HTML は書けない（すべて文字としてエスケープする）
 *
 * 末尾には必ず法定表示（特定電子メール法: 送り主・受信拒否できること・配信停止リンク・住所と問い合わせ先の場所）を付ける（264 §5-12）。
 *
 * ★メールの HTML では CSS 変数（デザイントークン）が使えない（多くのメールソフトが非対応）。
 *   色は .claude/design-system/colors_and_type.css のトークンの値をここに写して使う（EMAIL_COLORS）。
 */
import { FROM_OF_KIND, type Campaign, type MailKind } from "./types";

/** colors_and_type.css の値の写し（メール用） */
const EMAIL_COLORS = {
  textPrimary: "#021710", // --text-primary
  textSecondary: "#354540", // --text-secondary
  textMuted: "#677470", // --text-muted
  bgBase: "#F9F9F7", // --bg-base
  bgSurface: "#FFFFFF", // --bg-surface
  borderLight: "#D4D6CC", // --border-light
} as const;

/** 法定表示の送り主名（/tokushoho の事業者名と合わせる。264 §5-12） */
export const SENDER_LEGAL_NAME = "カイクン（BONO）";

/** 誰に送っているかの一文（相手に合った言葉にする。264 §8-2） */
const AUDIENCE_LINE: Record<MailKind, string> = {
  weekly: "このメールは、BONOの会員の方にお送りしています。",
  comeback: "このメールは、BONOの会員の方にお送りしています。",
  renewal: "このメールは、BONOの会員の方にお送りしています。",
  signup: "このメールは、BONOにご登録いただいた方にお送りしています。",
  winback: "このメールは、以前BONOをご利用いただいた方にお送りしています。",
};

const LINK_RE = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;

/** 送れない理由。null なら送ってよい（承認・空・仮の文字・https 以外のURL） */
export function getCampaignBlockReason(campaign: Campaign): string | null {
  if (campaign.approvedVersion === null || campaign.approvedVersion !== campaign.contentVersion) {
    return "message_not_approved";
  }
  if (campaign.subject.trim().length === 0) return "subject_empty";
  if (campaign.body.trim().length === 0) return "body_empty";
  const all = `${campaign.subject}\n${campaign.preheader}\n${campaign.body}`;
  if (/TBD|XXXX|\{\{[^}]*\}\}/i.test(all)) return "message_placeholder";
  for (const m of campaign.body.matchAll(LINK_RE)) {
    if (!isHttpsUrl(m[2])) return "message_non_https_url";
  }
  // リンク記法の外に書かれた http:// などのURL
  const outside = campaign.body.replace(LINK_RE, "");
  for (const m of outside.matchAll(/\b([a-z][a-z0-9+.-]*):\/\//gi)) {
    if (m[1].toLowerCase() !== "https") return "message_non_https_url";
  }
  if (/\b(javascript|data|vbscript):/i.test(campaign.body)) return "message_non_https_url";
  return null;
}

function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** BONO のサイトへのリンクなら ?from=email_xxx を付ける（既にあれば上書き） */
export function withFromParam(href: string, from: string, siteUrl: string): string {
  let url: URL;
  let site: URL;
  try {
    url = new URL(href);
    site = new URL(siteUrl);
  } catch {
    return href;
  }
  const bare = (h: string) => h.replace(/^www\./, "");
  if (bare(url.hostname) !== bare(site.hostname)) return href;
  url.searchParams.set("from", from);
  return url.toString();
}

interface Block {
  type: "p" | "h" | "ul";
  lines: string[];
}

function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of body.replace(/\r\n?/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim().length > 0);
    if (lines.length === 0) continue;
    if (lines.length === 1 && lines[0].startsWith("## ")) {
      blocks.push({ type: "h", lines: [lines[0].slice(3).trim()] });
    } else if (lines.every((l) => l.startsWith("- "))) {
      blocks.push({ type: "ul", lines: lines.map((l) => l.slice(2).trim()) });
    } else {
      blocks.push({ type: "p", lines });
    }
  }
  return blocks;
}

function inlineHtml(line: string, from: string, siteUrl: string): string {
  let out = "";
  let last = 0;
  for (const m of line.matchAll(LINK_RE)) {
    out += escapeHtml(line.slice(last, m.index));
    const href = withFromParam(m[2], from, siteUrl);
    out += `<a href="${escapeHtml(href)}" style="color:${EMAIL_COLORS.textPrimary};text-decoration:underline;">${escapeHtml(m[1])}</a>`;
    last = (m.index ?? 0) + m[0].length;
  }
  return out + escapeHtml(line.slice(last));
}

function inlineText(line: string, from: string, siteUrl: string): string {
  return line.replace(LINK_RE, (_w, label: string, href: string) => `${label}（${withFromParam(href, from, siteUrl)}）`);
}

export interface FooterLinks {
  unsubscribeUrl: string;
  tokushohoUrl: string;
}

/** 法定表示（テキスト版） */
export function renderFooterText(kind: MailKind, links: FooterLinks): string {
  return [
    "――――――――",
    AUDIENCE_LINE[kind],
    `送り主：${SENDER_LEGAL_NAME}`,
    "このメールの受け取りをやめる場合は、こちらから手続きできます。",
    links.unsubscribeUrl,
    "住所・お問い合わせ先は、特定商取引法に基づく表記のページに載せています。",
    links.tokushohoUrl,
  ].join("\n");
}

/** 法定表示（HTML 版） */
export function renderFooterHtml(kind: MailKind, links: FooterLinks): string {
  const p = (inner: string) =>
    `<p style="margin:0 0 8px;font-size:12px;line-height:1.7;color:${EMAIL_COLORS.textMuted};">${inner}</p>`;
  const a = (href: string, label: string) =>
    `<a href="${escapeHtml(href)}" style="color:${EMAIL_COLORS.textMuted};text-decoration:underline;">${escapeHtml(label)}</a>`;
  return [
    `<hr style="border:none;border-top:1px solid ${EMAIL_COLORS.borderLight};margin:32px 0 16px;">`,
    p(escapeHtml(AUDIENCE_LINE[kind])),
    p(`送り主：${escapeHtml(SENDER_LEGAL_NAME)}`),
    p(`このメールの受け取りをやめる場合は、${a(links.unsubscribeUrl, "こちらから配信停止")}の手続きができます。`),
    p(`住所・お問い合わせ先は、${a(links.tokushohoUrl, "特定商取引法に基づく表記")}のページに載せています。`),
  ].join("\n");
}

export interface RenderedMail {
  subject: string;
  html: string;
  text: string;
}

/** 1通分を組み立てる（差し込むのは配信停止のURLだけ。名前などは入れない） */
export function renderMail(campaign: Campaign, opts: { siteUrl: string; unsubscribeUrl: string }): RenderedMail {
  const from = FROM_OF_KIND[campaign.kind];
  const links: FooterLinks = {
    unsubscribeUrl: opts.unsubscribeUrl,
    tokushohoUrl: `${opts.siteUrl}/tokushoho`,
  };
  const blocks = parseBlocks(campaign.body);

  const bodyHtml = blocks
    .map((b) => {
      if (b.type === "h") {
        return `<h2 style="margin:28px 0 12px;font-size:18px;line-height:1.5;font-weight:700;color:${EMAIL_COLORS.textPrimary};">${inlineHtml(b.lines[0], from, opts.siteUrl)}</h2>`;
      }
      if (b.type === "ul") {
        const items = b.lines
          .map((l) => `<li style="margin:0 0 6px;">${inlineHtml(l, from, opts.siteUrl)}</li>`)
          .join("");
        return `<ul style="margin:0 0 16px;padding-left:20px;font-size:16px;line-height:1.8;color:${EMAIL_COLORS.textSecondary};">${items}</ul>`;
      }
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:${EMAIL_COLORS.textSecondary};">${b.lines
        .map((l) => inlineHtml(l, from, opts.siteUrl))
        .join("<br>")}</p>`;
    })
    .join("\n");

  const preheader = campaign.preheader.trim()
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(campaign.preheader.trim())}</div>`
    : "";

  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(campaign.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_COLORS.bgBase};">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_COLORS.bgBase};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${EMAIL_COLORS.bgSurface};border-radius:16px;">
<tr><td style="padding:32px 24px;font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN','Noto Sans JP',Meiryo,sans-serif;">
${bodyHtml}
${renderFooterHtml(campaign.kind, links)}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const bodyText = blocks
    .map((b) => {
      if (b.type === "h") return `■ ${inlineText(b.lines[0], from, opts.siteUrl)}`;
      if (b.type === "ul") return b.lines.map((l) => `・${inlineText(l, from, opts.siteUrl)}`).join("\n");
      return b.lines.map((l) => inlineText(l, from, opts.siteUrl)).join("\n");
    })
    .join("\n\n");
  const text = `${bodyText}\n\n${renderFooterText(campaign.kind, links)}\n`;

  return { subject: campaign.subject.trim(), html, text };
}

/** RFC 8058 のワンクリック配信停止ヘッダー（264 §5-8） */
export function unsubscribeHeaders(oneClickUrl: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${oneClickUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
