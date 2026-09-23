import Script from "next/script";
import { GA_BOOTSTRAP } from "@/lib/analytics/config";

/**
 * GA4's enhanced measurement owns pageviews, including History API navigation.
 * Do not send a second config/page_view from a pathname effect.
 * The inline guard prevents loading Google Analytics on local/preview hosts.
 */
export function GoogleAnalytics() {
  return <Script id="bono-ga4-init" strategy="afterInteractive">{GA_BOOTSTRAP}</Script>;
}
