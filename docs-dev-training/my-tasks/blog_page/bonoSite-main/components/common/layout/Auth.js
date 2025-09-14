import React from "react";
import style from "./Auth.module.css"
import GoogleSignInButton from "../ui/buttons/auth/GoogleSignInButton";
import {useAuthState} from "react-firebase-hooks/auth";
import { auth } from "../../../firebase";
import UserInfo from "./Contents/UserInfo";
import SignOutButton from "../ui/buttons/SignOutButton";

// stripe firebase account auth
import { createCheckoutSession } from '../../../stripe/createCheckoutSession';
import usePremiumStatus from "../../../stripe/usePremiumStatus";


// Product ID
const product_standard_onemonth = "price_1LzDKnKUVUnt8Gtyly1TOV95"
const product_growth_onemonth = "price_1LzDOvKUVUnt8GtyqgCtgDMQ"

function Auth() {
  // 現在ログインしているユーザーの情報を取得
    const [user] = useAuthState(auth)
    const userSubscriptionPlan = usePremiumStatus(user);

    return(
      <div>
          {user ? (
            <>
              <UserInfo />
              {userSubscriptionPlan === null ? (
                <>
                  <button onClick={async () => await createCheckoutSession(product_standard_onemonth)}>
                    Upgrade to Premium Standard!
                  </button>
                  <button onClick={async () => await createCheckoutSession(product_growth_onemonth)}>
                    Upgrade to Premium Growth!
                  </button>
                </>
              ) : (
                userSubscriptionPlan === 'premium_standard' ? (
                  <h2>Welcome, Premium Standard user!</h2>
                ) : (
                  <h2>Welcome, Premium Growth user!</h2>
                )
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <GoogleSignInButton />
            </>
          )}
      </div>
        
    )
}

export default Auth