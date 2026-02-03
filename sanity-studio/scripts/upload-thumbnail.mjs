import { getCliClient } from 'sanity/cli'
import { createReadStream } from 'fs'
import path from 'path'

const client = getCliClient()

const ARTICLE_ID = '1d309e70-cca6-4272-8299-45411365fd0b'
const IMAGE_PATH = '/Users/kaitakumi/Documents/01_BONO事業/BONO_動画/thumbnail/thumbnail_designcyle/07_end/01.jpg'

async function main() {
  console.log('画像をアップロード中...')
  console.log(`ファイル: ${IMAGE_PATH}`)

  // 画像をアップロード
  const imageAsset = await client.assets.upload('image', createReadStream(IMAGE_PATH), {
    filename: path.basename(IMAGE_PATH)
  })

  console.log(`アップロード完了: ${imageAsset._id}`)

  // 記事のthumbnailフィールドを更新
  console.log(`記事を更新中: ${ARTICLE_ID}`)

  const result = await client
    .patch(ARTICLE_ID)
    .set({
      thumbnail: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id
        }
      }
    })
    .commit()

  console.log('完了!')
  console.log(`記事タイトル: ${result.title}`)
}

main().catch(console.error)
