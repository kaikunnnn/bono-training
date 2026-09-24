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
  if (window.__bonoAnalyticsStarted) return;
  window.__bonoAnalyticsStarted = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', '${GA_MEASUREMENT_ID}');
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
  document.head.appendChild(script);
})();`;
