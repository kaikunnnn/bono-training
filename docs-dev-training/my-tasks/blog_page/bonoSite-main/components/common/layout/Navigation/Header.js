import Link from "next/link";
import Image from "next/image";
import React from "react";

// firebase auth account
import {useAuthState} from "react-firebase-hooks/auth";
import { auth } from "../../../../firebase";

// stripe firebase account auth
import usePremiumStatus from "../../../../stripe/usePremiumStatus";
import { PLANNAME } from "@/stripe/planId";



const Header = (props) => {
   // 現在ログインしているユーザーの情報を取得
   const [user] = useAuthState(auth)
   const userSubscriptionPlan = usePremiumStatus(user);
   
  return (
    <>
      <div className="Header w-full fixed py-6 px-6 justify-between items-center inline-flex z-50">
        <div className="LogoBono w-20 md:w-28 h-auto relative">
          <Link href="https://bo-no.design">
            <Image src="/bono/logo.svg" width={88} height={32} alt="BONO" className=""/>
          </Link>
        </div>

        {/* Distribute by user - ユーザーごとに出しわけ */}
        {user ? (
          <>
           <div className="Actionblock  justify-between items-center gap-2.5 flex">
              {/* サブスクリプションでの表示分岐 - 登録/サブスク状況 */}
              {userSubscriptionPlan === null ? (
                  <>
                    <div>
                      <p><b>NOTAメンバー</b></p>                     
                    </div>
                  </>
                ) : (
                  userSubscriptionPlan === PLANNAME.premium_standard ? (
                    <>
                    <div>
                      <p><b>スタンダードプラン</b></p>                     
                    </div>
                    </>
                  ) : (
                    <div>
                      <p><b>グロースプラン</b></p>                     
                    </div>
                  )
                )}
                <Link href="/profile">
                <div className=" text-right text-black text-base font-normal">
                  マイページ
                </div>
              </Link>
            </div>
          </>

        ) : (
          <><div></div>
        </>
        )}
        
      </div>
    </>
  );
};


export default Header;
