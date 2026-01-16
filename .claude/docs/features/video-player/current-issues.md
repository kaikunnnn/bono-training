# 動画プレイヤー 現在の問題点

**作成日**: 2026-01-13

---

## 問題1: Vimeo標準UIとカスタムUIの重複

### 症状
- Vimeoの標準コントロール（再生ボタン、シークバー等）が表示される
- その上にカスタムUIも重ねて表示される
- 2つのUIが競合し、操作が混乱する

### 原因
`useVimeoPlayer.ts:72` で `controls: true` が設定されている

```typescript
const player = new Player(containerRef.current, {
  id: parseInt(extractedId, 10),
  controls: true,  // ← これが原因
  responsive: true,
  // ...
});
```

### 影響
- UIが二重に表示され見た目が悪い
- クリックイベントがVimeo標準UIに奪われる

---

## 問題2: 再生ボタンクリック後もUIが表示されたまま

### 症状
- 中央の再生ボタンをクリックして再生開始
- 再生中もカスタムUIが表示されたまま消えない

### 原因
`CustomVimeoPlayer.tsx` のコントロール非表示ロジックに問題がある

```typescript
// マウス移動時にコントロールを表示
const handleMouseMove = useCallback(() => {
  setShowControls(true);
  // ...
  if (state.isPlaying) {
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  }
}, [state.isPlaying, controlsTimeout]);
```

- `togglePlay()` を呼んだ時点では `state.isPlaying` がまだ `false`
- 状態更新は非同期なので、タイムアウト設定がスキップされる

### 影響
- 再生中もUIが常に表示され、動画視聴の邪魔になる

---

## 問題3: シークバークリックが効かない

### 症状
- プログレスバー（シークバー）をクリックしても動画がその位置にジャンプしない
- または反応が不安定

### 原因
1. **Vimeo iframe がイベントを吸収**
   - iframeが上に配置されており、カスタムUIへのクリックが届かない

2. **pointer-events の設定不足**
   - カスタムUIとiframeの間でポインターイベントの制御ができていない

### 影響
- ユーザーが任意の位置にシークできない
- 再生体験が大きく損なわれる

---

## 問題4: 操作後にUIが自動非表示にならない

### 症状
- 音量変更、再生速度変更などの操作後
- UIがそのまま表示され続ける

### 原因
- 各操作のコールバック内でタイマーリセットが行われていない
- `handleMouseMove` でのみタイマー設定される

### 影響
- 細かい操作後にUIが残り、視聴体験を阻害

---

## 技術的背景

### Vimeo Player SDK の制限

Vimeo Player SDK では `controls: false` を設定できるが、以下の制限がある：

1. **Vimeo Pro/Business アカウントが必要な場合がある**
2. **一部の動画では標準UIを完全に非表示にできない**

参考: https://developer.vimeo.com/player/sdk/embed

### iframe とカスタムUI の関係

```
┌─────────────────────────────────┐
│  CustomVimeoPlayer (relative)   │
│  ┌───────────────────────────┐  │
│  │  Vimeo iframe (containerRef) │  │ ← クリックイベントを吸収
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  VideoControls (absolute)    │  │ ← クリックが届かない
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

iframeはクリックイベントを透過しないため、カスタムUIへのクリックが届かない。
