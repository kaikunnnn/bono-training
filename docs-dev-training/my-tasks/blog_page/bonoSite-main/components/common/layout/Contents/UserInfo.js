import React from "react";
import List from "../lists/list";

// Memberstack
import { useMemberstack,
  useAuth,
  SignInModal  } from "@memberstack/react";
import { Button } from "../../ui/button";
import SignOutButton from "../../ui/buttons/SignOutButton";

function UserInfo() {
  // Memberstack - Get Member Status
  const memberstack = useMemberstack();
  const [member, setMember] = React.useState(null);
  
  React.useEffect(() => {
    memberstack.getCurrentMember()
  .then(({ data: member }) => setMember(member))
  .catc
  }, [])

  // SignOut Function
  const { signOut } = useAuth();
  const handleLogout = () => {
    signOut();
    // ログアウト後の処理をここに記述できます（例：ホームページへのリダイレクトなど）
  };
 
  
  
  return (
    <div>
      <h4>プロフィール</h4>
      <div data-ms-content="members">
        <div class="mt-4"></div>
        <List
            label="メールアドレス"
            content={member && member.auth.email}
            buttonLabel="変更"
            buttonLink="/"
        ></List>
        <div class="mt-4"></div>
        <List
            label="パスワード"
            content="ボタン→Change Password"
            buttonLabel="変更"
            buttonLink="/"
        ></List>
      </div>


      <Button onClick={handleLogout}>ログアウト</Button>

      
    </div>
  );
}

export default UserInfo;
