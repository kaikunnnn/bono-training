# Vimeo Player API 調査結果

**調査日**: 2026-01-13

---

## 調査の目的

カスタムUIが正常に動作しない問題の原因を特定する。

- 再生ボタンが再生中も消えない
- プログレスバーが動かない（0:00のまま）
- `timeupdate`イベントが発火しない
- `play`イベントが発火しない

---

## 調査結果

### 1. イベント名の問題

**出典**: [GitHub Issue #262](https://github.com/vimeo/player.js/issues/262)

古いAPIバージョン（api: 1, 2）では、イベント名が異なる：

| 新API (v3) | 旧API (v1, v2) |
|------------|----------------|
| `timeupdate` | `playProgress` |
| `progress` | `loadProgress` |

**解決策**: `api: 1`パラメータを削除し、最新API（v3）を使用する。

---

### 2. controls:false の制限

**出典**: [GitHub Issue #598](https://github.com/vimeo/player.js/issues/598)

**重要な発見**: `controls: false`オプションは**Vimeoの有料プラン（Plus, PRO, Business）でのみ利用可能**。

ベーシックプラン（無料）の動画では：
- `controls: false`を設定しても無視される
- Vimeo標準UIが強制表示される
- `no-playbar`や`hide-controls`クラスが付与されない

**現在の実装の問題**:
```typescript
const player = new Player(containerRef.current, {
  controls: true,  // ← これが原因？
  // ...
});
```

---

### 3. カスタムUIの推奨構成

**出典**: [Vimeo Player.js GitHub](https://github.com/vimeo/player.js)

カスタムUIを実装する場合の推奨：

1. **有料プランが必要**: `controls: false`を機能させるため
2. **または**: Vimeo標準UIを非表示にせず、その上にカスタムUIをオーバーレイ
3. **background: true**オプション: 自動再生・ループ・コントロール非表示（Plus以上）

---

## 現在の問題の根本原因

### 仮説1: controls: true による競合

現在`controls: true`を設定しているため、Vimeo標準UIとカスタムUIが両方表示されている。
Vimeo標準UIがクリックイベントを横取りしている可能性。

### 仮説2: イベントリスナーの設定タイミング

プレーヤーが完全に初期化される前にイベントリスナーを設定している可能性。

### 仮説3: Vimeoプランの制限

動画所有者のVimeoプランがベーシックの場合、APIの一部機能が制限される可能性。

---

## 推奨アクション

### オプションA: Vimeo標準UIを使用（推奨）

カスタムUIを諦め、Vimeo標準UIをそのまま使用する。
- 最も安定
- 追加コストなし
- Vimeoの更新に自動追従

### オプションB: 有料プランでカスタムUI

Vimeo Plus以上にアップグレードし、`controls: false`で完全カスタムUI。
- 月額費用が発生
- 完全なカスタマイズが可能

### オプションC: ハイブリッド方式

Vimeo標準UIの上にカスタムUIをオーバーレイ（現在の方式を改善）。
- 標準UIとの競合を解決する必要あり
- イベントの取得方法を見直す

---

## 技術的な確認事項

### 現在のVimeoプラン

BONOのVimeoアカウントのプランを確認する必要がある：
- ベーシック（無料）: controls:false 不可
- Plus/PRO/Business: controls:false 可能

### イベント発火の確認

```javascript
// 両方のイベント名で試す
player.on('timeupdate', (data) => console.log('timeupdate:', data));
player.on('playProgress', (data) => console.log('playProgress:', data));
```

---

## 参考リンク

- [Vimeo Player.js GitHub](https://github.com/vimeo/player.js)
- [Issue #262: timeupdate vs playProgress](https://github.com/vimeo/player.js/issues/262)
- [Issue #598: controls:false not working](https://github.com/vimeo/player.js/issues/598)
- [Issue #548: Custom controls request](https://github.com/vimeo/player.js/issues/548)

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-13 | 初版作成 |
