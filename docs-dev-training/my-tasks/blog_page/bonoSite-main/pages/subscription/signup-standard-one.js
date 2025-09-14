"use client";

import React from "react";
import Header from "@/components/common/layout/Navigation/Header";

function SignupStandardOne() {
  return (
    <>
      <main className="max-h-full bg-Top bg-cover text-slate-900 bg-no-repeat">
        <Header />
        <div className="m-auto w-12/12 md:w-4/12 grid text-center lg:mb-0 lg:text-left p-8">
          <h2>メンテナンス中</h2>
          <p>このページは現在メンテナンス中です。しばらくお待ちください。</p>
        </div>
      </main>
    </>
  );
}

export default SignupStandardOne;

/* 元のコード - 後で復元用
import React from "react";
import GoogleSignInButton from "@/components/common/ui/buttons/auth/GoogleSignInButton";
import Header from "@/components/common/layout/Navigation/Header";
import SEO from "@/components/common/layout/Navigation/SEO";
import EmailSignUp from "@/components/common/ui/form/EmailSignUp";
import OrDivider from "@/components/Plan/ui/OrDivider";

const SignUp = () => {
  return (
    <main className="min-h-screen flex-col bg-bgColor-secondary ">
      <Header />
      <SEO
        title="新規登録 | 荻窪で個人開発する1人デザイナーの日常"
        ogTitle="新規登録 | 荻窪で個人開発する1人デザイナーの日常"
      ></SEO>
      <div className="Wrapper w-full justify-start items-start md:inline-flex">
     
        <div className="Left w-full md:w-1/2 h-max justify-center items-center gap-2.5 inline-flex">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="Left w-96 h-96 justify-center items-center gap-2.5 inline-flex">
              <div className="Wrapper flex-col justify-start items-start gap-10 inline-flex">
                <h1 className="Title text-black text-3xl font-bold leading-10 tracking-wide">
                  新規登録
                </h1>
                <div className="WrapperLogin self-stretch  flex-col justify-start items-start gap-6 flex">
                  <EmailSignUp selectedPlanId="plan_S_1m"/>
                  <OrDivider/>
               
                  <div className="Googlebutton self-stretch justify-start items-center gap-2.5 inline-flex">
                    <GoogleSignInButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="Right hidden md:block md:w-1/2 h-screen relative bg-gradient-to-tl from-indigo-300 via-slate-200 to-amber-100"></div>
      </div>
    </main>
  );
};

export default SignUp;

// 元のコードをここにコピーしてください
*/
