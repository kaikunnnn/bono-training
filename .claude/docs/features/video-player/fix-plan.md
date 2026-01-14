# 動画プレイヤー 修正計画

**作成日**: 2026-01-13
**ステータス**: 🔧 実装中

---

## Phase 1: Vimeo標準UI非表示化

### 目的
Vimeoの標準コントロールを非表示にし、カスタムUIのみ表示する

### 修正箇所
`src/components/video/hooks/useVimeoPlayer.ts`

### 修正内容
```typescript
const player = new Player(containerRef.current, {
  id: parseInt(extractedId, 10),
  controls: false,  // true → false に変更
  responsive: true,
  // ...
});
```

### 注意点
- Vimeoの契約プランによっては完全非表示にできない可能性
- 動作確認して問題があれば別のアプローチを検討

### ステータス
✅ 完了

---

## Phase 2: ポインターイベント修正

### 目的
カスタムUIへのクリックイベントが正しく届くようにする

### 修正箇所
`src/components/video/CustomVimeoPlayer.tsx`

### 修正内容

1. **動画コンテナに pointer-events: none を設定**
   - iframeがクリックを吸収しないようにする
   - ただし、再生中の動画クリック（一時停止）は機能させる

2. **カスタムUI要素に pointer-events: auto を設定**
   - コントロールバー、ボタン等はクリック可能に

```tsx
{/* Vimeoプレーヤーコンテナ */}
<div
  ref={containerRef}
  className="w-full aspect-video pointer-events-none"  // 追加
/>

{/* コントロールバー */}
<div className="... pointer-events-auto">  // 追加
  <VideoControls ... />
</div>
```

3. **クリック領域の分離**
   - 動画エリア全体をクリックで再生/一時停止
   - コントロール部分は個別のボタンで操作

### ステータス
✅ 完了

---

## Phase 3: コントロール表示/非表示ロジック修正

### 目的
- 再生開始後、UIが自動的に非表示になるようにする
- 操作後もタイマーをリセットして適切に非表示にする

### 修正箇所
`src/components/video/CustomVimeoPlayer.tsx`

### 修正内容

1. **再生状態変化を監視してタイマー設定**

```typescript
// 再生状態が変わったらタイマーをリセット
useEffect(() => {
  if (state.isPlaying) {
    // 再生中は3秒後に非表示
    resetControlsTimer();
  } else {
    // 一時停止中は常に表示
    setShowControls(true);
    clearControlsTimer();
  }
}, [state.isPlaying]);
```

2. **タイマー管理を共通関数に**

```typescript
const resetControlsTimer = useCallback(() => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
  }
  setShowControls(true);

  if (state.isPlaying) {
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  }
}, [state.isPlaying, controlsTimeout]);
```

3. **操作時にタイマーリセット**
   - `togglePlay`, `seek`, `setVolume` 等の操作後にタイマーリセット

### ステータス
✅ 完了

---

## Phase 4: 動作確認・微調整

### 目的
全体的な動作確認と細かい調整

### 確認項目

- [ ] 再生ボタンクリックで再生開始、UIが3秒後に非表示
- [ ] 一時停止でUIが表示される
- [ ] シークバークリックで該当位置にジャンプ
- [ ] 音量スライダーが機能する
- [ ] 再生速度変更が機能する
- [ ] フルスクリーンが機能する
- [ ] キーボードショートカットが機能する
- [ ] マウスホバーでUIが表示される
- [ ] マウスアウトでUIが非表示になる（再生中のみ）

### ステータス
⏳ 動作確認待ち

---

## 実装順序

```
Phase 1 → Phase 2 → Phase 3 → Phase 4
   ↓         ↓         ↓         ↓
 標準UI    クリック   UI表示    最終
 非表示    イベント   ロジック  確認
```

各フェーズ完了後に動作確認を行い、問題があれば修正してから次へ進む。
