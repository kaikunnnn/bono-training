"use client";

import React from "react";
import Header from "@/components/common/layout/Navigation/Header";
import SEO from "@/components/common/layout/Navigation/SEO";

const MemberstackTest = () => {
  return (
    <main className="min-h-screen flex-col bg-bgColor-secondary">
      <Header />
      <SEO
        title="ログイン | 荻窪で個人開発する1人デザイナーの日常"
        ogTitle="ログイン | 荻窪で個人開発する1人デザイナーの日常"
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

export default MemberstackTest;

// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";

// // Component
// import SEO from "@/components/common/layout/Navigation/SEO";
// import Header from "@/components/common/layout/Navigation/Header";
// import GoogleSignInButton from "@/components/common/ui/buttons/auth/GoogleSignInButton";
// import { Button } from "@/components/common/ui/button";

// // Memberstack
// import memberstackDOM from "@memberstack/dom";
// import { customLogin } from "@/libs/memberstack/customLogin";

// // memberstackの初期化をクライアントサイドのみで行うように変更
// const MemberstackTest = () => {
//   const router = useRouter();
//   const [isClient, setIsClient] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [memberstack, setMemberstack] = useState(null);

//   useEffect(() => {
//     // クライアントサイドでのみ実行
//     setIsClient(true);

//     // memberstackの初期化をクライアントサイドでのみ行う
//     try {
//       const ms = memberstackDOM.init({
//         publicKey: process.env.NEXT_PUBLIC_MEMBERSTACK_PUBLIC_KEY,
//       });
//       setMemberstack(ms);
//     } catch (error) {
//       console.error("Memberstack initialization error:", error);
//     }
//   }, []);

//   const openLoginModal = () => {
//     if (memberstack) {
//       memberstack.openModal("LOGIN");
//     }
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const email = event.target.email.value;
//     const password = event.target.password.value;
//     console.log("Submitting form with:", email, password);

//     if (isClient) {
//       await customLogin(email, password);
//       console.log("customLogin function called");
//     }
//   };

//   // クライアントサイドでレンダリングされるまで待機
//   if (!isClient) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <main className="min-h-screen flex-col bg-bgColor-secondary ">
//       <Header />
//       <SEO
//         title="ログイン | 荻窪で個人開発する1人デザイナーの日常"
//         ogTitle="ログイン | 荻窪で個人開発する1人デザイナーの日常"
//       ></SEO>
//       <div className="Wrapper w-full justify-start items-start md:inline-flex">
//         {/* Left */}
//         <div className="Left w-full md:w-1/2 h-max justify-center items-center gap-2.5 inline-flex">
//           <div className="flex flex-col items-center justify-center min-h-screen">
//             <div className="Left w-96 h-96 justify-center items-center gap-2.5 inline-flex">
//               <div className="Wrapper flex-col justify-start items-start gap-10 inline-flex">
//                 <div className="Title text-black text-3xl font-bold leading-10 tracking-wide">
//                   <h2>Memberstackテスト ログイン</h2>
//                 </div>
//                 <div className="WrapperLogin self-stretch  flex-col justify-start items-start gap-6 flex">
//                   <form
//                     onSubmit={handleSubmit}
//                     data-ms-form="login"
//                     className="BlockFormlogin self-stretch flex-col justify-start items-start gap-5 flex"
//                   >
//                     <div className="BlockInput self-stretch flex-col justify-start items-start gap-5 flex">
//                       {/* form Component */}
//                       <div className="FormItem self-stretch flex-col justify-start items-start gap-2 flex">
//                         <label
//                           htmlFor="email"
//                           className="Label text-black text-sm font-bold leading-normal tracking-wide"
//                         >
//                           メールアドレス
//                         </label>
//                         <input
//                           type="email"
//                           value={email}
//                           onChange={(e) => setEmail(e.target.value)}
//                           id="email"
//                           name="email"
//                           data-ms-member="email"
//                           className={`Input self-stretch p-4 bg-white rounded-lg border border-solid justify-start items-center gap-2.5 inline-flex leading-tight focus:outline-none focus:shadow-outline`}
//                           required
//                         />
//                         <p className="text-xs text-red-500 leading-normal tracking-wide">
//                           {/* エラー時のメッセージを表示　{emailError && <div className="error-message">{emailError}</div>} */}
//                         </p>
//                       </div>
//                       {/* form Component */}
//                       <div className="FormItem self-stretch flex-col justify-start  items-start gap-2 flex">
//                         <label
//                           htmlFor="email"
//                           className="Label text-black text-sm font-bold leading-normal tracking-wide"
//                         >
//                           パスワード
//                         </label>
//                         <input
//                           type="password"
//                           value={password}
//                           onChange={(e) => setPassword(e.target.value)}
//                           id="password"
//                           name="password"
//                           data-ms-member="password"
//                           className={`Input self-stretch p-4 bg-white rounded-lg border border-solid  justify-start items-center gap-2.5 inline-flex leading-tight focus:outline-none focus:shadow-outline`}
//                           required
//                         />
//                         <p className="text-xs text-red-500 leading-normal tracking-wide">
//                           {/*エラー時の表示 {passwordError && <div className="error-message">{passwordError}</div>} */}
//                         </p>
//                       </div>
//                     </div>
//                     <p className="text-xs text-red-500 leading-normal tracking-wide">
//                       {/*エラー {generalError && <div className="error-message">{generalError}</div>} */}
//                     </p>
//                     {/* Button */}
//                     <button
//                       type="submit"
//                       className="Button cursor-pointer self-stretch p-4 bg-blue-500 rounded-lg border-1 border-neutral-200 justify-center items-center gap-2.5 inline-flex"
//                     >
//                       <div className=" text-white text-sm font-bold leading-snug tracking-wide">
//                         ログイン
//                       </div>
//                     </button>
//                   </form>
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
//                     {/* <Auth /> */}
//                     <GoogleSignInButton />
//                   </div>

//                   {/* Dom */}
//                   <div>
//                     <Button content="ログイン" onClick={openLoginModal}>
//                       Member Stack Modal Login
//                     </Button>
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

// export default MemberstackTest;
