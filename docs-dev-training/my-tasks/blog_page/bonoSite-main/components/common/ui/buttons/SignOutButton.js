import React from "react";
import style from "./SignInButton.module.css";
import {auth, provider} from "../../../../firebase";
import { useRouter } from "next/router";

// Firebaseの仕組みを使ったもので必要ない
function SignOutButton() {
    const router = useRouter();
    const handleSignOut = () => {
        auth.signOut()
            .then(()=>{
                // Redirect to /login on succcesful sign out
                router.push('/')
            })
            .catch((error)=>{
                // Hndle any errors here
                console.log(error);
            })
    }
    return(
        <button onClick={handleSignOut} className={style.button}>
            <p>ログアウトする</p>
        </button>
        
    )
}

export default SignOutButton