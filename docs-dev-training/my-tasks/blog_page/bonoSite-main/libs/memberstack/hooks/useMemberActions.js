import { useMemberstack } from "@memberstack/react";

const useMemberActions = () => {
  const memberstack = useMemberstack();

  const launchStripePortal = async () => {
    // Stripeの顧客ポータルを起動する関数の内容
    try {
      await memberstack.launchStripeCustomerPortal({
        priceIds: [
          process.env.NEXT_PUBLIC_PLAN_S_3M_PRICE_ID,
          process.env.NEXT_PUBLIC_PLAN_G_3M_PRICE_ID,
        ],
        returnUrl: window.location.href, // 現在のページに戻る
        autoRedirect: true, // 自動的にリダイレクト
      });
    } catch (error) {
      console.error("Stripe Customer Portal launch error:", error);
    }
  };

  const launchDirectPlanUpdate = async () => {
    // プランの直接更新を行う関数の内容
    console.log("launchDirectPlanUpdate 関数が呼び出されました。");
    try {
      console.log("launchStripeCustomerPortal を実行します。");
      await memberstack.launchStripeCustomerPortal({
        configuration: {
          subscription_update: {
            enabled: true,
            default_allowed_updates: ["price", "promotion_code"],
            products: [
              // この部分を追加
              {
                product: "prod_XXXXXXXXXXXX", // 変更を許可する特定のプロダクトID
                prices: ["price_YYYYYYYYYYYY"], // このプロダクトに関連する特定の価格ID
              },
              // 必要に応じて他のプロダクトも同様に追加できます
            ],
          },
        },

        returnUrl: window.location.href, // 現在のページに戻る
        autoRedirect: true, // 自動的にリダイレクト
      });
      console.log("launchStripeCustomerPortal 実行完了。");
    } catch (error) {
      console.error("Stripe Customer Portal launch error:", error);
    }
  };

  const launchBilling = async () => {
    // 請求履歴のみを表示する関数の内容
    try {
      await memberstack.launchStripeCustomerPortal({
        configuration: {
          invoice_history: {
            enabled: true,
          },
        },
        priceIds: [
          process.env.NEXT_PUBLIC_PLAN_S_3M_PRICE_ID,
          process.env.NEXT_PUBLIC_PLAN_G_3M_PRICE_ID,
        ],
      });
    } catch (error) {
      console.error("Billing Portal launch error:", error);
    }
  };

  return { launchStripePortal, launchDirectPlanUpdate, launchBilling };
};

export default useMemberActions;
