import React, { useEffect } from "react";
import "firebase/auth";
import { auth, db, provider } from "../../../../../firebase";
import { doc, setDoc, getDoc } from "@firebase/firestore";
import { useRouter } from "next/router";

function GoogleSignInButton() {

  const router = useRouter();

  const SignInWithGoogle = () => {
    console.log("auth object:", auth);  // <- ここでauthオブジェクトを確認
    console.log("provider object:", provider);  // <- ここでproviderオブジェクトを確認
    console.log("useEffect triggered!"); // useEffectがトリガーされたときにログを表示
  
    auth.signInWithPopup(provider)
      .then(async (result) => {
        console.log("User data:", result.user); // ユーザーデータをログに表示
        const user = result.user;
        if (user) {
          console.log("User exists:", user);
          // Check if the user already exists
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
             // 新規ユーザー処理
             await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              name: user.displayName,
              provider: user.providerData[0].providerId,
            }).then(() => {
              // Redirect to a specific page for new users (e.g., profile setup)
              console.log("Document written successfully");
              router.push('/');
            }).catch((error) => {
              console.error("Error writing document of firebase:", error);
            });
          } else {
            console.log("Existing user");
             // 既存ユーザー処理
             // Redirect to the main page for existing users
            console.log("About to redirect...");
            router.push('/profile');
          }
        }
      })
      .catch((error) => {
        console.log(error);
        // ...エラー処理
      });
  }
  
  return (
    <button onClick={SignInWithGoogle} className="Googlebutton w-96 h-14 p-4 bg-white rounded-lg border border-neutral-200 justify-start items-center gap-2.5 inline-flex">
        <img
          className="Image7 w-5 h-5"
          src="sns/icon_google.svg"
        />
        <div className="Google grow shrink basis-0 text-center text-zinc-950 text-sm font-bold leading-snug tracking-wide">
          Googleでログイン
        </div>
    </button>
  );
}

export default GoogleSignInButton;
