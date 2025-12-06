import { Check } from "lucide-react";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({
  children,
  onClick,
  icon = true,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-1 px-3 py-2 bg-black text-white rounded-full font-noto-sans-jp font-bold text-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon && <Check size={18} />}
      {children}
    </button>
  );
}
