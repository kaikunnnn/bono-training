export default function RootLayout({ children }) {
    return (
      <html lang="ja">
        <body>
          <header>
            <h1>App Router レイアウトのテスト</h1>
          </header>
          <main>
            {children}
          </main>
          <footer>
            <p>フッターエリア</p>
          </footer>
        </body>
      </html>
    );
  }