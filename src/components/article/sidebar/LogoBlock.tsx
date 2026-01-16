import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";

/**
 * LogoBlock コンポーネント
 * サイドナビゲーションの最上部に表示されるロゴ
 * クリックでトップページに遷移
 */
const LogoBlock = () => {
  return (
    <div
      style={{
        width: "100%",
        padding: "16px",
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
