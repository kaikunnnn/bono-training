import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'cqszh4up',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN, // 環境変数から取得
})

async function updateStep1Links() {
  const roadmapId = 'oNWk1SXbyGbVYC4WgWISbP'

  // 現在のドキュメントを取得
  const roadmap = await client.getDocument(roadmapId)

  if (!roadmap || !roadmap.steps) {
    throw new Error('Roadmap not found')
  }

  // Step 1のSection 2を探す
  const step1 = roadmap.steps.find((s: any) => s._key === 'step1')
  if (!step1) {
    throw new Error('Step 1 not found')
  }

  const section2 = step1.sections.find((s: any) => s._key === 'step1sec2')
  if (!section2) {
    throw new Error('Section 2 not found')
  }

  // contentsを更新
  const updatedContents = section2.contents.map((content: any) => {
    if (content._key === 'step1sec2c1') {
      return {
        ...content,
        linkLabel: '目標設定',
        linkUrl: 'https://www.bo-no.design/contents/rdm-goalsetting',
      }
    }
    if (content._key === 'step1sec2c2') {
      return {
        ...content,
        linkLabel: '学習のコツ',
        linkUrl: 'https://www.bo-no.design/contents/rdm-7-tips-for-learning-design',
      }
    }
    return content
  })

  // section2を更新
  section2.contents = updatedContents

  // step1を更新
  const updatedSteps = roadmap.steps.map((s: any) => {
    if (s._key === 'step1') {
      return {
        ...s,
        sections: s.sections.map((sec: any) => {
          if (sec._key === 'step1sec2') {
            return section2
          }
          return sec
        }),
      }
    }
    return s
  })

  // ドキュメント全体を更新
  const result = await client
    .patch(roadmapId)
    .set({ steps: updatedSteps })
    .commit()

  console.log('✓ Successfully updated Step 1 external links:')
  console.log('  - 目標設定: https://www.bo-no.design/contents/rdm-goalsetting')
  console.log('  - 学習のコツ: https://www.bo-no.design/contents/rdm-7-tips-for-learning-design')

  return result
}

updateStep1Links()
  .then(() => {
    console.log('\n✓ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
