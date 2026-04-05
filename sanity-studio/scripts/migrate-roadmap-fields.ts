import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'cqszh4up',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
})

async function migrateRoadmapFields() {
  console.log('📋 ロードマップフィールドのマイグレーション開始...\n')

  // 全ロードマップを取得
  const roadmaps = await client.fetch(`*[_type == "roadmap"]`)

  console.log(`✓ ${roadmaps.length} 件のロードマップを取得しました\n`)

  let updateCount = 0

  for (const roadmap of roadmaps) {
    console.log(`処理中: ${roadmap.title || roadmap._id}`)

    let needsUpdate = false
    const updatedSteps = roadmap.steps?.map((step: any) => {
      let stepUpdated = false

      // stepTitle → title
      if (!step.title && step.stepTitle) {
        step.title = step.stepTitle
        stepUpdated = true
        console.log(`  ✓ ステップタイトルを移行: "${step.stepTitle}"`)
      }

      // stepGoals → goals
      if ((!step.goals || step.goals.length === 0) && step.stepGoals && step.stepGoals.length > 0) {
        step.goals = step.stepGoals
        stepUpdated = true
        console.log(`  ✓ ステップゴールを移行: ${step.stepGoals.length}件`)
      }

      // セクションの処理
      if (step.sections) {
        step.sections = step.sections.map((section: any) => {
          // sectionTitle → title
          if (!section.title && section.sectionTitle) {
            section.title = section.sectionTitle
            stepUpdated = true
            console.log(`    ✓ セクションタイトルを移行: "${section.sectionTitle}"`)
          }

          return section
        })
      }

      if (stepUpdated) {
        needsUpdate = true
      }

      return step
    })

    if (needsUpdate && updatedSteps) {
      // ドキュメントを更新
      await client
        .patch(roadmap._id)
        .set({ steps: updatedSteps })
        .commit()

      updateCount++
      console.log(`  → 更新完了\n`)
    } else {
      console.log(`  → 更新不要（すでに移行済み）\n`)
    }
  }

  console.log(`\n✓ マイグレーション完了: ${updateCount}件のロードマップを更新しました`)
}

migrateRoadmapFields()
  .then(() => {
    console.log('\n✓ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
