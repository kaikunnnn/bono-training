# ロードマップグラデーション定義

**作成日**: 2026-04-01
**目的**: 各ロードマップのグラデーション定義場所と値を一元管理

---

## 📍 定義場所一覧

| ファイル | 用途 | 変数名 |
|----------|------|--------|
| `src/types/sanity-roadmap.ts` | Hero用（詳細ページ上部） | `GRADIENT_PRESETS` |
| `src/components/roadmap/RoadmapCardV2.tsx` | Card用（一覧カード） | `GRADIENTS` |

---

## 🎨 ロードマップ別グラデーション定義

### 1. UIUXデザイナー転職 (`career-change`)

**Sanity slug**: `uiux-career-change`

| 場所 | 定義 |
|------|------|
| **sanity-roadmap.ts:20** | `linear-gradient(0deg, #412731 0%, #382D28 16%, #22202B 100%)` |
| **RoadmapCardV2.tsx:48-52** | `from: '#412731', mid: '#382D28', to: '#22202B'` |

```
色: #412731 (0%) → #382D28 (16%) → #22202B (100%)
方向: 0deg（下から上）
オーバーレイ: なし
```

---

### 2. UIデザイン入門 (`ui-beginner`)

**Sanity slug**: `ui-design-beginner`

| 場所 | 定義 |
|------|------|
| **sanity-roadmap.ts:21** | `linear-gradient(0deg, rgba(0,0,0,0.38), rgba(0,0,0,0.38)), linear-gradient(0deg, #BB5F70 0%, #494717 100%)` |
| **RoadmapCardV2.tsx:53-57** | `from: '#BB5F70', to: '#494717', overlay: 'rgba(0, 0, 0, 0.38)'` |

```
色: #BB5F70 (0%) → #494717 (100%)
方向: 0deg（下から上）
オーバーレイ: rgba(0, 0, 0, 0.38)
```

---

### 3. UIビジュアル入門 (`ui-visual`)

**Sanity slug**: `ui-visual`

| 場所 | 定義 |
|------|------|
| **sanity-roadmap.ts:22** | `linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(0deg, #304750 0%, #5D5B65 100%)` |
| **RoadmapCardV2.tsx:58-62** | `from: '#304750', to: '#5D5B65', overlay: 'rgba(0, 0, 0, 0.2)'` |

```
色: #304750 (0%) → #5D5B65 (100%)
方向: 0deg（下から上）
オーバーレイ: rgba(0, 0, 0, 0.2)
```

---

### 4. 情報設計基礎 (`info-arch`)

**Sanity slug**: `information-architecture`

| 場所 | 定義 |
|------|------|
| **sanity-roadmap.ts:23** | `linear-gradient(0deg, rgba(0,0,0,0.3), rgba(0,0,0,0.3)), linear-gradient(0deg, #8D7746 0%, #214234 100%)` |
| **RoadmapCardV2.tsx:63-67** | `from: '#8D7746', to: '#214234', overlay: 'rgba(0, 0, 0, 0.3)'` |

```
色: #8D7746 (0%) → #214234 (100%)
方向: 0deg（下から上）
オーバーレイ: rgba(0, 0, 0, 0.3)
```

---

### 5. UXデザイン基礎 (`ux-design`)

**Sanity slug**: `ux-design`

| 場所 | 定義 |
|------|------|
| **sanity-roadmap.ts:24** | `linear-gradient(0deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4)), linear-gradient(0deg, #2F3F6D 0%, #764749 46%, #E27979 88%, #F1BAC1 100%)` |
| **RoadmapCardV2.tsx:68-74** | `from: '#2F3F6D', to: '#F1BAC1', overlay: 'rgba(0, 0, 0, 0.4)', customGradient: 'linear-gradient(0deg, #2F3F6D 0%, #764749 46%, #E27979 88%, #F1BAC1 100%)'` |

```
色: #2F3F6D (0%) → #764749 (46%) → #E27979 (88%) → #F1BAC1 (100%)
方向: 0deg（下から上）
オーバーレイ: rgba(0, 0, 0, 0.4)
※ 4点グラデーション（customGradient使用）
```

---

## 🔧 グラデーション方向について

- **0deg**: 下から上（正しい）
- **90deg**: 左から右（間違い）

全てのグラデーションは `0deg`（下から上）で統一する。

---

## 📝 修正時のチェックリスト

グラデーションを修正する場合、以下の両方を更新すること：

- [ ] `src/types/sanity-roadmap.ts` の `GRADIENT_PRESETS`
- [ ] `src/components/roadmap/RoadmapCardV2.tsx` の `GRADIENTS`

---

## 🔍 確認用ページ

| ページ | パス | 内容 |
|--------|------|------|
| Gradient Preview | `/dev/roadmap-gradient-preview` | Hero/Card両方のグラデーション比較 |
| Roadmap Card | `/dev/roadmap-card` | カードコンポーネント単体確認 |
| Roadmap Preview | `/dev/roadmap-preview` | 詳細ページ全体プレビュー |
