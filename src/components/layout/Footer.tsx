
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

interface FooterProps {
  className?: string;
}

// Ghost CMSのURL（環境変数から取得）
const GHOST_URL = import.meta.env.VITE_GHOST_URL || 'http://localhost:2368';

const Footer = ({ className }: FooterProps) => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // /blog 以下のページでのみメール登録セクションを表示
  const showNewsletterSignup = location.pathname.startsWith('/blog');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setStatus('loading');

    try {
      // Ghost Members APIを使用して購読者を追加
      const response = await fetch(`${GHOST_URL}/members/api/send-magic-link/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          emailType: 'subscribe',
        }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('確認メールを送信しました。メールをご確認ください。');
        setEmail('');
      } else {
        throw new Error('登録に失敗しました');
      }
    } catch (error) {
      setStatus('error');
      setMessage('登録に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <footer className={cn("border-t", className)}>
      <div className="container py-12 md:py-16">
        {/* メールマガジン登録セクション - /blog 以下のみ表示 */}
        {showNewsletterSignup && (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <Mail className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              メールマガジンに登録する
            </h3>
            <p className="text-gray-600">
              最新の記事やデザインに関する情報をお届けします。
            </p>

            {status === 'success' ? (
              <p className="text-green-600 font-medium">{message}</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="メールアドレスを入力"
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? '送信中...' : '登録する'}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="text-red-600 text-sm">{message}</p>
            )}
          </div>
        )}

        <div className={cn("text-center text-sm text-muted-foreground", showNewsletterSignup && "mt-12 pt-8 border-t")}>
          <p>© BONO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
