import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Terminal, FileText, Settings, Eye, Command, RotateCcw } from 'lucide-react';

const BlogGuide: React.FC = () => {
  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Blog開発ガイド</h1>
          <p className="text-lg text-gray-600">
            Ghost CMSを使用したブログ機能の開発・運用方法
          </p>
        </div>

        <Separator className="my-8" />

        {/* 概要 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              概要
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              このプロジェクトでは、<strong>Ghost CMS</strong>を使用してブログ記事を管理しています。
              Ghost CMSはヘッドレスCMSとして動作し、フロントエンドはReactで構築されています。
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="font-semibold">主な機能:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Ghost Content APIを使用した記事の取得</li>
                <li>Ghost接続失敗時の自動フォールバック（mockデータ）</li>
                <li>カテゴリフィルタリング、ページネーション</li>
                <li>RSSフィード、サイトマップ生成</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Ghost CMSのセットアップ */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ghost CMSのセットアップ
            </CardTitle>
            <CardDescription>
              Docker Composeを使用してGhost CMSをローカル環境で起動します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ステップ1 */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                Docker Desktopを起動
              </h3>
              <div className="ml-8 space-y-2">
                <p className="text-sm text-gray-600 mb-2">
                  Docker Desktopがインストールされていない場合は、先にインストールしてください。
                </p>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>インストール</AlertTitle>
                  <AlertDescription>
                    <a
                      href="https://www.docker.com/products/docker-desktop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Docker Desktop公式サイト
                    </a>
                    からダウンロードしてインストールしてください。
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator />

            {/* ステップ2 */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                Ghost CMSコンテナを起動
              </h3>
              <div className="ml-8 space-y-3">
                <p className="text-sm text-gray-600">
                  プロジェクトルートで以下のコマンドを実行します：
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-start gap-2">
                    <Terminal className="h-4 w-4 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-green-400"># Ghostコンテナを起動（バックグラウンド）</p>
                      <p className="mt-1">docker compose up -d ghost</p>

                      <p className="text-green-400 mt-4"># ログを確認</p>
                      <p className="mt-1">docker compose logs -f ghost</p>

                      <p className="text-green-400 mt-4"># 停止する場合</p>
                      <p className="mt-1">docker compose down</p>
                    </div>
                  </div>
                </div>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>起動確認</AlertTitle>
                  <AlertDescription>
                    正常に起動すると、<code className="bg-gray-100 px-2 py-1 rounded">http://localhost:2368</code> でGhostにアクセスできます。
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator />

            {/* ステップ3 */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                Ghost管理画面にアクセス
              </h3>
              <div className="ml-8 space-y-3">
                <p className="text-sm text-gray-600">
                  ブラウザで以下のURLにアクセスして初期セットアップを行います：
                </p>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <a
                    href="http://localhost:2368/ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-mono"
                  >
                    http://localhost:2368/ghost
                  </a>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">初回アクセス時の設定:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>サイトタイトルを入力（例: BONO Training Blog）</li>
                    <li>管理者アカウントを作成（メール、パスワード）</li>
                    <li>セットアップ完了</li>
                  </ol>
                </div>
              </div>
            </div>

            <Separator />

            {/* ステップ4 */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                Content API Keyを取得
              </h3>
              <div className="ml-8 space-y-3">
                <p className="text-sm text-gray-600">
                  フロントエンドからGhost APIにアクセスするためのキーを取得します：
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm ml-4">
                  <li>Ghost管理画面の左サイドバーから <strong>Settings</strong> をクリック</li>
                  <li><strong>Integrations</strong> を選択</li>
                  <li><strong>Add custom integration</strong> をクリック</li>
                  <li>Integration名を入力（例: BONO Training Frontend）</li>
                  <li><strong>Content API Key</strong> をコピー</li>
                </ol>
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">重要</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    このキーは次のステップで<code className="bg-yellow-100 px-2 py-1 rounded">.env</code>ファイルに設定します。
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator />

            {/* ステップ5 */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
                環境変数の設定
              </h3>
              <div className="ml-8 space-y-3">
                <p className="text-sm text-gray-600">
                  プロジェクトルートの<code className="bg-gray-100 px-2 py-1 rounded">.env</code>ファイルに以下を追加します：
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="space-y-1">
                    <p className="text-green-400"># Blog設定</p>
                    <p>VITE_BLOG_DATA_SOURCE=ghost</p>
                    <p>VITE_GHOST_URL=http://localhost:2368</p>
                    <p>VITE_GHOST_KEY=&lt;ここにContent API Keyを貼り付け&gt;</p>
                  </div>
                </div>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    設定後、開発サーバーを再起動してください: <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ブログ記事の公開 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              ブログ記事の公開方法
            </CardTitle>
            <CardDescription>
              Ghost管理画面から記事を作成・公開する手順
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 記事作成 */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                新しい記事を作成
              </h3>
              <div className="ml-8 space-y-2 text-sm">
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Ghost管理画面 (<code className="bg-gray-100 px-2 py-1 rounded">http://localhost:2368/ghost</code>) にログイン</li>
                  <li>左サイドバーの <strong>Posts</strong> をクリック</li>
                  <li>右上の <strong>New post</strong> ボタンをクリック</li>
                </ol>
              </div>
            </div>

            <Separator />

            {/* 記事編集 */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                記事を編集
              </h3>
              <div className="ml-8 space-y-3">
                <p className="text-sm text-gray-600 mb-2">
                  エディタで以下の項目を設定します：
                </p>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-semibold">タイトル</p>
                    <p className="text-gray-600">記事のタイトルを入力</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-semibold">本文</p>
                    <p className="text-gray-600">Markdown形式で記事の内容を書く</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-semibold">アイキャッチ画像</p>
                    <p className="text-gray-600">記事のサムネイル画像を設定（右側の設定パネル）</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-semibold">タグ（カテゴリ）</p>
                    <p className="text-gray-600">記事のカテゴリをタグとして設定（design, development, uiux など）</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-semibold">抜粋（Excerpt）</p>
                    <p className="text-gray-600">記事一覧で表示される要約文</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 記事公開 */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                記事を公開
              </h3>
              <div className="ml-8 space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm ml-4">
                  <li>右上の <strong>Publish</strong> ボタンをクリック</li>
                  <li>公開設定を確認（公開日時、アクセス権限など）</li>
                  <li><strong>Publish now</strong> をクリックして公開</li>
                </ol>
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    公開された記事は、すぐにフロントエンド (<code className="bg-green-100 px-2 py-1 rounded">http://localhost:8080/blog</code>) に表示されます。
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator />

            {/* フロントエンドで確認 */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                フロントエンドで確認
              </h3>
              <div className="ml-8 space-y-3">
                <p className="text-sm text-gray-600">
                  ブラウザで以下のURLにアクセスして、公開した記事を確認します：
                </p>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <a
                    href="http://localhost:8080/blog"
                    className="text-blue-600 hover:underline font-mono"
                  >
                    http://localhost:8080/blog
                  </a>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">確認ポイント:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>記事一覧に新しい記事が表示されている</li>
                    <li>アイキャッチ画像が正しく表示されている</li>
                    <li>タグ（カテゴリ）が正しく設定されている</li>
                    <li>記事をクリックして詳細ページが表示される</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* トラブルシューティング */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              トラブルシューティング
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* 問題1 */}
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <p className="font-semibold text-red-700">Ghostに接続できない</p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>解決方法:</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1 mt-1">
                  <li>Docker Desktopが起動しているか確認</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">docker compose ps</code> でGhostコンテナの状態を確認</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">docker compose logs ghost</code> でエラーログを確認</li>
                </ul>
              </div>

              {/* 問題2 */}
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <p className="font-semibold text-red-700">フロントエンドに記事が表示されない</p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>解決方法:</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1 mt-1">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">.env</code>ファイルの設定を確認</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">VITE_BLOG_DATA_SOURCE=ghost</code> になっているか</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">VITE_GHOST_KEY</code> が正しく設定されているか</li>
                  <li>開発サーバーを再起動</li>
                  <li>ブラウザのコンソールでエラーを確認</li>
                </ul>
              </div>

              {/* 問題3 */}
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <p className="font-semibold text-yellow-700">mockデータが表示される</p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>説明:</strong> Ghost APIへの接続に失敗すると、自動的にmockデータにフォールバックします。
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>確認:</strong> ブラウザのコンソールに「Ghost API failed」というメッセージが表示されているか確認してください。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

{/* NPMコマンド */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              NPMコマンド一覧
            </CardTitle>
            <CardDescription>
              Ghost CMSを操作するためのコマンド
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-4">
              <div>
                <p className="text-green-400"># Ghostを起動</p>
                <p>npm run ghost:start</p>
              </div>
              <div>
                <p className="text-green-400"># Ghostを停止</p>
                <p>npm run ghost:stop</p>
              </div>
              <div>
                <p className="text-green-400"># ログを確認（リアルタイム）</p>
                <p>npm run ghost:logs</p>
              </div>
              <div>
                <p className="text-green-400"># ダミー記事を作成（要Admin API Key）</p>
                <p>npm run ghost:seed</p>
              </div>
              <div>
                <p className="text-yellow-400"># ⚠️ 完全リセット（データ全削除）</p>
                <p>npm run ghost:reset</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* パスワードを忘れた場合 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              パスワードを忘れた場合
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">注意</AlertTitle>
              <AlertDescription className="text-yellow-700">
                ローカル環境ではメールサーバーが設定されていないため、「Forgot password」機能は使えません。
              </AlertDescription>
            </Alert>
            <p className="text-sm text-gray-600">
              パスワードを忘れた場合は、Ghostを完全にリセットして再セットアップする必要があります。
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              <p className="text-yellow-400"># 完全リセット（記事データは全て削除されます）</p>
              <p className="mt-1">npm run ghost:reset</p>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-800 mb-2">リセット後の手順:</p>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                <li>http://localhost:2368/ghost にアクセス</li>
                <li>新しいアカウントで初期セットアップ</li>
                <li>Integrationを作成してAPI Keyを再取得</li>
                <li>.envファイルのAPI Keyを更新</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* 参考リンク */}
        <Card>
          <CardHeader>
            <CardTitle>参考リンク</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://ghost.org/docs/content-api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  Ghost Content API Documentation
                  <span className="text-xs text-gray-500">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://ghost.org/help/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  Ghost Help & Tutorials
                  <span className="text-xs text-gray-500">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  Blog一覧ページ
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BlogGuide;
