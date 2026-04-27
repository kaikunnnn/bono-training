import { createClient } from "@/lib/supabase/server";
import { Layout } from "./Layout";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * レイアウトラッパー（Server Component）
 * サーバーサイドでユーザー情報を取得し、Layoutコンポーネントに渡す
 */
export async function LayoutWrapper({ children }: LayoutWrapperProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Layout
      user={
        user
          ? {
              id: user.id,
              email: user.email || "",
            }
          : null
      }
    >
      {children}
    </Layout>
  );
}
