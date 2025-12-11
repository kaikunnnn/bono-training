import { useCallback, useState } from 'react'
import { Stack, TextArea, Button, Card, Text, Box } from '@sanity/ui'
import { ArrayOfObjectsInputProps, set } from 'sanity'
import { marked } from 'marked'

/**
 * MarkdownImportInput コンポーネント
 * Markdownテキストを貼り付けてPortable Textに変換する機能を提供
 *
 * 対応要素:
 * - 見出し: H2, H3, H4
 * - 段落
 * - 箇条書きリスト（-）
 * - 番号付きリスト（1.）
 * - 太字（**text**）
 * - 斜体（*text*）
 * - インラインコード（`code`）
 * - テーブル
 * - 引用（blockquote）
 * - 水平線（---）
 * - コードブロック（```）
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

      // ユニークキー生成
      const generateKey = () => Math.random().toString(36).substr(2, 9)

      // インライン要素を処理（span用）
      const processInlineNode = (node: Node, currentMarks: string[] = []): any[] => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || ''
          if (text) {
            return [{
              _type: 'span',
              _key: generateKey(),
              text: text,
              marks: [...currentMarks],
            }]
          }
          return []
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement
          const tagName = el.tagName.toLowerCase()

          // 太字
          if (tagName === 'strong' || tagName === 'b') {
            return Array.from(el.childNodes).flatMap(child =>
              processInlineNode(child, [...currentMarks, 'strong'])
            )
          }

          // 斜体
          if (tagName === 'em' || tagName === 'i') {
            return Array.from(el.childNodes).flatMap(child =>
              processInlineNode(child, [...currentMarks, 'em'])
            )
          }

          // インラインコード
          if (tagName === 'code') {
            return Array.from(el.childNodes).flatMap(child =>
              processInlineNode(child, [...currentMarks, 'code'])
            )
          }

          // その他のインライン要素は子要素を処理
          return Array.from(el.childNodes).flatMap(child =>
            processInlineNode(child, currentMarks)
          )
        }

        return []
      }

      // ブロック要素を処理
      const processNode = (node: Node): any[] => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim()
          if (text) {
            return [{
              _type: 'span',
              _key: generateKey(),
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
            const children = Array.from(el.childNodes).flatMap(child => processInlineNode(child))
            if (children.length === 0) {
              children.push({ _type: 'span', _key: generateKey(), text: '', marks: [] })
            }
            return [{
              _type: 'block',
              _key: generateKey(),
              style: 'h2',
              children: children,
              markDefs: [],
            }]
          }

          // 見出しH3
          if (tagName === 'h3') {
            const children = Array.from(el.childNodes).flatMap(child => processInlineNode(child))
            if (children.length === 0) {
              children.push({ _type: 'span', _key: generateKey(), text: '', marks: [] })
            }
            return [{
              _type: 'block',
              _key: generateKey(),
              style: 'h3',
              children: children,
              markDefs: [],
            }]
          }

          // 見出しH4
          if (tagName === 'h4') {
            const children = Array.from(el.childNodes).flatMap(child => processInlineNode(child))
            if (children.length === 0) {
              children.push({ _type: 'span', _key: generateKey(), text: '', marks: [] })
            }
            return [{
              _type: 'block',
              _key: generateKey(),
              style: 'h4',
              children: children,
              markDefs: [],
            }]
          }

          // 段落
          if (tagName === 'p') {
            const children = Array.from(el.childNodes).flatMap(child => processInlineNode(child))
            if (children.length > 0) {
              return [{
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                children: children,
                markDefs: [],
              }]
            }
            return []
          }

          // 引用（blockquote）
          if (tagName === 'blockquote') {
            const results: any[] = []
            Array.from(el.children).forEach((child) => {
              if (child.tagName.toLowerCase() === 'p') {
                const children = Array.from(child.childNodes).flatMap(c => processInlineNode(c))
                if (children.length > 0) {
                  results.push({
                    _type: 'block',
                    _key: generateKey(),
                    style: 'blockquote',
                    children: children,
                    markDefs: [],
                  })
                }
              }
            })
            return results
          }

          // 箇条書きリスト
          if (tagName === 'ul') {
            return Array.from(el.children).flatMap((li) => {
              // ネストしたリストをチェック
              const nestedUl = li.querySelector('ul')
              const nestedOl = li.querySelector('ol')

              // liの直接のテキストコンテンツを取得
              const children = Array.from(li.childNodes)
                .filter(child => child.nodeName !== 'UL' && child.nodeName !== 'OL')
                .flatMap(child => processInlineNode(child))

              const results: any[] = []

              if (children.length > 0) {
                results.push({
                  _type: 'block',
                  _key: generateKey(),
                  style: 'normal',
                  listItem: 'bullet',
                  level: 1,
                  children: children,
                  markDefs: [],
                })
              }

              // ネストしたリストがあれば処理（レベル2として）
              if (nestedUl) {
                Array.from(nestedUl.children).forEach((nestedLi) => {
                  const nestedChildren = Array.from(nestedLi.childNodes)
                    .filter(child => child.nodeName !== 'UL' && child.nodeName !== 'OL')
                    .flatMap(child => processInlineNode(child))
                  if (nestedChildren.length > 0) {
                    results.push({
                      _type: 'block',
                      _key: generateKey(),
                      style: 'normal',
                      listItem: 'bullet',
                      level: 2,
                      children: nestedChildren,
                      markDefs: [],
                    })
                  }
                })
              }

              return results
            })
          }

          // 番号付きリスト
          if (tagName === 'ol') {
            return Array.from(el.children).flatMap((li) => {
              const children = Array.from(li.childNodes)
                .filter(child => child.nodeName !== 'UL' && child.nodeName !== 'OL')
                .flatMap(child => processInlineNode(child))

              if (children.length > 0) {
                return [{
                  _type: 'block',
                  _key: generateKey(),
                  style: 'normal',
                  listItem: 'number',
                  level: 1,
                  children: children,
                  markDefs: [],
                }]
              }
              return []
            })
          }

          // テーブル
          if (tagName === 'table') {
            const rows: { isHeader: boolean; cells: string[] }[] = []

            // theadを処理
            const thead = el.querySelector('thead')
            if (thead) {
              const headerRow = thead.querySelector('tr')
              if (headerRow) {
                const cells = Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent?.trim() || '')
                if (cells.length > 0) {
                  rows.push({ isHeader: true, cells })
                }
              }
            }

            // tbodyを処理
            const tbody = el.querySelector('tbody')
            if (tbody) {
              Array.from(tbody.querySelectorAll('tr')).forEach((tr) => {
                const cells = Array.from(tr.querySelectorAll('td')).map(td => td.textContent?.trim() || '')
                if (cells.length > 0) {
                  rows.push({ isHeader: false, cells })
                }
              })
            }

            // theadがない場合、直接trを処理
            if (!thead && !tbody) {
              Array.from(el.querySelectorAll('tr')).forEach((tr, index) => {
                const thCells = tr.querySelectorAll('th')
                const tdCells = tr.querySelectorAll('td')

                if (thCells.length > 0) {
                  const cells = Array.from(thCells).map(th => th.textContent?.trim() || '')
                  rows.push({ isHeader: true, cells })
                } else if (tdCells.length > 0) {
                  const cells = Array.from(tdCells).map(td => td.textContent?.trim() || '')
                  rows.push({ isHeader: index === 0, cells })
                }
              })
            }

            if (rows.length > 0) {
              return [{
                _type: 'tableBlock',
                _key: generateKey(),
                rows: rows.map(row => ({
                  _type: 'tableRow',
                  _key: generateKey(),
                  isHeader: row.isHeader,
                  cells: row.cells,
                })),
              }]
            }
            return []
          }

          // コードブロック（pre > code）
          if (tagName === 'pre') {
            const codeEl = el.querySelector('code')
            const codeText = codeEl?.textContent || el.textContent || ''

            // コードブロックは通常の段落として変換（Sanityのblockとして）
            // コードの各行を1つのブロックにまとめる
            if (codeText.trim()) {
              return [{
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                children: [{
                  _type: 'span',
                  _key: generateKey(),
                  text: codeText.trim(),
                  marks: ['code'],
                }],
                markDefs: [],
              }]
            }
            return []
          }

          // 水平線（hr）
          // Sanityの標準ブロックでは水平線がないため、
          // 区切り線として空行を表す段落に変換
          if (tagName === 'hr') {
            return [{
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [{
                _type: 'span',
                _key: generateKey(),
                text: '───────────────────',
                marks: [],
              }],
              markDefs: [],
            }]
          }

          // その他の要素は子要素を再帰処理
          return Array.from(el.childNodes).flatMap(processNode)
        }

        return []
      }

      // body配下の全ノードを処理
      Array.from(doc.body.childNodes).forEach((node) => {
        const processed = processNode(node)

        // spanがトップレベルにある場合、blockでラップする
        processed.forEach((item) => {
          if (item._type === 'span') {
            // spanをblockでラップ
            blocks.push({
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [item],
              markDefs: [],
            })
          } else {
            blocks.push(item)
          }
        })
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
  }, [markdown, onChange, value])

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
              対応記法: ## H2、### H3、#### H4、**太字**、*斜体*、`コード`、箇条書き（-）、番号リスト（1.）、テーブル、引用（&gt;）、水平線（---）
            </Text>
            <TextArea
              rows={10}
              value={markdown}
              onChange={(e) => setMarkdown(e.currentTarget.value)}
              placeholder="## 見出し&#10;&#10;テキスト内容...&#10;&#10;- リスト項目1&#10;- リスト項目2&#10;&#10;| 列1 | 列2 |&#10;|-----|-----|&#10;| A   | B   |"
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
