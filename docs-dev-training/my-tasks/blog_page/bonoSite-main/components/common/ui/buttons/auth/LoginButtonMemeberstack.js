import React, { useState } from "react";
import memberstackDOM from "@memberstack/dom";
import { Button } from "@/components/common/ui/button";
import { ButtonIcon } from "@radix-ui/react-icons";

const memberstack = memberstackDOM.init({
  publicKey: process.env.NEXT_PUBLIC_MEMBERSTACK_PUBLIC_KEY,
});

function LoginButtonMemberstackModal() {
  const handleLogin = async () => {
    try {
      const { data, type } = await memberstack.openModal("LOGIN");

      if (type === "LOGIN") {
        console.log("ログインが成功しました");
        console.log("ユーザーデータ:", data);
        // ログイン後の処理をここに記述
        window.location.reload();
      } else {
        console.log("ログインが失敗しました");
      }
    } catch (error) {
      console.error("ログイン処理中にエラーが発生しました", error);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={handleLogin}>
        ログイン
      </Button>
    </>
  );
}

export default LoginButtonMemberstackModal;
