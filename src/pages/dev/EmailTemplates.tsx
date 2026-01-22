/**
 * メールテンプレートプレビュー
 * BONOのトランザクションメールテンプレートを確認・テスト
 */

import React, { useState } from 'react';
import { Mail } from 'lucide-react';

type TemplateType = 'password-reset' | 'confirm-signup' | 'change-email' | 'welcome' | 'welcome-v2-a' | 'welcome-v2-b' | 'welcome-v2-c' | 'cancellation' | 'plan-change';

interface TemplateConfig {
  title: string;
  heading: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
  note?: string;
  sections?: Array<{
    title: string;
    content: string;
    buttonText?: string;
    buttonUrl?: string;
  }>;
}

const templates: Record<TemplateType, TemplateConfig> = {
  'password-reset': {
    title: 'パスワードリセット',
    heading: 'パスワードをリセット',
    body: 'パスワードリセットのリクエストを受け付けました。<br><br>以下のボタンをクリックして、新しいパスワードを設定してください。',
    buttonText: 'パスワードを再設定する',
    note: 'このリンクは1時間有効です。<br>リクエストに心当たりがない場合は、このメールを無視してください。',
  },
  'confirm-signup': {
    title: 'メールアドレス確認',
    heading: 'BONOへようこそ！',
    body: 'BONOにご登録いただきありがとうございます。<br><br>以下のボタンをクリックして、メールアドレスの確認を完了してください。',
    buttonText: 'メールアドレスを確認する',
    note: 'このリンクは1時間有効です。',
  },
  'change-email': {
    title: 'メールアドレス変更',
    heading: 'メールアドレスを変更',
    body: 'メールアドレスの変更リクエストを受け付けました。<br><br>以下のボタンをクリックして、新しいメールアドレスを確認してください。',
    buttonText: '変更を確認する',
    note: 'リクエストに心当たりがない場合は、このメールを無視してください。',
  },
  'welcome': {
    title: 'メンバーシップ登録完了',
    heading: 'BONOへようこそ！🎉',
    body: 'メンバーシップ登録ありがとうございます！<br><br>BONOを有効活用してデザインスキルを伸ばすため、まず以下のコンテンツを見て、実行してみてください。',
    sections: [
      {
        title: '① BONOを使う準備',
        content: 'まずはBONOを利用するための準備をしましょう。<br>・コミュニティへの参加<br>・取り組むコンテンツの決定<br>・2週間でやるべきことを決める',
        buttonText: 'BONOを使う準備をはじめる →',
        buttonUrl: 'https://www.bo-no.design/howtouse',
      },
      {
        title: '② BONOの使い方ガイド',
        content: '学習の進め方、コミュニティの使い方など、BONOでデザインスキルを身につけるためのガイドページをチェックしてデザインを進めましょう。',
        buttonText: 'BONO 使い方ガイドへ →',
        buttonUrl: 'https://www.bo-no.design/bono-guide',
      },
    ],
    note: 'ボタンがない場合はページを再読み込みしていただくか、プラン登録状況をマイページよりご確認ください。',
  },
  // 案1: 新サイト案内セクションを追加
  'welcome-v2-a': {
    title: '【案1】新サイト案内追加',
    heading: 'BONOへようこそ！🎉',
    body: 'メンバーシップ登録ありがとうございます！<br><br>BONOを有効活用してデザインスキルを伸ばすため、まず以下のコンテンツを見て、実行してみてください。',
    sections: [
      {
        title: '① BONOを使う準備',
        content: 'まずはBONOを利用するための準備をしましょう。<br>・コミュニティへの参加<br>・取り組むコンテンツの決定<br>・2週間でやるべきことを決める',
        buttonText: 'BONOを使う準備をはじめる →',
        buttonUrl: 'https://www.bo-no.design/howtouse',
      },
      {
        title: '② BONOの使い方ガイド',
        content: '学習の進め方、コミュニティの使い方など、BONOでデザインスキルを身につけるためのガイドページをチェックしてデザインを進めましょう。',
        buttonText: 'BONO 使い方ガイドへ →',
        buttonUrl: 'https://www.bo-no.design/bono-guide',
      },
      {
        title: '③ 新しい学習サイトもご利用いただけます',
        content: '新しい学習サイト training.bo-no.design では、レッスンやトレーニングコンテンツを体系的に学ぶことができます。<br><br>ご登録のメールアドレスでログインできます。',
        buttonText: '新しい学習サイトを開く →',
        buttonUrl: 'https://training.bo-no.design',
      },
    ],
    note: 'ボタンがない場合はページを再読み込みしていただくか、プラン登録状況をマイページよりご確認ください。',
  },
  // 案2: 両サイトの使い分けを説明
  'welcome-v2-b': {
    title: '【案2】両サイト使い分け説明',
    heading: 'BONOへようこそ！🎉',
    body: 'メンバーシップ登録ありがとうございます！<br><br>BONOを有効活用してデザインスキルを伸ばすため、まず以下のコンテンツを見て、実行してみてください。',
    sections: [
      {
        title: '① BONOを使う準備',
        content: 'まずはBONOを利用するための準備をしましょう。<br>・コミュニティへの参加<br>・取り組むコンテンツの決定<br>・2週間でやるべきことを決める',
        buttonText: 'BONOを使う準備をはじめる →',
        buttonUrl: 'https://www.bo-no.design/howtouse',
      },
      {
        title: '② BONOの使い方ガイド',
        content: '学習の進め方、コミュニティの使い方など、BONOでデザインスキルを身につけるためのガイドページをチェックしてデザインを進めましょう。',
        buttonText: 'BONO 使い方ガイドへ →',
        buttonUrl: 'https://www.bo-no.design/bono-guide',
      },
      {
        title: '③ 2つのサイトをご利用いただけます',
        content: '【新サイト training.bo-no.design】<br>・レッスン一覧・トレーニング<br>・ご登録時のメールアドレスでそのままログイン可能<br><br>【旧サイト bo-no.design】<br>・コミュニティ・ガイドページ<br>・初回ログイン時は「パスワードを忘れた方」からパスワードリセットをお願いします<br><br>両サイトとも同じメールアドレスでご利用いただけます。',
      },
    ],
    note: 'ボタンがない場合はページを再読み込みしていただくか、プラン登録状況をマイページよりご確認ください。',
  },
  // 案3: 補足テキストに追記（シンプル版）
  'welcome-v2-c': {
    title: '【案3】補足テキスト追記',
    heading: 'BONOへようこそ！🎉',
    body: 'メンバーシップ登録ありがとうございます！<br><br>BONOを有効活用してデザインスキルを伸ばすため、まず以下のコンテンツを見て、実行してみてください。',
    sections: [
      {
        title: '① BONOを使う準備',
        content: 'まずはBONOを利用するための準備をしましょう。<br>・コミュニティへの参加<br>・取り組むコンテンツの決定<br>・2週間でやるべきことを決める',
        buttonText: 'BONOを使う準備をはじめる →',
        buttonUrl: 'https://www.bo-no.design/howtouse',
      },
      {
        title: '② BONOの使い方ガイド',
        content: '学習の進め方、コミュニティの使い方など、BONOでデザインスキルを身につけるためのガイドページをチェックしてデザインを進めましょう。',
        buttonText: 'BONO 使い方ガイドへ →',
        buttonUrl: 'https://www.bo-no.design/bono-guide',
      },
    ],
    note: 'ボタンがない場合はページを再読み込みしていただくか、プラン登録状況をマイページよりご確認ください。<br><br>※新しい学習サイト（training.bo-no.design）でも同じメールアドレスでログインできます。旧サイト（bo-no.design）に初めてログインする場合は、「パスワードを忘れた方」からパスワードリセットをお願いします。',
  },
  'cancellation': {
    title: '解約手続き完了',
    heading: '解約手続きが完了しました',
    body: 'BONOのメンバーシッププランの解約登録が完了されました。<br><br>ご利用ありがとうございました。',
    note: '・解約日まではコンテンツにアクセスすることができます<br>・コミュニティにはアクセスできなくなります',
  },
  'plan-change': {
    title: 'プラン変更完了',
    heading: 'プランが変更されました',
    body: 'BONOのメンバーシッププランが変更されました。<br><br>【変更後のプラン】<br><strong style="font-size: 20px;">{{plan_name}}</strong>',
    buttonText: 'マイページを確認する',
    buttonUrl: 'https://www.bo-no.design/mypage',
    note: 'ご不明な点がございましたら、お気軽にお問い合わせください。',
  },
};

// BONOロゴSVG（インライン用のBase64エンコード版とテキスト版）
const BONO_LOGO_SVG = `<svg width="68" height="20" viewBox="0 0 68 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5.27461 14.4641H6.06843C6.97918 14.4641 7.63147 14.3463 8.02527 14.1108C8.41915 13.8752 8.61607 13.4971 8.61607 12.9765C8.61607 12.4557 8.41915 12.0776 8.02527 11.8421C7.63147 11.6066 6.97918 11.4888 6.06843 11.4888H5.27461V14.4641ZM5.27461 8.77386H5.9392C7.07146 8.77386 7.63761 8.32135 7.63761 7.41634C7.63761 6.51138 7.07146 6.05887 5.9392 6.05887H5.27461V8.77386ZM1.65625 3.26953H7.04688C8.32681 3.26953 9.29913 3.57945 9.96371 4.19931C10.6283 4.81916 10.9605 5.71176 10.9605 6.87706C10.9605 7.58374 10.8314 8.17258 10.5729 8.64365C10.3268 9.10235 9.94525 9.49285 9.42833 9.81521C9.94525 9.91435 10.3822 10.0693 10.7391 10.2801C11.1083 10.4784 11.4037 10.7264 11.6252 11.0239C11.8591 11.3214 12.0252 11.6561 12.1237 12.0281C12.222 12.4 12.2714 12.7967 12.2714 13.2182C12.2714 13.8752 12.1543 14.4579 11.9205 14.9662C11.6991 15.4745 11.379 15.9022 10.9605 16.2493C10.5545 16.5964 10.0559 16.8567 9.46525 17.0303C8.87453 17.2039 8.2099 17.2906 7.47148 17.2906H1.65625V3.26953Z" fill="#151834"/>
  <path d="M18.2415 10.28C18.2415 10.8378 18.3462 11.3523 18.5554 11.8234C18.7646 12.2945 19.0477 12.7036 19.4047 13.0507C19.7615 13.3978 20.1738 13.6706 20.6414 13.8689C21.1214 14.0549 21.6261 14.1478 22.1553 14.1478C22.6845 14.1478 23.183 14.0549 23.6506 13.8689C24.1306 13.6706 24.5491 13.3978 24.9059 13.0507C25.2752 12.7036 25.5644 12.2945 25.7736 11.8234C25.9829 11.3523 26.0875 10.8378 26.0875 10.28C26.0875 9.72208 25.9829 9.20763 25.7736 8.73655C25.5644 8.26542 25.2752 7.85635 24.9059 7.50924C24.5491 7.16212 24.1306 6.89558 23.6506 6.70961C23.183 6.51127 22.6845 6.41206 22.1553 6.41206C21.6261 6.41206 21.1214 6.51127 20.6414 6.70961C20.1738 6.89558 19.7615 7.16212 19.4047 7.50924C19.0477 7.85635 18.7646 8.26542 18.5554 8.73655C18.3462 9.20763 18.2415 9.72208 18.2415 10.28ZM14.457 10.28C14.457 9.23863 14.6478 8.2716 15.0294 7.37903C15.4109 6.47407 15.9401 5.68685 16.617 5.0174C17.2938 4.34796 18.1001 3.82729 19.0354 3.45537C19.983 3.07106 21.023 2.87891 22.1553 2.87891C23.2752 2.87891 24.3091 3.07106 25.2567 3.45537C26.2044 3.82729 27.0167 4.34796 27.6936 5.0174C28.3828 5.68685 28.9182 6.47407 29.2997 7.37903C29.6812 8.2716 29.872 9.23863 29.872 10.28C29.872 11.3213 29.6812 12.2945 29.2997 13.1995C28.9182 14.0921 28.3828 14.8731 27.6936 15.5425C27.0167 16.212 26.2044 16.7389 25.2567 17.1232C24.3091 17.495 23.2752 17.681 22.1553 17.681C21.023 17.681 19.983 17.495 19.0354 17.1232C18.1001 16.7389 17.2938 16.212 16.617 15.5425C15.9401 14.8731 15.4109 14.0921 15.0294 13.1995C14.6478 12.2945 14.457 11.3213 14.457 10.28Z" fill="#151834"/>
  <path d="M32.9121 17.2906V3.26953H36.5305L43.2134 11.8421V3.26953H46.8133V17.2906H43.2134L36.5305 8.71804V17.2906H32.9121Z" fill="#151834"/>
  <path d="M53.804 10.28C53.804 10.8378 53.9087 11.3523 54.1179 11.8234C54.3271 12.2945 54.6102 12.7036 54.9671 13.0507C55.324 13.3978 55.7363 13.6706 56.2039 13.8689C56.6839 14.0549 57.1886 14.1478 57.7178 14.1478C58.2469 14.1478 58.7454 14.0549 59.2131 13.8689C59.693 13.6706 60.1116 13.3978 60.4684 13.0507C60.8377 12.7036 61.1268 12.2945 61.3361 11.8234C61.5453 11.3523 61.6499 10.8378 61.6499 10.28C61.6499 9.72208 61.5453 9.20763 61.3361 8.73655C61.1268 8.26542 60.8377 7.85635 60.4684 7.50924C60.1116 7.16212 59.693 6.89558 59.2131 6.70961C58.7454 6.51127 58.2469 6.41206 57.7178 6.41206C57.1886 6.41206 56.6839 6.51127 56.2039 6.70961C55.7363 6.89558 55.324 7.16212 54.9671 7.50924C54.6102 7.85635 54.3271 8.26542 54.1179 8.73655C53.9087 9.20763 53.804 9.72208 53.804 10.28ZM50.0195 10.28C50.0195 9.23863 50.2102 8.2716 50.5918 7.37903C50.9733 6.47407 51.5025 5.68685 52.1795 5.0174C52.8563 4.34796 53.6625 3.82729 54.5978 3.45537C55.5455 3.07106 56.5855 2.87891 57.7178 2.87891C58.8377 2.87891 59.8715 3.07106 60.8192 3.45537C61.7669 3.82729 62.579 4.34796 63.256 5.0174C63.9455 5.68685 64.4804 6.47407 64.862 7.37903C65.2437 8.2716 65.4342 9.23863 65.4342 10.28C65.4342 11.3213 65.2437 12.2945 64.862 13.1995C64.4804 14.0921 63.9455 14.8731 63.256 15.5425C62.579 16.212 61.7669 16.7389 60.8192 17.1232C59.8715 17.495 58.8377 17.681 57.7178 17.681C56.5855 17.681 55.5455 17.495 54.5978 17.1232C53.6625 16.7389 52.8563 16.212 52.1795 15.5425C51.5025 14.8731 50.9733 14.0921 50.5918 13.1995C50.2102 12.2945 50.0195 11.3213 50.0195 10.28Z" fill="#151834"/>
</svg>`;

// ブランドカラー（BONO + Airbnb風）
const BRAND = {
  primary: '#151834',      // ダークネイビー（ロゴ、ボタン）
  background: '#F9F9F7',   // BONO背景色（温かいオフホワイト）
  cardBg: '#FFFFFF',       // カード背景（白）
  text: '#222222',         // メインテキスト
  textSecondary: '#717171', // サブテキスト
  border: '#F5F5F5',       // ボーダー
};

const BonoLogo: React.FC = () => (
  <svg width="68" height="20" viewBox="0 0 68 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.27461 14.4641H6.06843C6.97918 14.4641 7.63147 14.3463 8.02527 14.1108C8.41915 13.8752 8.61607 13.4971 8.61607 12.9765C8.61607 12.4557 8.41915 12.0776 8.02527 11.8421C7.63147 11.6066 6.97918 11.4888 6.06843 11.4888H5.27461V14.4641ZM5.27461 8.77386H5.9392C7.07146 8.77386 7.63761 8.32135 7.63761 7.41634C7.63761 6.51138 7.07146 6.05887 5.9392 6.05887H5.27461V8.77386ZM1.65625 3.26953H7.04688C8.32681 3.26953 9.29913 3.57945 9.96371 4.19931C10.6283 4.81916 10.9605 5.71176 10.9605 6.87706C10.9605 7.58374 10.8314 8.17258 10.5729 8.64365C10.3268 9.10235 9.94525 9.49285 9.42833 9.81521C9.94525 9.91435 10.3822 10.0693 10.7391 10.2801C11.1083 10.4784 11.4037 10.7264 11.6252 11.0239C11.8591 11.3214 12.0252 11.6561 12.1237 12.0281C12.222 12.4 12.2714 12.7967 12.2714 13.2182C12.2714 13.8752 12.1543 14.4579 11.9205 14.9662C11.6991 15.4745 11.379 15.9022 10.9605 16.2493C10.5545 16.5964 10.0559 16.8567 9.46525 17.0303C8.87453 17.2039 8.2099 17.2906 7.47148 17.2906H1.65625V3.26953Z" fill="#151834"/>
    <path d="M18.2415 10.28C18.2415 10.8378 18.3462 11.3523 18.5554 11.8234C18.7646 12.2945 19.0477 12.7036 19.4047 13.0507C19.7615 13.3978 20.1738 13.6706 20.6414 13.8689C21.1214 14.0549 21.6261 14.1478 22.1553 14.1478C22.6845 14.1478 23.183 14.0549 23.6506 13.8689C24.1306 13.6706 24.5491 13.3978 24.9059 13.0507C25.2752 12.7036 25.5644 12.2945 25.7736 11.8234C25.9829 11.3523 26.0875 10.8378 26.0875 10.28C26.0875 9.72208 25.9829 9.20763 25.7736 8.73655C25.5644 8.26542 25.2752 7.85635 24.9059 7.50924C24.5491 7.16212 24.1306 6.89558 23.6506 6.70961C23.183 6.51127 22.6845 6.41206 22.1553 6.41206C21.6261 6.41206 21.1214 6.51127 20.6414 6.70961C20.1738 6.89558 19.7615 7.16212 19.4047 7.50924C19.0477 7.85635 18.7646 8.26542 18.5554 8.73655C18.3462 9.20763 18.2415 9.72208 18.2415 10.28ZM14.457 10.28C14.457 9.23863 14.6478 8.2716 15.0294 7.37903C15.4109 6.47407 15.9401 5.68685 16.617 5.0174C17.2938 4.34796 18.1001 3.82729 19.0354 3.45537C19.983 3.07106 21.023 2.87891 22.1553 2.87891C23.2752 2.87891 24.3091 3.07106 25.2567 3.45537C26.2044 3.82729 27.0167 4.34796 27.6936 5.0174C28.3828 5.68685 28.9182 6.47407 29.2997 7.37903C29.6812 8.2716 29.872 9.23863 29.872 10.28C29.872 11.3213 29.6812 12.2945 29.2997 13.1995C28.9182 14.0921 28.3828 14.8731 27.6936 15.5425C27.0167 16.212 26.2044 16.7389 25.2567 17.1232C24.3091 17.495 23.2752 17.681 22.1553 17.681C21.023 17.681 19.983 17.495 19.0354 17.1232C18.1001 16.7389 17.2938 16.212 16.617 15.5425C15.9401 14.8731 15.4109 14.0921 15.0294 13.1995C14.6478 12.2945 14.457 11.3213 14.457 10.28Z" fill="#151834"/>
    <path d="M32.9121 17.2906V3.26953H36.5305L43.2134 11.8421V3.26953H46.8133V17.2906H43.2134L36.5305 8.71804V17.2906H32.9121Z" fill="#151834"/>
    <path d="M53.804 10.28C53.804 10.8378 53.9087 11.3523 54.1179 11.8234C54.3271 12.2945 54.6102 12.7036 54.9671 13.0507C55.324 13.3978 55.7363 13.6706 56.2039 13.8689C56.6839 14.0549 57.1886 14.1478 57.7178 14.1478C58.2469 14.1478 58.7454 14.0549 59.2131 13.8689C59.693 13.6706 60.1116 13.3978 60.4684 13.0507C60.8377 12.7036 61.1268 12.2945 61.3361 11.8234C61.5453 11.3523 61.6499 10.8378 61.6499 10.28C61.6499 9.72208 61.5453 9.20763 61.3361 8.73655C61.1268 8.26542 60.8377 7.85635 60.4684 7.50924C60.1116 7.16212 59.693 6.89558 59.2131 6.70961C58.7454 6.51127 58.2469 6.41206 57.7178 6.41206C57.1886 6.41206 56.6839 6.51127 56.2039 6.70961C55.7363 6.89558 55.324 7.16212 54.9671 7.50924C54.6102 7.85635 54.3271 8.26542 54.1179 8.73655C53.9087 9.20763 53.804 9.72208 53.804 10.28ZM50.0195 10.28C50.0195 9.23863 50.2102 8.2716 50.5918 7.37903C50.9733 6.47407 51.5025 5.68685 52.1795 5.0174C52.8563 4.34796 53.6625 3.82729 54.5978 3.45537C55.5455 3.07106 56.5855 2.87891 57.7178 2.87891C58.8377 2.87891 59.8715 3.07106 60.8192 3.45537C61.7669 3.82729 62.579 4.34796 63.256 5.0174C63.9455 5.68685 64.4804 6.47407 64.862 7.37903C65.2437 8.2716 65.4342 9.23863 65.4342 10.28C65.4342 11.3213 65.2437 12.2945 64.862 13.1995C64.4804 14.0921 63.9455 14.8731 63.256 15.5425C62.579 16.212 61.7669 16.7389 60.8192 17.1232C59.8715 17.495 58.8377 17.681 57.7178 17.681C56.5855 17.681 55.5455 17.495 54.5978 17.1232C53.6625 16.7389 52.8563 16.212 52.1795 15.5425C51.5025 14.8731 50.9733 14.0921 50.5918 13.1995C50.2102 12.2945 50.0195 11.3213 50.0195 10.28Z" fill="#151834"/>
  </svg>
);

const EmailTemplate: React.FC<{ config: TemplateConfig }> = ({ config }) => {
  return (
    <div
      style={{
        margin: 0,
        padding: '12px',
        backgroundColor: BRAND.background,
        fontFamily: "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif",
        width: '100%',
      }}
    >
      <style>{`
        @media only screen and (max-width: 480px) {
          .email-pad-x {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
        }
      `}</style>
      {/* 白いカード */}
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          backgroundColor: BRAND.cardBg,
          borderRadius: '32px',
          overflow: 'hidden',
          border: `1px solid ${BRAND.border}`,
          boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.04)',
          width: '100%',
        }}
      >
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
        >
                <tbody>
                  {/* ヘッダー（ロゴ・左寄せ） */}
                  <tr>
                    <td
                      className="email-pad-x"
                      style={{
                        padding: '32px 48px 24px 48px',
                        textAlign: 'left',
                      }}
                    >
                      <BonoLogo />
                    </td>
                  </tr>

                  {/* メインコンテンツ（左寄せ） */}
                  <tr>
                    <td className="email-pad-x" style={{ padding: '0 24px', width: '100%' }}>
                      {/* タイトル */}
                      <h1
                        style={{
                          margin: '0 0 24px 0',
                          fontSize: '32px',
                          fontWeight: 700,
                          color: BRAND.text,
                          lineHeight: '36px',
                          textAlign: 'left',
                        }}
                      >
                        {config.heading}
                      </h1>

                      {/* 本文 */}
                      <p
                        style={{
                          margin: '0 0 24px 0',
                          fontSize: '18px',
                          color: BRAND.text,
                          lineHeight: '28px',
                          textAlign: 'left',
                          fontWeight: 400,
                        }}
                        dangerouslySetInnerHTML={{ __html: config.body }}
                      />

                      {/* セクション（ウェルカムメール用） */}
                      {config.sections && config.sections.map((section, index) => (
                        <div key={index} style={{ marginBottom: '32px' }}>
                          <h2
                            style={{
                              margin: '0 0 12px 0',
                              fontSize: '18px',
                              fontWeight: 700,
                              color: BRAND.text,
                              lineHeight: '24px',
                            }}
                          >
                            {section.title}
                          </h2>
                          <p
                            style={{
                              margin: '0 0 16px 0',
                              fontSize: '16px',
                              color: BRAND.text,
                              lineHeight: '24px',
                            }}
                            dangerouslySetInnerHTML={{ __html: section.content }}
                          />
                          {section.buttonText && (
                            <table cellPadding={0} cellSpacing={0}>
                              <tbody>
                                <tr>
                                  <td>
                                    <a
                                      href={section.buttonUrl || '#'}
                                      style={{
                                        display: 'inline-block',
                                        padding: '14px 24px',
                                        backgroundColor: BRAND.primary,
                                        color: '#FFFFFF',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        borderRadius: '8px',
                                      }}
                                    >
                                      {section.buttonText}
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          )}
                        </div>
                      ))}

                      {/* ボタン（通常テンプレート用） */}
                      {config.buttonText && !config.sections && (
                        <table cellPadding={0} cellSpacing={0} style={{ marginBottom: '24px' }}>
                          <tbody>
                            <tr>
                              <td>
                                <a
                                  href={config.buttonUrl || '#'}
                                  style={{
                                    display: 'inline-block',
                                    padding: '14px 24px',
                                    backgroundColor: BRAND.primary,
                                    color: '#FFFFFF',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                  }}
                                >
                                  {config.buttonText}
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}

                      {/* 補足テキスト */}
                      {config.note && (
                        <p
                          style={{
                            margin: '0 0 24px 0',
                            fontSize: '14px',
                            color: BRAND.textSecondary,
                            lineHeight: '20px',
                            textAlign: 'left',
                            fontWeight: 400,
                          }}
                          dangerouslySetInnerHTML={{ __html: config.note }}
                        />
                      )}
                    </td>
                  </tr>

                  {/* 区切り線 */}
                  <tr>
                    <td className="email-pad-x" style={{ padding: '0 48px' }}>
                      <hr style={{
                        border: 'none',
                        borderTop: `1px solid ${BRAND.border}`,
                        margin: 0,
                      }} />
                    </td>
                  </tr>

                  {/* フッター */}
                  <tr>
                    <td className="email-pad-x" style={{ padding: '32px 48px' }}>
                      {/* ロゴ */}
                      <div style={{ marginBottom: '32px' }}>
                        <BonoLogo />
                      </div>
                      {/* 会社情報 */}
                      <p
                        style={{
                          margin: 0,
                          fontSize: '12px',
                          color: BRAND.textSecondary,
                          lineHeight: '16px',
                          fontWeight: 400,
                          fontStyle: 'italic',
                        }}
                      >
                        BONO lights the path. The dawn is yours.
                      </p>
                    </td>
                  </tr>
                </tbody>
        </table>
      </div>
    </div>
  );
};

const EmailTemplates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('password-reset');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <Mail className="w-8 h-8 text-[#151834]" />
          <h1 className="text-3xl font-bold">Email Templates</h1>
        </div>
        <p className="text-gray-600">
          BONOのトランザクションメールテンプレートのプレビュー
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* テンプレート選択 */}
        <div className="mb-8">
          {/* Supabase Auth メール */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Supabase Auth メール
            </h2>
            <div className="flex flex-wrap gap-3">
              {(['password-reset', 'confirm-signup', 'change-email'] as TemplateType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedTemplate === key
                      ? 'bg-[#151834] text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {templates[key].title}
                </button>
              ))}
            </div>
          </div>

          {/* サブスクリプション通知メール */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              サブスクリプション通知メール（Resend）
            </h2>
            <div className="flex flex-wrap gap-3">
              {(['welcome', 'plan-change', 'cancellation'] as TemplateType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedTemplate === key
                      ? 'bg-[#151834] text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {templates[key].title}
                </button>
              ))}
            </div>
          </div>

          {/* ウェルカムメール改善案 */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-3">
              🆕 ウェルカムメール改善案（新旧サイト案内追加）
            </h2>
            <div className="flex flex-wrap gap-3">
              {(['welcome-v2-a', 'welcome-v2-b', 'welcome-v2-c'] as TemplateType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedTemplate === key
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-gray-700 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {templates[key].title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* プレビュー */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* デスクトップビュー */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              デスクトッププレビュー
            </h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">mail.google.com</span>
              </div>
              <div>
                <div className="p-4 bg-white border-b border-gray-100">
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="font-semibold text-gray-900">BONO ボノ</span>
                    <span className="ml-2">&lt;noreply@mail.bo-no.design&gt;</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    件名: {templates[selectedTemplate].title}のご案内
                  </div>
                </div>
                <EmailTemplate config={templates[selectedTemplate]} />
              </div>
            </div>
          </div>

          {/* モバイルビュー */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              モバイルプレビュー
            </h2>
            <div className="max-w-[375px] mx-auto">
              <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-xl">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  {/* ノッチ */}
                  <div className="bg-gray-100 h-8 flex items-center justify-center">
                    <div className="w-20 h-5 bg-gray-900 rounded-full"></div>
                  </div>
                  {/* メール表示 */}
                  <div className="max-h-[600px] overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 bg-white">
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-900">BONO ボノ</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-900 mt-1">
                        {templates[selectedTemplate].title}のご案内
                      </div>
                    </div>
                    <div
                      style={{
                        transform: 'scale(0.9)',
                        transformOrigin: 'top center',
                        width: '100%',
                        height: 'fit-content',
                      }}
                    >
                      <EmailTemplate config={templates[selectedTemplate]} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase Auth用HTML */}
        <div className="mt-12">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Supabase Email Template用HTML
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            以下のHTMLをSupabaseのEmail Templatesにコピーしてください。
            <code className="mx-1 px-2 py-0.5 bg-gray-100 rounded text-xs">{'{{ .ConfirmationURL }}'}</code>
            はSupabaseが自動的に置換します。
          </p>

          <div className="space-y-8">
            {(['password-reset', 'confirm-signup', 'change-email'] as TemplateType[]).map((key) => (
              <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <div>
                    <h3 className="font-semibold text-gray-900">{templates[key].title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {key === 'password-reset' && 'Supabase: Reset Password'}
                      {key === 'confirm-signup' && 'Supabase: Confirm Signup'}
                      {key === 'change-email' && 'Supabase: Change Email Address'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateSupabaseTemplate(templates[key]));
                      alert(`${templates[key].title}のHTMLをコピーしました！`);
                    }}
                    className="px-4 py-2 bg-[#151834] text-white text-sm rounded-lg font-medium hover:bg-[#1a1f42] transition-colors"
                  >
                    HTMLをコピー
                  </button>
                </div>
                <div className="bg-gray-900 p-4 overflow-x-auto max-h-[300px] overflow-y-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                    {generateSupabaseTemplate(templates[key])}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* サブスクリプション通知用HTML（Resend Edge Function用） */}
        <div className="mt-12">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            サブスクリプション通知メール用HTML（Edge Function用）
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            以下のHTMLはEdge Functionで使用します。変数はコード側で置換されます。
          </p>

          <div className="space-y-8">
            {(['welcome', 'plan-change', 'cancellation'] as TemplateType[]).map((key) => (
              <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <div>
                    <h3 className="font-semibold text-gray-900">{templates[key].title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {key === 'welcome' && 'トリガー: checkout.session.completed'}
                      {key === 'plan-change' && 'トリガー: customer.subscription.updated'}
                      {key === 'cancellation' && 'トリガー: customer.subscription.deleted'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateResendTemplate(templates[key]));
                      alert(`${templates[key].title}のHTMLをコピーしました！`);
                    }}
                    className="px-4 py-2 bg-[#151834] text-white text-sm rounded-lg font-medium hover:bg-[#1a1f42] transition-colors"
                  >
                    HTMLをコピー
                  </button>
                </div>
                <div className="bg-gray-900 p-4 overflow-x-auto max-h-[300px] overflow-y-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                    {generateResendTemplate(templates[key])}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function generateSupabaseTemplate(config: TemplateConfig): string {
  // SVGをBase64エンコード（メールクライアント互換性のため）
  const logoBase64 = btoa(BONO_LOGO_SVG);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 480px) {
      .email-pad-x {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F7; font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9F9F7; padding: 12px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #FFFFFF; border-radius: 32px; overflow: hidden; border: 1px solid #F5F5F5; box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.04);">
          <!-- ロゴ -->
          <tr>
            <td class="email-pad-x" style="padding: 32px 48px 24px 48px; text-align: left;">
              <img src="data:image/svg+xml;base64,${logoBase64}" alt="BONO" width="68" height="20" style="display: block;" />
            </td>
          </tr>
          <!-- コンテンツ -->
          <tr>
            <td class="email-pad-x" style="padding: 0 24px; width: 100%;">
              <h1 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 700; color: #222222; line-height: 36px; text-align: left;">
                ${config.heading}
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 18px; color: #222222; line-height: 28px; text-align: left; font-weight: 400;">
                ${config.body}
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 24px; background-color: #151834; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      ${config.buttonText || ''}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #717171; line-height: 20px; text-align: left; font-weight: 400;">
                ${config.note || ''}
              </p>
            </td>
          </tr>
          <!-- 区切り線 -->
          <tr>
            <td class="email-pad-x" style="padding: 0 48px;">
              <hr style="border: none; border-top: 1px solid #F5F5F5; margin: 0;" />
            </td>
          </tr>
          <!-- フッター -->
          <tr>
            <td class="email-pad-x" style="padding: 32px 48px;">
              <img src="data:image/svg+xml;base64,${logoBase64}" alt="BONO" width="68" height="20" style="display: block; margin-bottom: 32px;" />
              <p style="margin: 0; font-size: 12px; color: #717171; line-height: 16px; font-weight: 400; font-style: italic;">BONO lights the path. The dawn is yours.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateResendTemplate(config: TemplateConfig): string {
  // SVGをBase64エンコード（メールクライアント互換性のため）
  const logoBase64 = btoa(BONO_LOGO_SVG);

  // セクションHTML生成
  let sectionsHtml = '';
  if (config.sections) {
    sectionsHtml = config.sections.map(section => `
              <!-- セクション -->
              <div style="margin-bottom: 32px;">
                <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #222222; line-height: 24px;">
                  ${section.title}
                </h2>
                <p style="margin: 0 0 16px 0; font-size: 16px; color: #222222; line-height: 24px;">
                  ${section.content}
                </p>
                ${section.buttonText ? `
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <a href="${section.buttonUrl || '#'}" style="display: inline-block; padding: 14px 24px; background-color: #151834; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                        ${section.buttonText}
                      </a>
                    </td>
                  </tr>
                </table>` : ''}
              </div>`
    ).join('\n');
  }

  // ボタンHTML生成（セクションがない場合のみ）
  let buttonHtml = '';
  if (config.buttonText && !config.sections) {
    buttonHtml = `
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <a href="${config.buttonUrl || '#'}" style="display: inline-block; padding: 14px 24px; background-color: #151834; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      ${config.buttonText}
                    </a>
                  </td>
                </tr>
              </table>`;
  }

  // 補足テキストHTML
  let noteHtml = '';
  if (config.note) {
    noteHtml = `
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #717171; line-height: 20px; text-align: left; font-weight: 400;">
                ${config.note}
              </p>`;
  }

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 480px) {
      .email-pad-x {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F7; font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9F9F7; padding: 12px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #FFFFFF; border-radius: 32px; overflow: hidden; border: 1px solid #F5F5F5; box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.04);">
          <!-- ロゴ -->
          <tr>
            <td class="email-pad-x" style="padding: 32px 48px 24px 48px; text-align: left;">
              <img src="data:image/svg+xml;base64,${logoBase64}" alt="BONO" width="68" height="20" style="display: block;" />
            </td>
          </tr>
          <!-- コンテンツ -->
          <tr>
            <td class="email-pad-x" style="padding: 0 24px; width: 100%;">
              <h1 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 700; color: #222222; line-height: 36px; text-align: left;">
                ${config.heading}
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 18px; color: #222222; line-height: 28px; text-align: left; font-weight: 400;">
                ${config.body}
              </p>
${sectionsHtml}
${buttonHtml}
${noteHtml}
            </td>
          </tr>
          <!-- 区切り線 -->
          <tr>
            <td class="email-pad-x" style="padding: 0 48px;">
              <hr style="border: none; border-top: 1px solid #F5F5F5; margin: 0;" />
            </td>
          </tr>
          <!-- フッター -->
          <tr>
            <td class="email-pad-x" style="padding: 32px 48px;">
              <img src="data:image/svg+xml;base64,${logoBase64}" alt="BONO" width="68" height="20" style="display: block; margin-bottom: 32px;" />
              <p style="margin: 0; font-size: 12px; color: #717171; line-height: 16px; font-weight: 400; font-style: italic;">BONO lights the path. The dawn is yours.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default EmailTemplates;
