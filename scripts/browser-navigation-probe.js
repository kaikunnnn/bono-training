/* Paste into DevTools Console for a permitted test session. No app import.
 * Read-only diagnostics: no cookies/storage, bodies, account IDs or query values.
 * Heading + two animation frames is an APPROXIMATION, not LCP/fully-ready time.
 * Read results: JSON.stringify(window.bonoNavigationProbe.results)
 * Cleanup: window.bonoNavigationProbe.stop() (also stopped by page reload).
 */
(() => {
  window.bonoNavigationProbe?.stop();
  const results = [];
  let active;
  const heading = () => document.querySelector("main h1")?.textContent?.trim();
  const allowed = (path) => /^\/(top\/?$|lessons(?:\/|$)|contents\/|mypage\/?$)/.test(path);
  const round = (value) => Math.round(value);
  function finish(status, run = active) {
    if (!run || active !== run) return;
    clearTimeout(run.timer);
    active = undefined;
    const rsc = performance.getEntriesByType("resource").filter((entry) => {
      const url = new URL(entry.name);
      return url.origin === location.origin && url.pathname === run.to && url.searchParams.has("_rsc");
    }).slice(-3).map((entry) => ({
      startedBeforeClick: entry.startTime < run.start,
      startRelativeMs: round(entry.startTime - run.start),
      durationMs: round(entry.duration),
      requestToFirstByteMs: round(entry.responseStart - entry.requestStart),
      encodedBytes: entry.encodedBodySize,
      transferredBytes: entry.transferSize,
    }));
    const result = { from: run.from, to: run.to, status, elapsedMs: round(performance.now() - run.start), rsc };
    results.push(result);
    console.log("BONO_NAV " + JSON.stringify(result));
  }
  function check() {
    const run = active;
    if (!run || run.scheduled || location.pathname !== run.to) return;
    const current = heading();
    if (!current || current === run.heading) return;
    run.scheduled = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (location.pathname === run.to && heading() === current && document.visibilityState === "visible") {
        finish("heading-two-frames", run);
      } else {
        run.scheduled = false;
        check();
      }
    }));
  }
  function click(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!anchor || anchor.download || (anchor.target && anchor.target !== "_self")) return;
    const url = new URL(anchor.href);
    if (url.origin !== location.origin || !allowed(url.pathname) || url.pathname === location.pathname) return;
    finish("superseded");
    active = { from: location.pathname, to: url.pathname, start: performance.now(), heading: heading() };
    active.timer = setTimeout(() => finish("timeout-not-measured"), 15000);
  }
  const observer = new MutationObserver(check);
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  document.addEventListener("click", click, true);
  window.bonoNavigationProbe = {
    results,
    stop() {
      finish("stopped");
      observer.disconnect();
      document.removeEventListener("click", click, true);
    },
  };
  console.log("BONO_NAV ready; existing prefetch/cache preserved; back/forward is not measured.");
})();
