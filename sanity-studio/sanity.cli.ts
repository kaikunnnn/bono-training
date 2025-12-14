import {defineCliConfig} from 'sanity/cli'

// 環境変数でデータセットを切り替え（デフォルトはdevelopment）
const dataset = process.env.SANITY_STUDIO_DATASET || 'development'

export default defineCliConfig({
  api: {
    projectId: 'cqszh4up',
    dataset: dataset
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
  }
})
