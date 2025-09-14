// useSignupAndPurchase.js
import { useState } from "react";
// Memberstack
import memberstackDOM from "@memberstack/dom";
const memberstack = memberstackDOM.init({
    publicKey: process.env.NEXT_PUBLIC_MEMBERSTACK_PUBLIC_KEY,
  });
import { PLANID } from "@/stripe/planId";

const useSignupAndPurchase = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupAndPurchase = async (selectedPlan) => {
    try {
      // MemberStackでユーザーをサインアップ
      await memberstack.signupMemberEmailPassword({
        email: email,
        password: password,
      });

      // ログを追加：selectedPlanの値を確認
        console.log("Selected Plan:", selectedPlan);

        // ここにログイン処理を追加
        await memberstack.loginMemberEmailPassword({
            email: email,
            password: password,
        });

      // 選択されたプランに応じてStripeのプライスIDをマップ
      const priceIdMap = {
        plan_S_1m: PLANID.standard.onemonth, // Aプラン1ヶ月の価格ID
        plan_S_3m: PLANID.standard.threemonth, // Aプラン3ヶ月の価格ID
        plan_G_1m: PLANID.growth.onemonth, // Bプラン1ヶ月の価格ID
        plan_G_3m: PLANID.growth.threemonth, // Bプラン3ヶ月の価格ID
      };

      const priceId = priceIdMap[selectedPlan];

      //   ログを追加：マッピングされたpriceIdの値を確認
      console.log("Mapped Price ID:", priceId);

      // サインアップ成功後、Stripeのチェックアウトプロセスを開始
      await memberstack.purchasePlansWithCheckout({
        priceId: priceId,
        cancelUrl: "/", // キャンセル時のURL
        successUrl: "/profile", // 成功時のURL
        autoRedirect: true, // 自動リダイレクト設定
      });
    } catch (err) {
      // エラーハンドリング（例：メールアドレスが既に使われている場合）
      console.error("Error: " + err.message);
    }
  };

  return {
    setEmail,
    setPassword,
    signupAndPurchase,
  };
};

export default useSignupAndPurchase;
