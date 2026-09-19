// Explicit, local-only performance preview connected to production member auth.
// Never imports .env files, private keys, browser cookies, or account credentials.
import { readdirSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const production = 'https://www.bo-no.design';
const authOrigin = 'https://fryogvfhymnpiqwssmuu.supabase.co';
const args = process.argv.slice(2);
const verify = args.includes('--verify');
const trace = !args.includes('--no-trace');
const skipBuild = args.includes('--no-build');
const approved = args.includes('--allow-production-auth');
const dirArg = args.find(a => a.startsWith('--dir='));
const portArg = args.find(a => a.startsWith('--port='));
if (!approved || !dirArg || !portArg) {
  throw new Error('Requires --allow-production-auth --dir=ABSOLUTE_PATH --port=3217|3218 [--verify]');
}
const dir = realpathSync(dirArg.slice(6));
const port = Number(portArg.slice(7));
if (![3217, 3218].includes(port)) throw new Error('Only local comparison ports 3217/3218 are permitted');
const local = `http://127.0.0.1:${port}`;
const envFiles = readdirSync(dir).filter(n => /^\.env(?:\.|$)/.test(n) && n !== '.env.example');
if (envFiles.length) throw new Error('Refusing implicit .env loading; use an isolated checkout without .env files');

async function getText(url) {
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${new URL(url).pathname}`);
  return response.text();
}

async function publicAuth(base) {
  const html = await getText(`${base}/login`);
  const scripts = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)]
    .map(m => new URL(m[1].replaceAll('&amp;', '&'), base).href))]
    .filter(url => new URL(url).origin === base && new URL(url).pathname.startsWith('/_next/'));
  if (!scripts.length) throw new Error('No first-party Next.js scripts found');
  const chunks = await Promise.all(scripts.map(getText));
  const authChunks = chunks.filter(s => s.includes(authOrigin));
  const origins = new Set(chunks.flatMap(s => s.match(/https:\/\/[a-z0-9-]+\.supabase\.co/g) || []));
  if (origins.size !== 1 || !origins.has(authOrigin)) throw new Error('Public auth origin mismatch');
  if (chunks.some(s => s.includes('http://127.0.0.1:54321'))) throw new Error('Local Supabase is still in the browser build');
  const keys = new Set();
  for (const chunk of authChunks) {
    for (const token of chunk.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) || []) {
      let payload;
      try { payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()); } catch { continue; }
      if (payload.role === 'service_role') throw new Error('Refusing privileged key');
      if (payload.role === 'anon' && payload.ref === new URL(authOrigin).hostname.split('.')[0]
        && payload.exp * 1000 > Date.now()) keys.add(token);
    }
  }
  if (keys.size !== 1) throw new Error('Expected exactly one matching, unexpired public anon key');
  return [...keys][0];
}

const publicKey = await publicAuth(production);
// Read-only endpoint: validates that the public key is accepted, not a login attempt.
const settings = await fetch(`${authOrigin}/auth/v1/settings`, {
  headers: { apikey: publicKey }, signal: AbortSignal.timeout(20000), redirect: 'error',
});
if (!settings.ok) throw new Error(`Production public auth settings returned ${settings.status}`);
await settings.body?.cancel();
const fingerprint = createHash('sha256').update(publicKey).digest('hex').slice(0, 12);

if (verify) {
  const servedKey = await publicAuth(local);
  if (servedKey !== publicKey) throw new Error('Served browser key differs from production');
  console.log(JSON.stringify({ local, authOrigin, publicKeyFingerprint: fingerprint, publicKeyMatchesProduction: true, authSettingsStatus: settings.status }));
} else {
  // Only OS essentials plus explicit public app configuration reach build/start.
  const env = {};
  for (const key of ['PATH', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL', 'SYSTEMROOT']) {
    if (process.env[key]) env[key] = process.env[key];
  }
  Object.assign(env, {
    NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1',
    NEXT_PUBLIC_SUPABASE_URL: authOrigin, NEXT_PUBLIC_SUPABASE_ANON_KEY: publicKey,
    NEXT_PUBLIC_SITE_URL: local, SITE_URL: production,
    NEXT_PUBLIC_SANITY_PROJECT_ID: 'cqszh4up', NEXT_PUBLIC_SANITY_DATASET: 'production',
    NEXT_PUBLIC_SANITY_API_VERSION: '2024-01-01',
  });
  console.log(JSON.stringify({ phase: 'verified-build-and-start-config', dir, local, authOrigin,
    publicKeyFingerprint: fingerprint, authSettingsStatus: settings.status,
    privateServiceKeys: false, envFilesLoaded: false, subscriptionEnvironment: 'live' }));
  const cli = resolve(dir, 'node_modules/next/dist/bin/next');
  let child;
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child?.kill(signal));
  async function run(command, envOverrides = {}) {
    child = spawn(process.execPath, [cli, ...command], {
      cwd: dir, env: { ...env, ...envOverrides }, stdio: 'inherit',
    });
    const code = await new Promise((ok, fail) => { child.once('error', fail); child.once('exit', ok); });
    if (code !== 0) throw new Error(`Next ${command[0]} exited unsuccessfully`);
  }
  if (!skipBuild) await run(['build']);
  console.log(JSON.stringify({ phase: 'starting-with-same-verified-config', local, authOrigin }));
  await run(['start', '--hostname', '127.0.0.1', '--port', String(port)],
    dir.endsWith('/numerous-quotation') && trace ? { PERF_TRACE_SERVER: '1' } : {});
}
