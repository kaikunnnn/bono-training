import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import Logo from "@/components/common/Logo";

type LogoBlockVariant = "default" | "compact";

interface LogoBlockProps {
  variant?: LogoBlockVariant;
  /**
   * ロゴの右側に配置するアクション（例: サイドナビを閉じるボタン）
   * ロゴ自体は中央に固定したまま、右端に重ねて配置する
   */
  rightAction?: ReactNode;
}

/**
 * LogoBlock コンポーネント
 * サイドナビゲーションの最上部に表示されるロゴ
 * クリックでトップページに遷移
 */
const LogoBlock = ({ variant = "default", rightAction }: LogoBlockProps) => {
  const padding = variant === "compact" ? "8px 0" : "16px";
  const paddingX = variant === "compact" ? undefined : "8px";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        padding,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <Link to="/">
        <Logo className="w-[67.51px] h-5" />
      </Link>
      {rightAction && (
        <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
          {rightAction}
        </div>
      )}
    </div>
  );
};

export default LogoBlock;
