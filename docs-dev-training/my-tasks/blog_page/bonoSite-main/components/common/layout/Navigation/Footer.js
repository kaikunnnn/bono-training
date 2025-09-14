import Link from "next/link";

// firebase auth account
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../../firebase";

function FooterBlock(props) {
  // 現在ログインしているユーザーの情報を取得
  const [user] = useAuthState(auth);

  return (
    <div>
      <footer className="pt-40 pb-16 w-full">
        <p className="text-sm text-gray-500 text-center block">
          Copyright©︎kaikun
        </p>
        <div className="pt-2"></div>
        <ul className="flex gap-3 justify-center">
          <li className="text-sm text-gray-500 text-center block">
            <Link href="/license">MIT License</Link>
          </li>
          <li className="text-sm text-gray-500 text-center block">
            <Link href="/privacypolicy">Privacy Policy</Link>
          </li>
          {/* Distribute by user - ユーザーごとに出しわけ */}
          {user ? (
            <>
              <div className="Actionblock  justify-between items-center gap-2.5 flex">
                <Link href="/profile">
                  <div className="text-sm text-gray-500 text-center block">
                    マイページ
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="Actionblock justify-between items-center gap-2.5 flex">
                <Link href="/auth/login">
                  <span className="text-sm text-gray-500 text-center block">
                    ログイン
                  </span>
                </Link>
                <Link href="/auth/signup">
                  <span className="text-sm text-gray-500 text-center block">
                    新規登録
                  </span>
                </Link>
              </div>
            </>
          )}
        </ul>
      </footer>
    </div>
  );
}

export default FooterBlock;
