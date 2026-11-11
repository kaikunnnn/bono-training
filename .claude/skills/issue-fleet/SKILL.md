---
name: issue-fleet
description: FableがIssueを設計し、実装担当をfable/opus/sonnet/humanに割り当てる。Opus/SonnetのPRはFableがレビューし、品質不足なら上位モデルへエスカレーションして再実行する。「issue-fleetで進めて」「Fableに設計させて実装割り振って」と言われた時に使用
argument-hint: [issue番号 または issue番号のリスト（スペース区切り）]
allowed-tools: Read, Bash, Workflow, TaskCreate
---

# Issue Fleet — モデル階層型の設計・実装・レビューフロー

## 概要

GitHub Issueを渡すと、以下を1回のWorkflow実行でやりきる。

1. **設計 (Fable)** — Issueを読み、技術方針を立て、実装担当を `sonnet` / `opus` / `fable` / `human` のいずれかに割り当てる
2. **実装** — 割り当てられたモデルがブランチを切り、実装し、PRを作成する
3. **レビュー (Fable)** — PRのdiffを厳しくレビューし、合否判定
4. **エスカレーション** — 不合格なら `sonnet → opus → fable` の順に担当モデルを引き上げ、再実装。fableでも不合格なら人間に回す

`human` 割り当て・エスカレーション終着点は、実装を試みず（または試みた上で）Issueにラベル付け＋コメントして停止する。エージェントは人を直接動かせないため、これが人間への引き渡し方法になる。

GitHub（Issue/PR/ラベル/コメント）を正とし、加えて実行のたびに `issue-fleet-logs/issue-{番号}.md` にも設計・実装・レビューの記録をローカルMarkdownとして残す。GitHubが落ちても・非公開の途中経過を見返したい時も、手元のログだけで経緯を追える状態にする。

## 呼び出し方

- `/issue-fleet 123`
- `/issue-fleet 123 124 125`
- 「issue-fleetで#123と#124進めて」

## 前提

- 対象リポジトリで `gh auth status` が通っていること
- Issue番号は呼び出し元がユーザーから確認済みであること（曖昧なら先にIssue一覧を見せて確認する）
- 本番影響のある破壊的変更が疑われるIssueは、設計段階で `human` に倒れる想定（プロンプト内で明示している）

## 実行手順

1. `args` の内容として渡されたIssue番号を確認する。ユーザーの発言から数値が拾えたら、実行前に「Issue #123, #124 をissue-fleetで進めます、いいですか」と一度確認する（初回実行時は特に）
2. 下記スクリプトをそのまま `Workflow` ツールの `script` パラメータに渡し、`args` に issue番号の配列を渡して実行する
3. 完了後、`results` を元にIssueごとの最終状態（合格 / エスカレーション / human行き）を表形式で報告する

## Workflowスクリプト

```javascript
export const meta = {
  name: 'issue-fleet',
  description: 'Fableが設計・アサインし、Opus/Sonnetが実装、Fableがレビューして品質不足なら上位モデルへエスカレーションする',
  phases: [
    { title: 'Design', detail: 'Fableが各Issueを設計し実装担当を割り当てる', model: 'fable' },
    { title: 'Implement', detail: '割り当てられたモデルが実装しPRを作成' },
    { title: 'Review', detail: 'Fableがレビューし、品質不足なら上位モデルへエスカレーション', model: 'fable' },
  ],
}

const DESIGN_SCHEMA = {
  type: 'object',
  properties: {
    assignee: { type: 'string', enum: ['sonnet', 'opus', 'fable', 'human'] },
    reason: { type: 'string' },
    plan: { type: 'string' },
    branchName: { type: 'string' },
  },
  required: ['assignee', 'reason', 'plan', 'branchName'],
}

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    pass: { type: 'boolean' },
    score: { type: 'number' },
    feedback: { type: 'string' },
  },
  required: ['pass', 'score', 'feedback'],
}

const TIER_ORDER = ['sonnet', 'opus', 'fable']

function nextTier(tier) {
  const i = TIER_ORDER.indexOf(tier)
  if (i === -1 || i === TIER_ORDER.length - 1) return null
  return TIER_ORDER[i + 1]
}

const LOG_DIR = 'issue-fleet-logs'

// Fable 向けの共通指示（設計・レビュー用。2026-11-10 公式プロンプトガイドに基づき追加）
const FABLE_GUIDE = `
作業の進め方:
- 頼まれた判断を最後まで終えてから返してください。残作業を並べて止まったり、続けるかを尋ねたりしないでください。
- コマンドの失敗やタイムアウトは、まず原因を調べて自分で乗り越えてください。ただし本番環境・課金・データ削除に関わる操作はしないでください。
- 結果は、作業を見ていない人が読んでもわかるように書いてください。結論を最初に置き、作業中に作った呼び名や略語は使わないでください。`

const results = await pipeline(
  args.issues,

  // Stage 1: Design
  async (issueNum) => {
    const logPath = `${LOG_DIR}/issue-${issueNum}.md`
    const design = await agent(
      `GitHub issue #${issueNum} を \`gh issue view ${issueNum} --json title,body,labels,url\` で読み込み、技術設計を行ってください。
実装の難易度・リスクを踏まえて、実装担当を sonnet / opus / fable / human のいずれかに割り当ててください。
- sonnet: 定型的・低リスクな変更
- opus: 設計判断が要る中〜高難度の変更
- fable: 極めて高難度、または過去に他モデルが失敗した変更
- human: 仕様が曖昧、破壊的変更、本番インフラに触れるなど、モデルに任せるべきでないもの
ブランチ名も提案してください（例: fix/issue-${issueNum}-短い説明）。

判断が終わったら、リポジトリ直下に \`${logPath}\` を新規作成し（親ディレクトリが無ければ作る）、以下を書き込んでください。このログファイルはgit管理外でよく、実装のgit commitには含めないでください。

\`\`\`markdown
# Issue #${issueNum} — issue-fleet ログ

## Design (Fable)
- 実施日時: \`date\`コマンドの出力
- assignee: <割り当て結果>
- reason: <理由>
- plan: <設計方針>
- branchName: <ブランチ名>
\`\`\`
${FABLE_GUIDE}`,
      { phase: 'Design', model: 'fable', schema: DESIGN_SCHEMA, label: `design:#${issueNum}` }
    )
    return { issueNum, design, logPath }
  },

  // Stage 2: Implement -> Review -> Escalate
  async ({ issueNum, design, logPath }) => {
    if (design.assignee === 'human') {
      await agent(
        `gh issue edit ${issueNum} --add-label "needs-human" && gh issue comment ${issueNum} --body "設計担当(Fable)の判断: 人間対応が必要。理由: ${design.reason}"
その後、\`${logPath}\` の末尾に以下を追記してください。

## Handoff to Human
- 実施日時: \`date\`コマンドの出力
- 理由: ${design.reason}
- 設計段階で人間対応と判定されたため、実装は行っていません`,
        { phase: 'Implement', label: `handoff-human:#${issueNum}` }
      )
      return { issueNum, design, status: 'human', prUrl: null }
    }

    let tier = design.assignee
    let attempt = 0
    let prUrl = null
    let lastReview = null

    while (true) {
      attempt++
      const implResult = await agent(
        `GitHub issue #${issueNum} を実装してください。
設計方針: ${design.plan}
ブランチ名: ${design.branchName}-attempt${attempt}
手順:
1. git checkout -b <ブランチ名>
2. 設計方針に沿って実装
3. テストがあれば実行して確認
4. git commit（\`${logPath}\` は追加しない。ログはgit管理外）
5. git push -u origin <ブランチ名>
6. gh pr create --title "..." --body "Closes #${issueNum}\n\n設計: ${design.plan}" で PR作成
7. 作成したPRのURLを返す

完了したら \`${logPath}\` の末尾に以下を追記してください。

## Implement attempt ${attempt} (${tier})
- 実施日時: \`date\`コマンドの出力
- ブランチ: <ブランチ名>
- PR: <PR URL>
- 実施内容の要約: <2〜3行>`,
        {
          phase: 'Implement',
          model: tier,
          isolation: 'worktree',
          label: `implement:#${issueNum}(${tier})`,
        }
      )

      const prMatch = String(implResult).match(/https:\/\/github\.com\/\S+\/pull\/\d+/)
      prUrl = prMatch ? prMatch[0] : prUrl

      const review = await agent(
        `PR ${prUrl || '(URL不明。実装結果: ' + implResult + ')'} を \`gh pr diff\` でレビューしてください。
Issue #${issueNum} の要件を満たしているか、コード品質・テスト有無・副作用を厳しくチェックし、pass/failを判定してください。

判定が終わったら \`${logPath}\` の末尾に以下を追記してください。

## Review attempt ${attempt} (${tier}) — Fable
- 実施日時: \`date\`コマンドの出力
- pass: <true/false>
- score: <点数>
- feedback: <フィードバック全文>
${FABLE_GUIDE}`,
        { phase: 'Review', model: 'fable', schema: REVIEW_SCHEMA, label: `review:#${issueNum}(${tier})` }
      )
      lastReview = review

      if (review.pass) {
        return { issueNum, design, status: 'passed', tier, attempt, prUrl, review }
      }

      const next = nextTier(tier)
      if (!next) {
        await agent(
          `gh issue edit ${issueNum} --add-label "needs-human" && gh issue comment ${issueNum} --body "自動実装フロー（fableまで到達）で品質基準を満たせませんでした。最終レビュー: ${review.feedback}\nPR: ${prUrl || 'なし'}"
その後 \`${logPath}\` の末尾に以下を追記してください。

## Escalated to Human
- 実施日時: \`date\`コマンドの出力
- 理由: fableまでエスカレーションしたが品質基準を満たせなかった
- 最終PR: ${prUrl || 'なし'}`,
          { phase: 'Review', label: `escalate-human:#${issueNum}` }
        )
        return { issueNum, design, status: 'escalated_to_human', tier, attempt, prUrl, review: lastReview }
      }
      log(`#${issueNum}: ${tier}の実装がレビュー不合格（score: ${review.score}）。${next}へエスカレーション`)
      tier = next
    }
  }
)

return results
```

## 完了後の報告フォーマット

```
## Issue Fleet 実行結果

| Issue | 最終担当 | 状態 | PR |
|---|---|---|---|
| #123 | sonnet | ✅合格 | <PR URL> |
| #124 | opus（sonnetから昇格） | ✅合格 | <PR URL> |
| #125 | human | 🏷️ needs-human ラベル付与 | - |
| #126 | fable（sonnet→opus→fableで全滅） | 🏷️ needs-human ラベル付与 | <最後のPR URL> |
```

## 注意

- `isolation: 'worktree'` を使うため、実装フェーズはディスクと時間を消費する。並列度が高いIssueバッチでは特に
- `human` 判定・エスカレーション終着はIssueへの実コメント・ラベル付けを伴う（`gh issue comment` / `gh issue edit`）。テスト実行時は対象リポジトリ・Issue番号を実データで叩くことになるので、練習用のダミーIssueで一度試すことを推奨
- モデル名は `fable` / `opus` / `sonnet` を使う（その時点の最新版に解決される。版番号はここに書かない）
- 既存の `needs-human` ラベルがリポジトリに無い場合は `gh label create needs-human` が先に必要
- ローカルログは `issue-fleet-logs/issue-{番号}.md` に、設計→実装（試行ごと）→レビュー→（human引き渡し/エスカレーション）の順で追記される。`.gitignore` に `issue-fleet-logs` を追加済みなので、実装コミット・PRの差分には含まれない
- ログの正はあくまでGitHub（Issue本体・PRのdiff・コメント履歴）。ローカルログは経緯を素早く追うための補助であり、内容が食い違った場合はGitHub側を信じる
