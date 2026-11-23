import {
  LAST_PAYING_AT_STORAGE_KEY,
  MEMBER_STATUS_AT_EVENT_RESOLVER_JS,
  MEMBER_STATUS_EVENT_PARAM,
} from "./member-status";

/** One production stream for both Next.js and the legacy Webflow pages. */
export const GA_MEASUREMENT_ID = "G-T8RTCENVBF";
export const ANALYTICS_PRODUCTION_HOSTS = ["www.bo-no.design", "bo-no.design"] as const;

export function isAnalyticsHost(hostname: string): boolean {
  return ANALYTICS_PRODUCTION_HOSTS.some((host) => host === hostname.toLowerCase());
}

/** The host guard runs before the Google script is requested, including on previews. */
export const GA_BOOTSTRAP = `
(function () {
  if (!${JSON.stringify(ANALYTICS_PRODUCTION_HOSTS)}.includes(window.location.hostname.toLowerCase())) return;
  // 自動操作ブラウザ（Playwright の本番E2E等）は計測しない。新規・Direct の偽アクセスで数字が汚れるため（#258）
  if (window.navigator && window.navigator.webdriver) return;
  if (window.__bonoAnalyticsStarted) return;
  window.__bonoAnalyticsStarted = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // 初回 page_view は config で送られるので、イベント単位の会員状態（#266）は config より前に set する。
  // 値はサーバーが描画した MemberStatusRecorder の隠し要素から読む（無ければ何もしない）。
  try {
    var memberEl = document.querySelector('[data-ga-member-status]');
    var memberStatus = memberEl && memberEl.getAttribute('data-ga-member-status');
    if (memberStatus === 'paying' || memberStatus === 'free' || memberStatus === 'anonymous') {
      var lastPayingAt = null;
      try { lastPayingAt = window.localStorage.getItem(${JSON.stringify(LAST_PAYING_AT_STORAGE_KEY)}); } catch (e) {}
      var resolveMemberStatus = ${MEMBER_STATUS_AT_EVENT_RESOLVER_JS};
      window.gtag('set', { ${JSON.stringify(MEMBER_STATUS_EVENT_PARAM)}: resolveMemberStatus(memberStatus, lastPayingAt, Date.now()) });
    }
  } catch (e) {}
  window.gtag('config', '${GA_MEASUREMENT_ID}');
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
  document.head.appendChild(script);
})();`;
