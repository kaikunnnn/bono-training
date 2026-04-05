import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'cqszh4up',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
})

async function migrateExternalLinks() {
  console.log('🔗 外部リンクのマイグレーション開始...\n')

  // 全ロードマップを取得
  const roadmaps = await client.fetch(`*[_type == "roadmap"]`)

  console.log(`✓ ${roadmaps.length} 件のロードマップを取得しました\n`)

  let updateCount = 0
  let linkCount = 0

  for (const roadmap of roadmaps) {
    console.log(`処理中: ${roadmap.title || roadmap._id}`)

    let needsUpdate = false
    const updatedSteps = roadmap.steps?.map((step: any) => {
      if (step.sections) {
        step.sections = step.sections.map((section: any) => {
          if (section.contents) {
            section.contents = section.contents.map((content: any) => {
              // 旧型のcontentItem linkを検出
              if (
                content._type === 'contentItem' &&
                (content.itemType === 'link' || content.itemType === 'externalLink')
              ) {
                // 新型externalLinkに変換
                const newLink: any = {
                  _key: content._key,
                  _type: 'externalLink',
                  title: content.linkLabel || content.externalTitle || 'リンク',
                  url: content.linkUrl || content.externalUrl || '',
                }

                // descriptionとthumbnailUrlがあれば追加
                if (content.linkDescription || content.externalDescription) {
                  newLink.description = content.linkDescription || content.externalDescription
                }
                if (content.linkThumbnailUrl || content.externalThumbnailUrl) {
                  newLink.thumbnailUrl = content.linkThumbnailUrl || content.externalThumbnailUrl
                }

                needsUpdate = true
                linkCount++
                console.log(
                  `  ✓ 外部リンクを変換: "${newLink.title}" → ${newLink.url}`
                )

                return newLink
              }

              return content
            })
          }

          return section
        })
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
      console.log(`  → 更新不要\n`)
    }
  }

  console.log(
    `\n✓ マイグレーション完了: ${updateCount}件のロードマップ、${linkCount}個のリンクを更新しました`
  )
}

migrateExternalLinks()
  .then(() => {
    console.log('\n✓ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
