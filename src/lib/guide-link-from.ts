// src/lib/guide-link-from.ts — ガイド記事の中のリンクに「どこから来たか」の ?from= を付ける（rebono 279-E）
//
// GA4 で「解説記事 → ロードマップ・レッスン」をリンクの場所ごとに数えるため。
// Sanity の本番データは変えず、表示するときにだけ付ける（リンク先はすべて canonical 付きなので検索の評価は分かれない）。
// 値は「記事の印-見出しの場所」。h2 が「ステップN」なら stepN、それ以外は h2 の順番で sN、最初の h2 より前は intro。

/** 本文のリンクに from を付ける記事と、その印。ここに無い記事は何もしない */
export const GUIDE_LINK_FROM_PREFIX: Record<string, string> = {
  "rdm-howtostart-roadmap": "guide-rdm",
};

/** 記事の最後・本文中の紹介ブロック（#280）のリンクに付ける from。全部のガイド記事で使う */
export function guidePromoFrom(slug: string, placement: "inline" | "end"): string {
  return `${GUIDE_LINK_FROM_PREFIX[slug] ?? `guide-${slug}`}-promo-${placement}`;
}

const SITE_HOSTS = new Set(["www.bo-no.design", "bo-no.design"]);

/** サイト内のリンクなら from を付けた URL を返す。外部リンク・すでに from があるものはそのまま */
export function withFromParam(href: string, from: string): string {
  if (!href) return href;
  const isRelative = href.startsWith("/") && !href.startsWith("//");
  let url: URL;
  try {
    url = new URL(href, "https://www.bo-no.design");
  } catch {
    return href;
  }
  if (!isRelative && !SITE_HOSTS.has(url.hostname)) return href;
  if (url.searchParams.has("from")) return href;
  url.searchParams.set("from", from);
  return isRelative ? `${url.pathname}${url.search}${url.hash}` : url.toString();
}

type Span = { text?: string };
type Node = {
  _type?: string;
  style?: string;
  children?: Span[];
  markDefs?: Array<{ _type?: string; href?: string; [k: string]: unknown }>;
  url?: string;
  [k: string]: unknown;
};

const textOf = (n: Node) => (n.children ?? []).map((c) => c?.text ?? "").join("");

/**
 * 本文（Portable Text）のリンク（文中リンクとリンクカード）に from を付けた新しい配列を返す。
 * 元の配列は変えない。_key は変えないので目次・ブロックの差し込み位置はそのまま使える。
 */
export function addGuideLinkFrom<T>(content: T[], slug: string): T[] {
  const prefix = GUIDE_LINK_FROM_PREFIX[slug];
  if (!prefix || !Array.isArray(content)) return content;

  let section = "intro";
  let h2Count = 0;
  return content.map((raw) => {
    const node = raw as unknown as Node;
    if (!node || typeof node !== "object") return raw;
    if (node._type === "block" && node.style === "h2") {
      h2Count += 1;
      const step = textOf(node).trim().match(/^ステップ\s*(\d+)/);
      section = step ? `step${step[1]}` : `s${h2Count}`;
      return raw;
    }
    const from = `${prefix}-${section}`;
    if (node._type === "linkCard" && typeof node.url === "string") {
      const url = withFromParam(node.url, from);
      return (url === node.url ? raw : { ...node, url }) as unknown as T;
    }
    if (node._type === "block" && node.markDefs?.some((m) => m._type === "link" && m.href)) {
      return {
        ...node,
        markDefs: node.markDefs.map((m) =>
          m._type === "link" && typeof m.href === "string" ? { ...m, href: withFromParam(m.href, from) } : m
        ),
      } as unknown as T;
    }
    return raw;
  });
}
