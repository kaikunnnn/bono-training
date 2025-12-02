
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
  console.log('🔧 process.cwd():', process.cwd());
  console.log('🔧 All env keys:', Object.keys(env).filter(k => k.includes('SUPABASE')));
  console.log('🔧 env.VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL);
  console.log('🔧 env.NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('========================================');

  // 🚨 TESTING MODE: ローカル環境に強制上書き
  const FORCED_LOCAL_URL = 'http://127.0.0.1:54321';
  const FORCED_LOCAL_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

  console.log('✅ Forcing local Supabase:', FORCED_LOCAL_URL);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    // 環境変数を強制的に定義
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(FORCED_LOCAL_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(FORCED_LOCAL_ANON_KEY),
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
