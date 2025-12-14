import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {presentationTool} from 'sanity/presentation'
import {schemaTypes} from './schemaTypes'

// 環境変数でデータセットを切り替え（デフォルトはdevelopment）
const dataset = process.env.SANITY_STUDIO_DATASET || 'development'

export default defineConfig({
  name: 'default',
  title: dataset === 'production' ? 'BONO (本番)' : 'BONO (開発)',

  projectId: 'cqszh4up',
  dataset: dataset,

  plugins: [
    structureTool(),
    visionTool(),
    presentationTool({
      previewUrl: {
        origin: typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:8081'
          : 'https://your-production-url.com', // 本番環境のURLに置き換えてください
        previewMode: {
          enable: '/api/draft',
        },
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
