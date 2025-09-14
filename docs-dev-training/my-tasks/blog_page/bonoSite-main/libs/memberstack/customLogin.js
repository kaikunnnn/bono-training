import memberstackDOM from "@memberstack/dom";

const memberstack = memberstackDOM.init({
  publicKey: process.env.NEXT_PUBLIC_MEMBERSTACK_PUBLIC_KEY,
});

async function customLogin(email, password) {
  console.log("customLogin called with:", email, password); // ログイン処理開始ログ
  try {
    // Memberstackでログイン処理を行う
    const { data, type } = await memberstack.loginMemberEmailPassword({
      email: email,
      password: password,
    });
    console.log("Login event type:", type); // ログインイベントタイプログ
    console.log("Returned data:", data); // ログイン後のデータログ

    // ログイン成功後のリダイレクト処理を一時的に無効化
    // console.log("Redirecting to home page..."); // リダイレクト前ログ
    // window.location.href = "/";
  } catch (error) {
    console.error("Login failed:", error); // ログイン失敗ログ
  }
}

export { customLogin };
