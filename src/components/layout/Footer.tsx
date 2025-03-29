
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn("border-t", className)}>
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-medium">サービス名</h3>
            <p className="text-sm text-muted-foreground">
              新しいサービスの基盤として構築されています。
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">リンク</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:underline">ホーム</a>
              </li>
              <li>
                <a href="#" className="hover:underline">機能</a>
              </li>
              <li>
                <a href="#" className="hover:underline">料金</a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">サポート</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:underline">FAQ</a>
              </li>
              <li>
                <a href="#" className="hover:underline">お問い合わせ</a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">法的情報</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:underline">利用規約</a>
              </li>
              <li>
                <a href="#" className="hover:underline">プライバシーポリシー</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} サービス名. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
