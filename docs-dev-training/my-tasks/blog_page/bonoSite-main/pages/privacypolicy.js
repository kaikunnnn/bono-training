import SEO from "@/components/common/layout/Navigation/SEO";
import Header from "@/components/common/layout/Navigation/Header";

function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy | 東京で個人開発する1人デザイナーの日常"
        ogTitle="Privacy Policy | 東京で個人開発する1人デザイナーの日常"
        description=""
      ></SEO>
      <main className="max-h-full bg-Top bg-cover text-slate-900 bg-no-repeat">
        <Header />
        <div className="w-1/2 pt-20 m-auto mb-12">
          <h3>利用規約とプライバシー</h3>
          <p>
            当サイトは、個人のウェブサイトであり、訪問者の個人情報を収集することはありません。ただし、当サイトを訪問することで収集される情報がありますので、以下に記載します。
          </p>
          <div className="pt-8"></div>
          <h3>IPアドレス、Cookie、その他の情報の収集</h3>
          <p>
            当サイトは、訪問者のIPアドレス、Cookie、ウェブブラウザの種類などの情報を収集する場合があります。これらの情報は、訪問者の利用状況を分析するために使用されますが、個人を特定するものではありません。
          </p>
          <div className="pt-8"></div>
          <h3>広告配信について</h3>
          <p>
            当サイトは、第三者配信の広告サービスを利用することがあります。広告配信事業者は、Cookieやウェブビーコンなどを使用し、訪問者の興味に応じた広告を表示します。広告配信事業者によるCookieの使用を無効にすることができますので、ブラウザの設定をご確認ください。
          </p>
          <div className="pt-8"></div>
          <h3>外部リンクについて</h3>
          <p>
            当サイトは、外部のリンクを含む場合がありますが、外部サイトにおける個人情報の保護については、当サイトは責任を負いかねます。外部サイトへのリンクをクリックする際は、リンク先サイトのプライバシーポリシーを確認してください。
          </p>
        </div>
      </main>
    </>
  );
}

export default PrivacyPolicy;
