// // Reactライブラリから必要な関数を取り込む
// import { createContext, useState, useEffect, useContext } from "react";
// import { supabase } from "../supabaseClient";

// // Contextを作成。Contextはグローバルな値を保持し、
// // すべての子コンポーネントにそれを提供するための仕組み
// const Context = createContext();

// // Providerコンポーネントを定義。このコンポーネントを使って、すべての子コンポーネントにContextの値を提供します
// const Provider = ({ children }) => {
//   // ユーザー情報を保持するためのステート（状態）を作成初期値は現在のユーザー情報
//   const [user, setUser] = useState(supabase.auth.user())

//   // 効果を追加 - ユーザーの認証状態が変わったとき（つまり、ユーザーがログインしたとき、ログアウトしたときなど）に動作する効果を設定しています。
//   useEffect(() => {
//     supabase.auth.onAuthStateChange(() => {
//         setUser(supabase.auth.user())
//     })
//   }, []);

//   // 子コンポーネントに公開する値を定義
//   const exposed = {
//     user,
//   }

//   // Providerコンポーネントを使って、子コンポーネントにContextの値を提供
//   return <Context.Provider value={exposed}>{children}</Context.Provider>;
// }

// // useUserというカスタムフックを定義。このフックを使って、
// // 子コンポーネントからContextの値にアクセスできる
// export const useUser = () => useContext(Context);

// // Providerコンポーネントをエクスポート（他のファイルから使えるようにする）
// export default Provider;