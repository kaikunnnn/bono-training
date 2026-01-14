# アドブロッカー検出時のVimeo標準UIフォールバック実装計画

**作成日**: 2026-01-13
**ステータス**: 実装中

---

## Step 0 検証結果 (2026-01-13)

| テスト項目 | 結果 |
|------------|------|
| 標準Vimeo iframe再生（アドブロックあり） | OK |
| カスタムUI再生（アドブロックあり） | 再生可能だがUIが壊れている |

**結論**: 標準Vimeo iframeはアドブロッカー環境でも正常動作。フォールバック方針で進行可能。

---

## 目的

アドブロッカーが有効な環境でVimeo Player APIが正常に動作しない場合、
Vimeoの標準埋め込みプレーヤー（iframe）に自動的に切り替える。

---

## 現状の問題

### 問題1: カスタムUIが正常に動作しない
- 再生ボタンが再生中も消えない
- プログレスバーが動かない（0:00のまま）
- `timeupdate`イベントがアドブロッカーによってブロックされている

### 問題2: 現在の検出ロジックの欠陥
- 現在: Vimeo Player APIの初期化成功 = アドブロックなし と判断
- 実際: APIは初期化できるが、イベント（timeupdate等）がブロックされる
- 結果: アドブロックありでもカスタムUI（壊れた状態）が表示される

---

## 技術調査

### Vimeo埋め込み方式の比較

| 方式 | 説明 | アドブロック耐性 |
|------|------|------------------|
| Vimeo Player API | JavaScriptでプレーヤーを制御 | 低（イベントがブロックされる） |
| iframe埋め込み | `<iframe src="player.vimeo.com/video/ID">` | 高（Vimeo側で全て処理） |

### アドブロッカーがブロックするもの
1. `arclight.vimeo.com` - 統計・分析
2. `lensflare.vimeo.com` - 広告関連
3. `fresnel.vimeo.com` - トラッキング
4. Player APIの一部イベント通信

### ブロックされないもの
1. `player.vimeo.com/video/ID` - 動画本体のiframe
2. 動画ストリーム自体

---

## 実装方針

### 方針: 再生開始後のイベント検証

**理由**:
- APIの初期化成功だけではアドブロッカーを検出できない
- 実際に再生してイベントが来るかどうかで判断する必要がある

**フロー**:
```
1. カスタムUIで初期表示
2. ユーザーが再生ボタンをクリック
3. play()を呼び出し
4. 2秒以内にtimeupdateイベントが来るか監視
   - 来た → カスタムUIを継続
   - 来ない → アドブロッカー検出、標準UIにフォールバック
```

---

## 実装ステップ

### Step 1: VimeoFallbackPlayer の確認・修正

**ファイル**: `src/components/video/VimeoFallbackPlayer.tsx`

**確認事項**:
- [ ] iframe埋め込みが正しく実装されているか
- [ ] レスポンシブ対応しているか
- [ ] 必要なVimeoパラメータが設定されているか

**Vimeo iframe パラメータ**:
```
?title=0        - タイトル非表示
&byline=0       - 投稿者名非表示
&portrait=0     - アバター非表示
&pip=1          - PiP有効
&autoplay=0     - 自動再生無効
```

### Step 2: アドブロッカー検出ロジックの実装

**ファイル**: `src/components/video/hooks/useVimeoPlayer.ts`

**実装内容**:
1. `hasReceivedTimeUpdate` フラグを追加
2. `play`イベント発火後、2秒のタイムアウトを設定
3. タイムアウト内に`timeupdate`が来なければ `isAdBlocked: true`
4. `timeupdate`が来たらタイムアウトをクリア

**コード変更箇所**:
```typescript
// 追加する変数
let hasReceivedTimeUpdate = false;
let eventCheckTimeout: NodeJS.Timeout | null = null;

// playイベントハンドラに追加
player.on('play', () => {
  // 再生開始後2秒以内にtimeupdateが来なければアドブロッカー
  if (!hasReceivedTimeUpdate) {
    eventCheckTimeout = setTimeout(() => {
      if (!hasReceivedTimeUpdate) {
        setState(prev => ({ ...prev, isAdBlocked: true }));
      }
    }, 2000);
  }
});

// timeupdateイベントハンドラに追加
player.on('timeupdate', (data) => {
  if (!hasReceivedTimeUpdate) {
    hasReceivedTimeUpdate = true;
    if (eventCheckTimeout) clearTimeout(eventCheckTimeout);
  }
  // ... 既存の処理
});
```

### Step 3: CustomVimeoPlayer のフォールバック表示

**ファイル**: `src/components/video/CustomVimeoPlayer.tsx`

**確認事項**:
- [ ] `state.isAdBlocked === true` 時にVimeoFallbackPlayerを表示
- [ ] 警告メッセージが適切か
- [ ] フォールバック時の見た目が問題ないか

**現在の実装（確認済み）**:
```typescript
if (state.isAdBlocked) {
  return (
    <div className={className}>
      <div className="bg-yellow-900/20 ...">
        <AlertTriangle />
        <span>広告ブロッカーが検出されました。標準プレーヤーで再生します。</span>
      </div>
      <VimeoFallbackPlayer vimeoId={vimeoId} />
    </div>
  );
}
```

### Step 4: クリーンアップ処理の確認

**確認事項**:
- [ ] タイムアウトがコンポーネントアンマウント時にクリアされるか
- [ ] メモリリークがないか

---

## テスト計画

### テスト1: アドブロッカーなし環境

**手順**:
1. Cursor Simple Browserで動画ページを開く
2. 再生ボタンをクリック
3. コンソールで`[VimeoPlayer] First timeupdate received`を確認
4. カスタムUIが継続表示されることを確認
5. プログレスバーが動くことを確認

**期待結果**: カスタムUIで正常に再生

### テスト2: アドブロッカーあり環境

**手順**:
1. アドブロッカー有効なブラウザで動画ページを開く
2. 再生ボタンをクリック
3. 2秒待機
4. 警告バナーが表示されることを確認
5. Vimeo標準UIに切り替わることを確認
6. 動画が再生できることを確認

**期待結果**: 警告 + Vimeo標準UIで再生可能

### テスト3: 切り替え後の動作確認

**手順**:
1. フォールバック後、Vimeo標準UIで操作
2. 再生/一時停止が動作するか
3. シークが動作するか
4. フルスクリーンが動作するか

**期待結果**: 全ての基本操作が可能

---

## リスクと対策

### リスク1: 2秒では短すぎる可能性
- **対策**: 最初は2秒で試し、必要に応じて3秒に調整

### リスク2: ネットワーク遅延でtimeupdateが遅れる
- **対策**: タイムアウトを長めに設定（2秒は十分な余裕）

### リスク3: フォールバック時に再生位置がリセットされる
- **対策**: 現在の再生位置を保存し、標準プレーヤーに渡す（将来の改善）

---

## 実装順序チェックリスト

- [ ] Step 1: VimeoFallbackPlayer.tsx を確認・修正
- [ ] Step 2: useVimeoPlayer.ts にイベント検証ロジックを追加
- [ ] Step 3: CustomVimeoPlayer.tsx のフォールバック表示を確認
- [ ] Step 4: クリーンアップ処理を確認
- [ ] テスト1: アドブロッカーなし環境でテスト
- [ ] テスト2: アドブロッカーあり環境でテスト
- [ ] テスト3: フォールバック後の動作確認

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-13 | 初版作成 |
