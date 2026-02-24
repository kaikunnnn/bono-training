
import { defineConfig, loadEnv, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// 開発用ローカルAPIプラグイン
function localApiPlugin(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/feedback-apply/submit' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              console.log('📝 [DEV API] feedback-apply/submit received:', payload);
              if (!payload.articleUrl || !/^https?:\/\/.+/.test(payload.articleUrl)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: '有効な記事URLを入力してください' }));
                return;
              }
              if (!payload.slackAccountName?.trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Slackアカウント名を入力してください' }));
                return;
              }
              if (!payload.bonoContent?.trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: '学んだBONOコンテンツを入力してください' }));
                return;
              }
              if (!payload.checkedItems?.length) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: '該当する項目を1つ以上選択してください' }));
                return;
              }
              console.log('✅ [DEV API] Validation passed');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: '応募を受け付けました（開発モード）' }));
            } catch {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'サーバーエラー' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 環境変数を明示的にロード
  const env = loadEnv(mode, process.cwd(), '');

  console.log('========== Vite Config Debug ==========');
  console.log('🔧 Mode:', mode);
  console.log('🔧 VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL || '(not set - will use Vercel env vars)');
  console.log('========================================');

  // ENV-001 恒久対策: 本番ビルド時の環境変数チェック
  // Vercel環境でのみチェック（ローカルビルドはスキップ）
  const isVercel = process.env.VERCEL === '1';

  if (mode === 'production' && isVercel) {
    const supabaseUrl = env.VITE_SUPABASE_URL;

    // ローカルURLが本番ビルドに含まれることを防止
    if (supabaseUrl && (supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost:54321'))) {
      console.error('');
      console.error('🚨 ========== BUILD ERROR ==========');
      console.error('🚨 VITE_SUPABASE_URL contains local URL!');
      console.error('🚨 Value:', supabaseUrl);
      console.error('🚨');
      console.error('🚨 This will cause production to point to localhost.');
      console.error('🚨 Please check your environment variables.');
      console.error('🚨 ====================================');
      console.error('');
      throw new Error('ENV-001: Local URL detected in production build. See: .claude/docs/subscription/redesign/investigations/2025-12-02-environment-issues.md');
    }
  } else if (mode === 'production') {
    console.log('ℹ️ Local production build - skipping ENV-001 check (only enforced on Vercel)');
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && localApiPlugin(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // React重複バンドル問題を解決
      dedupe: ['react', 'react-dom'],
    }
  };
});
