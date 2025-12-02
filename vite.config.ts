
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 環境変数を明示的にロード
  const env = loadEnv(mode, process.cwd(), '');

  console.log('========== Vite Config Debug ==========');
  console.log('🔧 Mode:', mode);
  console.log('🔧 VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL || '(not set - will use Vercel env vars)');
  console.log('========================================');

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
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
