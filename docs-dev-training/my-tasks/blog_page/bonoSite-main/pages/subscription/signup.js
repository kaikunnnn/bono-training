"use client";

import React from "react";
import Header from "@/components/common/layout/Navigation/Header";
import SEO from "@/components/common/layout/Navigation/SEO";

const SignUp = () => {
  return (
    <main className="min-h-screen flex-col bg-bgColor-secondary">
      <Header />
      <SEO
        title="新規登録 | 荻窪で個人開発する1人デザイナーの日常"
        ogTitle="新規登録 | 荻窪で個人開発する1人デザイナーの日常"
      ></SEO>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">
            このページは現在ご利用いただけません
          </h2>
          <p className="text-gray-600 mb-4 text-center">
            申し訳ありませんが、このページは現在メンテナンス中です。
          </p>
          <p className="text-gray-600 text-center">
            ご不便をおかけして申し訳ありません。
          </p>
        </div>
      </div>
    </main>
  );
};

export default SignUp;

// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import GoogleSignInButton from "@/components/common/ui/buttons/auth/GoogleSignInButton";
// import Header from "@/components/common/layout/Navigation/Header";
// import SEO from "@/components/common/layout/Navigation/SEO";
// import EmailSignUp from "@/components/common/ui/form/EmailSignUp";

// // Firebaseのインポートとuseを分離
// import { auth } from "../../firebase";
// import { useAuthState } from "react-firebase-hooks/auth";

// const SignUp = () => {
//   const [isClient, setIsClient] = useState(false);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [generalError, setGeneralError] = useState("");

//   // useAuthStateをクライアントサイドでのみ使用するための状態
//   const [user, setUser] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     // クライアントサイドでのみ実行
//     setIsClient(true);

//     // Firebaseの認証状態監視をクライアントサイドでのみ行う
//     const unsubscribe = auth.onAuthStateChanged((currentUser) => {
//       setUser(currentUser);
//       if (currentUser) {
//         router.push("/");
//       }
//     });

//     // クリーンアップ関数
//     return () => unsubscribe();
//   }, [router]);

//   // ログインの関数
//   const handleLoginLogic = (email, password) => {
//     if (!isClient) return; // クライアントサイドでのみ実行

//     auth
//       .signInWithEmailAndPassword(email, password)
//       .then((userCredential) => {
//         var user = userCredential.user;
//         router.push("/");
//       })
//       .catch((error) => {
//         setGeneralError("ログインに失敗しました。再度お試しください。");
//       });
//   };

//   // クライアントサイドでレンダリングされるまで待機
//   if (!isClient) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <main className="min-h-screen flex-col bg-bgColor-secondary ">
//       <Header />
//       <SEO
//         title="新規登録 | 荻窪で個人開発する1人デザイナーの日常"
//         ogTitle="新規登録 | 荻窪で個人開発する1人デザイナーの日常"
//       ></SEO>
//       <div className="Wrapper w-full justify-start items-start md:inline-flex">
//         {/* Left */}
//         <div className="Left w-full md:w-1/2 h-max justify-center items-center gap-2.5 inline-flex">
//           <div className="flex flex-col items-center justify-center min-h-screen">
//             <div className="Left w-96 h-96 justify-center items-center gap-2.5 inline-flex">
//               <div className="Wrapper flex-col justify-start items-start gap-10 inline-flex">
//                 <div className="Title text-black text-3xl font-bold leading-10 tracking-wide">
//                   新規登録
//                 </div>
//                 <div className="WrapperLogin self-stretch flex-col justify-start items-start gap-6 flex">
//                   <EmailSignUp />
//                   {/* divider */}
//                   <div className="BlockDivider self-stretch justify-center items-center gap-2 inline-flex">
//                     <div className="Line1 grow shrink basis-0 h-px border border-neutral-300"></div>
//                     <div className="Or text-center text-black text-xs font-bold leading-tight tracking-wide">
//                       or
//                     </div>
//                     <div className="Line2 grow shrink basis-0 h-px border border-neutral-300"></div>
//                   </div>
//                   {/* googlebutton */}
//                   <div className="Googlebutton self-stretch justify-start items-center gap-2.5 inline-flex">
//                     <GoogleSignInButton />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="Right hidden md:block md:w-1/2 h-screen relative bg-gradient-to-tl from-indigo-300 via-slate-200 to-amber-100"></div>
//       </div>
//     </main>
//   );
// };

// export default SignUp;
