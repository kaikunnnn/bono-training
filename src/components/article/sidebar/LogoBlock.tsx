import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";

type LogoBlockVariant = "default" | "compact";

interface LogoBlockProps {
  variant?: LogoBlockVariant;
}

/**
 * LogoBlock コンポーネント
 * サイドナビゲーションの最上部に表示されるロゴ
 * クリックでトップページに遷移
 */
const LogoBlock = ({ variant = "default" }: LogoBlockProps) => {
  const padding = variant === "compact" ? "8px 0" : "16px";

  return (
    <div
      style={{
        width: "100%",
        padding,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <Link to="/">
        <Logo className="w-[67.51px] h-5" />
      </Link>
    </div>
  );
};

export default LogoBlock;
