"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { getCustomerPortalUrl } from "@/lib/services/stripe";

interface CustomerPortalButtonProps extends Omit<ButtonProps, "onClick"> {
  returnUrl?: string;
  children?: React.ReactNode;
}

export function CustomerPortalButton({
  returnUrl,
  children = "プランを管理",
  ...props
}: CustomerPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = await getCustomerPortalUrl(returnUrl);
      window.location.href = url;
    } catch (err) {
      setError("ポータルの読み込みに失敗しました。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleClick} disabled={isLoading} {...props}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            読み込み中...
          </>
        ) : (
          <>
            {children}
            <ExternalLink className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
