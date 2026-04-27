import type {
  AuthResponse,
  Session,
  User,
} from "@supabase/supabase-js";

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: object | null;
  }>;
  updatePassword: (password: string) => Promise<{
    error: Error | null;
    data: User | null;
  }>;
}
