// HTTP diagnostic only: not LCP, hydration, or member/client-side navigation.
// Usage: npm run perf:top-response -- http://127.0.0.1:3217/top
const url = new URL(process.argv[2] || "http://127.0.0.1:3217/top");
if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || !['/', '/top'].includes(url.pathname)) {
  throw new Error('Use a top-page URL without credentials or query parameters.');
}

const runs = [];
for (let run = 1; run <= 5; run++) {
  const start = performance.now();
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'identity' },
    signal: AbortSignal.timeout(30_000),
    redirect: 'error',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const headersMs = performance.now() - start;
  const decoder = new TextDecoder();
  let html = '';
  let heroHtmlMs = null;
  for await (const chunk of response.body) {
    html += decoder.decode(chunk, { stream: true });
    if (heroHtmlMs === null && html.includes('ユーザーのきもちを動かす力を')) {
      heroHtmlMs = performance.now() - start;
    }
  }
  html += decoder.decode();
  const h1Count = (html.match(/<h1[ >]/g) || []).length;
  if (heroHtmlMs === null || h1Count !== 1) throw new Error('Missing top hero or duplicate h1.');
  runs.push({
    run, headersMs: Math.round(headersMs), heroHtmlMs: Math.round(heroHtmlMs),
    endMs: Math.round(performance.now() - start), bytes: Buffer.byteLength(html), h1Count,
  });
}
console.log(JSON.stringify({
  at: new Date().toISOString(), url: url.href, authentication: 'guest (no cookies)',
  cache: 'not cleared; run 1 includes process/connection warm-up; server/CDN cache is uncontrolled',
  note: 'HTML arrival only, not browser paint or Web Vitals. Do not compare this to member LCP.',
  runs,
}, null, 2));
