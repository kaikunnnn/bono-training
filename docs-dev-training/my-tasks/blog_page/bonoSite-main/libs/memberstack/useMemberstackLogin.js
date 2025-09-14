import React, { useEffect, useState } from "react";
import { useMemberstack } from '@memberstack/react';

const useMemberstackLogin = () => {
  const { openModal } = useMemberstack();
  const [member, setMember] = useState(null);
  const [isPageReloaded, setIsPageReloaded] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false); // ログイン成功状態を追跡
  const memberstack = useMemberstack();

  useEffect(() => {  
    memberstack.getCurrentMember()
      .then(({ data: member }) => {
        console.log('getCurrentMember response:', member);
        if (member) {
          setMember(member);
        } else {
          console.log('No member data found.');
        }
      })
      .catch(error => {
        console.error('Error fetching member details:', error);
      });
  }, []);

  useEffect(() => {
    // ログインが成功し、かつページがまだリロードされていない場合にリロードを実行
    if (member && member.isLoggedIn && !isPageReloaded) {
        console.log('Member detected, reloading page.');
        setLoginSuccess(true); // ログイン成功を設定
        setTimeout(() => {
          window.location.reload();
          setIsPageReloaded(true);
        }, 2000); // 2秒後にページをリロード
      }
    }, [member, isPageReloaded]);

  const openLoginModal = () => {
    console.log('Opening login modal.');
    openModal("login");
  };

  return { openLoginModal, loginSuccess  };
};

export default useMemberstackLogin;