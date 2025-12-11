import { useCallback, useState } from 'react'
import { Stack, TextArea, Button, Card, Text, Box } from '@sanity/ui'
import { ArrayOfObjectsInputProps, set } from 'sanity'
import { marked } from 'marked'

/**
 * MarkdownImportInput コンポーネント
 * Markdownテキストを貼り付けてPortable Textに変換する機能を提供
 */
export function MarkdownImportInput(props: ArrayOfObjectsInputProps) {
  const { value, onChange, renderDefault } = props
  const [showImport, setShowImport] = useState(false)
  const [markdown, setMarkdown] = useState('')
  const [converting, setConverting] = useState(false)

  const handleConvert = useCallback(async () => {
    if (!markdown.trim()) {
      alert('Markdownテキストを入力してください')
      return
    }

    try {
      setConverting(true)

      // MarkdownをHTMLに変換
      const html = await marked.parse(markdown)

      // DOMParserでHTMLをパース
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // Portable Text形式に変換
      const blocks: any[] = []

      const processNode = (node: Node): any[] => {
        const results: any[] = []

        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim()
          if (text) {
            return [{
              _type: 'span',
              _key: Math.random().toString(36).substr(2, 9),
              text: text,
              marks: [],
            }]
          }
          return []
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement
          const tagName = el.tagName.toLowerCase()

          // 見出しH2
          if (tagName === 'h2') {
            return [{
              _type: 'block',
              _key: Math.random().toString(36).substr(2, 9),
              style: 'h2',
              children: Array.from(el.childNodes).flatMap(processNode),
              markDefs: [],
            }]
          }

          // 見出しH3
          if (tagName === 'h3') {
            return [{
              _type: 'block',
              _key: Math.random().toString(36).substr(2, 9),
              style: 'h3',
              children: Array.from(el.childNodes).flatMap(processNode),
              markDefs: [],
            }]
          }

          // 段落
          if (tagName === 'p') {
            const children = Array.from(el.childNodes).flatMap(processNode)
            if (children.length > 0) {
              return [{
                _type: 'block',
                _key: Math.random().toString(36).substr(2, 9),
                style: 'normal',
                children: children,
                markDefs: [],
              }]
            }
            return []
          }

          // 箇条書きリスト
          if (tagName === 'ul') {
            return Array.from(el.children).flatMap((li) => {
              const children = Array.from(li.childNodes).flatMap(processNode)
              if (children.length > 0) {
                return [{
                  _type: 'block',
                  _key: Math.random().toString(36).substr(2, 9),
                  style: 'normal',
                  listItem: 'bullet',
                  children: children,
                  markDefs: [],
                }]
              }
              return []
            })
          }

          // 番号付きリスト
          if (tagName === 'ol') {
            return Array.from(el.children).flatMap((li) => {
              const children = Array.from(li.childNodes).flatMap(processNode)
              if (children.length > 0) {
                return [{
                  _type: 'block',
                  _key: Math.random().toString(36).substr(2, 9),
                  style: 'normal',
                  listItem: 'number',
                  children: children,
                  markDefs: [],
                }]
              }
              return []
            })
          }

          // 太字
          if (tagName === 'strong') {
            const text = el.textContent?.trim()
            if (text) {
              return [{
                _type: 'span',
                _key: Math.random().toString(36).substr(2, 9),
                text: text,
                marks: ['strong'],
              }]
            }
            return []
          }

          // 斜体
          if (tagName === 'em') {
            const text = el.textContent?.trim()
            if (text) {
              return [{
                _type: 'span',
                _key: Math.random().toString(36).substr(2, 9),
                text: text,
                marks: ['em'],
              }]
            }
            return []
          }

          // その他の要素は子要素を再帰処理
          return Array.from(el.childNodes).flatMap(processNode)
        }

        return []
      }

      // body配下の全ノードを処理
      Array.from(doc.body.childNodes).forEach((node) => {
        const processed = processNode(node)
        blocks.push(...processed)
      })

      if (blocks.length === 0) {
        alert('変換できるコンテンツがありませんでした')
        return
      }

      // 既存のコンテンツに追加する形でセット
      const existingBlocks = value || []
      onChange(set([...existingBlocks, ...blocks]))

      // モーダルを閉じる
      setShowImport(false)
      setMarkdown('')
      alert(`Markdownの変換が完了しました！（${blocks.length}個のブロックを追加）`)
    } catch (error) {
      console.error('Markdown conversion error:', error)
      alert(`変換中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setConverting(false)
    }
  }, [markdown, onChange])

  return (
    <Stack space={3}>
      {/* Import from Markdownボタン */}
      <Card padding={2} radius={2} shadow={1}>
        <Button
          text="Import from Markdown"
          tone="primary"
          onClick={() => setShowImport(!showImport)}
          style={{ width: '100%' }}
        />
      </Card>

      {/* Markdownインポートエリア */}
      {showImport && (
        <Card padding={4} radius={2} shadow={1} tone="caution">
          <Stack space={3}>
            <Text size={1} weight="semibold">
              Markdownテキストを貼り付けてください
            </Text>
            <Text size={1} muted>
              対応している記法: ## 見出し2、### 見出し3、**太字**、箇条書き（-）、番号付きリスト（1.）
            </Text>
            <TextArea
              rows={10}
              value={markdown}
              onChange={(e) => setMarkdown(e.currentTarget.value)}
              placeholder="## 見出し&#10;&#10;テキスト内容...&#10;&#10;- リスト項目1&#10;- リスト項目2"
            />
            <Stack space={2}>
              <Button
                text={converting ? '変換中...' : 'Convert to Portable Text'}
                tone="positive"
                onClick={handleConvert}
                disabled={converting}
                style={{ width: '100%' }}
              />
              <Button
                text="キャンセル"
                mode="ghost"
                onClick={() => {
                  setShowImport(false)
                  setMarkdown('')
                }}
                style={{ width: '100%' }}
              />
            </Stack>
          </Stack>
        </Card>
      )}

      {/* 通常のPortable Textエディタ */}
      <Box>{renderDefault(props)}</Box>
    </Stack>
  )
}
