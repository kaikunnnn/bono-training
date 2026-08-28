/**
 * サイト移行 #198 / B-4「Week1止血の撤去」
 *
 * ドメイン切替（cutover）の前後を `NEXT_PUBLIC_SITE_URL` の host で判定する。
 *
 * Week1 の SEO 止血（cross-domain canonical・sitemap 除外・本番 sitemap の fetch）は
 * 「新アプリ（beta）と Webflow 本番（www.bo-no.design）が別ドメインで併存している間」
 * だけ有効であるべきもの。切替後は www.bo-no.design 自体がこの Next.js アプリになるため、
 * 止血が自己参照になって有害化する（自記事を自 sitemap から除外／自ホストを本番扱いで
 * 二重化）。
 *
 * そこでファイル削除ではなく env 判定で自己無効化する。切替時に Vercel の
 * `NEXT_PUBLIC_SITE_URL` を本番ドメインへ変更（＋再デプロイ）するだけで止血が外れる。
 *
 * 判定は proxy.ts / missingContentRedirect.ts と同じ本番ホストパターンに揃える。
 *
 * フェイルセーフ: env 未設定・URL パース失敗はいずれも「切替前（止血継続）」に倒す。
 */

// proxy.ts / missingContentRedirect.ts と同一。apex(bo-no.design) と www の両方を本番とみなす。
const PRODUCTION_HOST_PATTERN = /^(www\.)?bo-no\.design$/;

/**
 * まだドメイン切替前（＝止血を有効にすべき状態）なら true。
 *
 * true になる条件: `NEXT_PUBLIC_SITE_URL` の host が本番ドメイン
 * （bo-no.design / www.bo-no.design）で **ない** とき（beta の
 * bono-training.vercel.app や既定の app.bo-no.design 等）。
 *
 * false になる条件: host が本番ドメインのとき（＝切替後 → 止血を自己無効化）。
 *
 * 注意: `NEXT_PUBLIC_*` はビルド時にインライン展開されるため、挙動を切り替えるには
 * env 変更後に **再ビルド／再デプロイ** が必要（実行時の env 差し替えだけでは変わらない）。
 */
export function isPreCutover(): boolean {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    // env 未設定は切替前扱い（安全側：止血継続）。
    return true;
  }

  let host: string;
  try {
    host = new URL(siteUrl).host.split(":")[0];
  } catch {
    // パース失敗も切替前扱い（安全側：止血継続）。
    return true;
  }

  return !PRODUCTION_HOST_PATTERN.test(host);
}
