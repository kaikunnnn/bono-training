/* Read-only DevTools diagnostic after a FULL /top navigation, not an SPA visit.
 * Fix viewport, CPU, network and HTTP cache conditions before reloading.
 * Do not interact with the page until the output. No cookies/storage/user data.
 * Reads buffered LCP and navigation timings; this is lab data, not field p75.
 */
void (async () => {
  let last;
  const observer = new PerformanceObserver(list => { last = list.getEntries().at(-1); });
  observer.observe({ type: 'largest-contentful-paint', buffered: true });
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 1500));
  observer.disconnect();
  const navigation = performance.getEntriesByType('navigation')[0];
  const fcp = performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint');
  const fonts = performance.getEntriesByType('resource').filter(entry => entry.name.includes('.woff'));
  const resource = last?.url ? performance.getEntriesByName(last.url).at(-1) : null;
  console.log('BONO_TOP ' + JSON.stringify({
    port: location.port, width: innerWidth, height: innerHeight,
    visibility: document.visibilityState,
    ttfb: Math.round(navigation.responseStart), htmlEnd: Math.round(navigation.responseEnd),
    fcp: fcp?.startTime, lcp: last?.startTime,
    lcpTag: last?.element?.tagName, lcpClass: last?.element?.className,
    resource: resource ? {
      start: Math.round(resource.startTime), end: Math.round(resource.responseEnd),
      bytes: resource.encodedBodySize,
    } : null,
    fontCount: fonts.length,
    fontLastEnd: Math.round(Math.max(0, ...fonts.map(entry => entry.responseEnd))),
    htmlBytes: navigation.encodedBodySize,
  }));
})();
