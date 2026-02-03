import { getCliClient } from 'sanity/cli'

const client = getCliClient()

async function main() {
  // クエスト「挑戦：お題のデザインを完成させよう」を検索
  const quests = await client.fetch(`
    *[_type == "quest" && title match "*挑戦*お題*完成*"] {
      _id,
      title,
      questNumber,
      articles[]-> {
        _id,
        title,
        articleNumber,
        "hasThumbnail": defined(thumbnail)
      }
    }
  `)

  console.log(JSON.stringify(quests, null, 2))
}

main().catch(console.error)
