import React from "react";
import useSignupAndPurchase from "@/libs/memberstack/useSignupAndPurchase";
import { Button } from "../button";

function EmailSignUp({ selectedPlanId }) {
  const { setEmail, setPassword, signupAndPurchase } = useSignupAndPurchase();

  return (
    <>
      <div className="BlockFormlogin self-stretch flex-col justify-start items-start gap-5 flex">
        <div className="BlockInput self-stretch flex-col justify-start items-start gap-5 flex">
          {/* form Component */}
          <div className="FormItem self-stretch flex-col justify-start items-start gap-2 flex">
            <label
              htmlFor="email"
              className="Label text-black text-sm font-bold leading-normal tracking-wide"
            >
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              className="Input self-stretch p-4 bg-white rounded-lg border border-neutral-200 justify-start items-center gap-2.5 inline-flex leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          {/* form Component */}
          <div className="FormItem self-stretch flex-col justify-start  items-start gap-2 flex">
            <label
              htmlFor="password"
              className="Label text-black text-sm font-bold leading-normal tracking-wide"
            >
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              className="Input self-stretch p-4 bg-white rounded-lg border border-neutral-200 justify-start items-center gap-2.5 inline-flex leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        </div>
        <Button className="w-full" onClick={() => signupAndPurchase(selectedPlanId)}>
          新規登録
        </Button>
      </div>
    </>
  );
}

export default EmailSignUp;
