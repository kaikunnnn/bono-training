import Logo from "@/components/common/Logo";

/**
 * LogoBlock コンポーネント
 * サイドナビゲーションの最上部に表示されるロゴ
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
      <Logo className="w-[67.51px] h-5" />
    </div>
  );
};

export default LogoBlock;
