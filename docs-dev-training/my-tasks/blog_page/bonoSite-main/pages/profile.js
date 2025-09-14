"use client";

import React from "react";
import Header from "@/components/common/layout/Navigation/Header";

function Profile() {
  return (
    <>
      <main className="max-h-full bg-Top bg-cover text-slate-900 bg-no-repeat">
        <Header />
        <div className="Profile m-auto w-12/12 md:w-4/12 grid text-center lg:mb-0 lg:text-left p-8">
          <h2>メンテナンス中</h2>
          <p>このページは現在メンテナンス中です。しばらくお待ちください。</p>
        </div>
      </main>
    </>
  );
}

export default Profile;

/* 元のコード - 後で復元用
"use client";

import React, { useEffect, useState } from "react";

// Component
import Header from "@/components/common/layout/Navigation/Header";
import List from "@/components/common/layout/lists/list";
import UserInfo from "../components/common/layout/Contents/UserInfo";
import SignOutButton from "../components/common/ui/buttons/SignOutButton";
import { Button } from "@/components/common/ui/button";

//　Memberstack
import {
  useMemberstack,
  MemberstackProtected,
  SignInModal,
} from "@memberstack/react";
import memberstackDOM from "@memberstack/dom";
import { planIdsString } from "@/libs/memberstack/planIds";
import useMemberActions from "@/libs/memberstack/hooks/useMemberActions";
import useMemberInfo from "@/libs/memberstack/hooks/useMemberInfo";
import LoginButtonMemberstackModal from "@/components/common/ui/buttons/auth/LoginButtonMemeberstack";
const memberstack = memberstackDOM.init({
  publicKey: process.env.NEXT_PUBLIC_MEMBERSTACK_PUBLIC_KEY,
});

function Profile() {
  // Memberstack Custome hook
  const { launchStripePortal, launchDirectPlanUpdate, launchBilling } =
    useMemberActions();
  const { isLoading, member, plans } = useMemberInfo();

  // Memberstack - LoginModal
  const [showModal, setShowModal] = useState(false);
  const handleButtonClick = () => {
    setShowModal(true);
  };

  if (isLoading) {
    return <div>ローディング中...</div>; // ローディング中の表示
  }

  const planNames = {
    [process.env.NEXT_PUBLIC_PLAN_S_1M_PRICE_ID]: "スタンダードプラン（1ヶ月）",
    [process.env.NEXT_PUBLIC_PLAN_S_3M_PRICE_ID]: "スタンダードプラン（3ヶ月）",
    [process.env.NEXT_PUBLIC_PLAN_G_1M_PRICE_ID]: "グロースプラン（1ヶ月）",
    [process.env.NEXT_PUBLIC_PLAN_G_3M_PRICE_ID]: "グロースプラン（3ヶ月）",
    [process.env.NEXT_PUBLIC_PLAN_C_PRICE_ID]: "コミュニティプラン",
    // 他のプランIDとプラン名のマッピング
  };

  return (
    <>
      <main className="max-h-full bg-Top bg-cover text-slate-900 bg-no-repeat">
        <Header />
        <div className="Profile m-auto w-12/12 md:w-4/12 grid text-center lg:mb-0  lg:text-left">
          {!member
            ? (console.log("現在ログインしているユーザーはいません。"),
              (
                <>
                  <div className="not-logged-in m-12">
                    <p>ログインが必要です。</p>
                    <LoginButtonMemberstackModal />
                  </div>
                </>
              ))
            : (console.log("現在ログインしているユーザーが存在します。"),
              (
                <>
                  <h2>マイページ</h2>
                  <UserInfo />

                  {plans.length > 0
                    ? (console.log(
                        "このユーザーは以下のプランに属しています:",
                        plans.map((plan) => plan.payment.priceId)
                      ),
                      (
                        <>
                          <h3>あなたのプラン:</h3>
                          <ul>
                            {plans.map((plan) => (
                              <li key={plan.id}>
                                プラン名:{" "}
                                {planNames[plan.payment.priceId] ||
                                  "未知のプラン"}
                                ,, ステータス: {plan.status}, タイプ:{" "}
                                {plan.type}
                              </li>
                            ))}
                          </ul>
                        </>
                      ))
                    : (console.log(
                        "このユーザーはどのプランにも属していません。"
                      ),
                      (<div>プランに加入していません。</div>))}
                  <div className="mb-8"></div>
                  <div className="divider border-b w-full"></div>
                  <div className="mb-8"></div>

                  <MemberstackProtected
                    allow={{
                      plans: planIdsString.split(", "),
                    }}
                    onUnauthorized={
                      <div>
                        <h3>
                          あなたは<b>メンバーではありません</b>
                        </h3>
                        <div className="UpGrade-Growth">
                          <div className="mb-8"></div>
                          <List
                            label="スタンダードプランへ変更"
                            content="スタンダードプランへの登録はこちらから"
                            buttonLink={""}
                            buttonLabel="追加"
                            buttonOnClick={async () =>
                              await createCheckoutSession(
                                PLANID.standard.onemonth
                              )
                            }
                          ></List>
                          <div className="mb-8"></div>
                          <List
                            label="グロースプランへ変更"
                            content="グロースプランへの登録はこちらから"
                            buttonLink={""}
                            buttonLabel="追加"
                            buttonOnClick={async () =>
                              await createCheckoutSession(
                                PLANID.growth.onemonth
                              )
                            }
                          ></List>
                        </div>
                      </div>
                    }
                  >
                    <div>
                      <h3>Only the BONO Memeber</h3>
                      <div>
                        <p>Plan Name</p>
                        <Button variant="default" onClick={launchStripePortal}>
                          プランを管理
                        </Button>
                        <Button
                          variant="default"
                          onClick={launchDirectPlanUpdate}
                        >
                          スタンダードプラン３M更新
                        </Button>
                        <Button variant="default" onClick={launchBilling}>
                          請求履歴のみ
                        </Button>
                      </div>
                    </div>
                  </MemberstackProtected>

                  <SignOutButton />
                </>
              ))}
        </div>
      </main>
    </>
  );
}
*/
