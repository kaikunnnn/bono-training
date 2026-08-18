import {defineCliConfig} from 'sanity/cli'

// 環境変数でデータセットを切り替え（デフォルトはdevelopment）
const dataset = process.env.SANITY_STUDIO_DATASET || 'development'

export default defineCliConfig({
  api: {
    projectId: 'cqszh4up',
    dataset: dataset
  },
  // 既存のデプロイ先ホスト。設定しておくと deploy 時の対話プロンプトが出ない。
  studioHost: 'bono-training',
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
    // デプロイ対象アプリID（設定しておくと deploy 時のプロンプトが出ない）
    appId: 'sqjit9olf5s2m0genzvsnstc',
  }
})
