/* DevTools-only diagnostic. Requires browser-navigation-probe.js first.
 * Clicks EXISTING same-origin links. No credential reads or stateful controls.
 * Not native input/INP: this is a warm-router DOM-update diagnostic.
 * Usage: void bonoRun(5).catch(e => console.log('BONO_ABORT ' + e.message))
 */
window.bonoRun = async function (n) {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const paths = [
    '/',
    '/top',
    '/lessons/ui-design-flow-lv1',
    '/contents/uidesigncycle_overview_01',
    '/contents/howto_uidesigncycle',
    '/contents/uidesigncycle_overview_01',
  ];
  const start = window.bonoNavigationProbe.results.length;
  for (let round = 1; round <= n; round++) {
    for (const path of paths) {
      if (path === '/' && location.pathname === '/mypage') continue;
      const anchor = [...document.querySelectorAll('a[href]')].find(a =>
        new URL(a.href).origin === location.origin && new URL(a.href).pathname === path);
      if (!anchor) throw Error('Missing existing link ' + path);
      const count = window.bonoNavigationProbe.results.length;
      const heading = document.querySelector('main h1')?.textContent;
      const limit = performance.now() + 16000;
      anchor.click();
      while (performance.now() < limit) {
        if (path === '/'
          ? location.pathname === '/mypage' && !!document.querySelector('main h1')?.textContent && document.querySelector('main h1')?.textContent !== heading
          : window.bonoNavigationProbe.results.length > count) break;
        await wait(50);
      }
      if (performance.now() >= limit) throw Error('Navigation timeout ' + path);
      if (path !== '/') {
        const result = window.bonoNavigationProbe.results.at(-1);
        result.round = round;
        if (result.status !== 'heading-two-frames') throw Error(result.status);
      }
      await wait(1000);
    }
  }
  console.log('BONO_SERIES ' + JSON.stringify({
    port: location.port, width: innerWidth, height: innerHeight,
    results: window.bonoNavigationProbe.results.slice(start),
  }));
};
