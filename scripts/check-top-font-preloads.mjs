// Read-only production-build regression check. Does not log in or read cookies.
const base = new URL(process.argv[2] || 'http://127.0.0.1:3217');
if (!['127.0.0.1', 'localhost'].includes(base.hostname)) throw new Error('Use a local preview');
async function read(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'error' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}
const response = await fetch(new URL('/top', base), { signal: AbortSignal.timeout(20000), redirect: 'error' });
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const html = await response.text();
const links = [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) =>
  Object.fromEntries([...tag.matchAll(/\b([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value.replaceAll('&amp;', '&')])));
// Next/React can promote preload tags to the HTTP Link header while streaming.
for (const [, href, parameters] of (response.headers.get('link') || '').matchAll(/<([^>]+)>\s*;([^,]+)/g)) {
  const attrs = Object.fromEntries([...parameters.matchAll(/([\w-]+)=(?:"([^"]*)"|([^;\s]+))/g)]
    .map(([, key, quoted, plain]) => [key, quoted ?? plain]));
  links.push({ ...attrs, href });
}
const styles = links.filter(link => link.rel === 'stylesheet' && link.href)
  .map(link => new URL(link.href, base));
if (!styles.length) throw new Error('No stylesheet links found');
const monoFiles = new Set();
for (const url of styles) {
  if (url.origin !== base.origin) throw new Error('Unexpected stylesheet origin');
  const css = await read(url);
  for (const [, body] of css.matchAll(/@font-face\{([^}]+)\}/g)) {
    if (!/font-family:[^;]*Geist Mono/.test(body)) continue;
    const source = body.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
    if (source) monoFiles.add(new URL(source, url).pathname);
  }
}
if (!monoFiles.size) throw new Error('Code font CSS missing: it must remain available on demand');
const fontPreloads = links.filter(link => link.rel === 'preload' && link.as === 'font' && link.href);
if (!fontPreloads.length) throw new Error('No font preloads observed; cannot validate this response shape');
const unwanted = fontPreloads.filter(link => monoFiles.has(new URL(link.href, base).pathname));
if (unwanted.length) throw new Error(`Unused code font is still preloaded (${unwanted.length} link)`);
console.log(JSON.stringify({ page: new URL('/top', base).href, codeFontAvailable: true,
  codeFontPreloads: 0, otherFontPreloads: fontPreloads.length }));
