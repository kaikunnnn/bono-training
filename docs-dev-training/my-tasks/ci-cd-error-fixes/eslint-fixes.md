# ESLint修正計画チケット

## 📊 問題概要

**92個のエラー + 10個の警告**が発生中

```
✖ 102 problems (92 errors, 10 warnings)
```

## 🔍 エラー分類と優先度

### 🔴 Critical（最優先修正）- 3件
#### React Hooks Rules Violations
動作に直接影響する可能性が高い重大エラー

```typescript
// src/components/subscription/ContentGuard.tsx:77
React Hook "useEffect" is called conditionally  // react-hooks/rules-of-hooks

// src/pages/Training/TaskDetailPage.tsx:65  
React Hook "useTaskDetail" is called conditionally  // react-hooks/rules-of-hooks

// src/pages/TrainingDetail.tsx:37,40
React Hook "useTrainingDetail" and "useEffect" called conditionally  // react-hooks/rules-of-hooks
```

### 🟡 High（重要修正）- 58件  
#### TypeScript Any Type Usage
型安全性の問題、段階的に修正が必要

**主要ファイル:**
- `src/components/training/ContentSection.tsx` (6件)
- `src/components/training/MarkdownRenderer.tsx` (8件) 
- `src/components/training/MdxPreview.tsx` (8件)
- `src/services/auth.ts` (6件)
- `src/services/training/` (8件)
- `supabase/functions/` (15件)

### 🟢 Medium（標準修正）- 21件
#### Missing Dependencies & Import Issues

```typescript
// Missing useEffect dependencies (5件)
React Hook useEffect has a missing dependency  // react-hooks/exhaustive-deps

// Require imports (2件)  
A `require()` style import is forbidden  // @typescript-eslint/no-require-imports

// Empty interfaces (2件)
An interface declaring no members is equivalent to its supertype  // @typescript-eslint/no-empty-object-type
```

### 🟢 Low（品質向上）- 10件
#### Fast Refresh Warnings
開発体験向上のための警告（動作には影響なし）

```typescript
Fast refresh only works when a file only exports components  // react-refresh/only-export-components
```

## 📋 段階的修正計画

### Phase 1: Critical Fixes（必須）🔴
**推定工数**: 1日

#### 1.1 React Hooks条件付き呼び出し修正

**ファイル**: `src/components/subscription/ContentGuard.tsx`
```typescript
// 修正前
if (someCondition) {
  useEffect(() => {
    // 処理
  }, []);
}

// 修正後  
useEffect(() => {
  if (someCondition) {
    // 処理
  }
}, []);
```

**ファイル**: `src/pages/Training/TaskDetailPage.tsx`
```typescript
// 修正前
if (!trainingSlug || !taskSlug) {
  return <div>Error</div>;
}
const { data } = useTaskDetail(trainingSlug, taskSlug);

// 修正後
const { data } = useTaskDetail(trainingSlug || '', taskSlug || '');
if (!trainingSlug || !taskSlug) {
  return <div>Error</div>;
}
```

**ファイル**: `src/pages/TrainingDetail.tsx`
```typescript
// 同様の修正パターンを適用
```

### Phase 2: Type Safety Improvements（重要）🟡
**推定工数**: 2-3日

#### 2.1 Markdownレンダリング系の型修正
**影響ファイル**: 
- `ContentSection.tsx`
- `MarkdownRenderer.tsx`
- `MdxPreview.tsx`

```typescript
// 修正前
const processNode = (node: any) => {
  // 処理
}

// 修正後
interface ReactMarkdownNode {
  type: string;
  children?: ReactMarkdownNode[];
  value?: string;
  // ... 必要なプロパティ定義
}

const processNode = (node: ReactMarkdownNode) => {
  // 処理
}
```

#### 2.2 サービス層の型修正
**影響ファイル**:
- `src/services/auth.ts`
- `src/services/training/`

```typescript
// 修正前
const handleError = (error: any) => {
  console.error(error);
}

// 修正後
const handleError = (error: Error | unknown) => {
  console.error(error instanceof Error ? error.message : error);
}
```

#### 2.3 Edge Functions型修正
**影響ファイル**: `supabase/functions/`

```typescript
// 修正前
function createResponse(data: any) {
  return new Response(JSON.stringify(data));
}

// 修正後  
interface ResponseData {
  success: boolean;
  data?: unknown;
  error?: string;
}

function createResponse(data: ResponseData) {
  return new Response(JSON.stringify(data));
}
```

### Phase 3: Code Quality（標準）🟢
**推定工数**: 1日

#### 3.1 useEffect依存配列修正
```typescript
// 修正前
useEffect(() => {
  fetchData();
}, []); // Missing dependency: 'fetchData'

// 修正後
useEffect(() => {
  fetchData();
}, [fetchData]);

// または
const fetchData = useCallback(() => {
  // 処理
}, [/* 依存関係 */]);
```

#### 3.2 Import方式統一
```typescript
// 修正前
const plugin = require('some-plugin');

// 修正後
import plugin from 'some-plugin';
```

#### 3.3 空インターフェース修正
```typescript
// 修正前
interface EmptyInterface {}

// 修正後
// 不要な場合は削除
// または
interface EmptyInterface {
  [key: string]: unknown;
}
```

### Phase 4: Developer Experience（品質向上）🟢
**推定工数**: 0.5日

#### 4.1 Fast Refresh警告解消
```typescript
// 修正前 - buttonコンポーネントファイル
export const buttonVariants = cva(/* ... */);
export default Button;

// 修正後 - 定数を別ファイルに分離
// button-variants.ts
export const buttonVariants = cva(/* ... */);

// button.tsx  
import { buttonVariants } from './button-variants';
export default Button;
```

## 🧪 修正フロー

### 各フェーズの進行手順
1. **エラー再現確認** - `npm run lint`で対象エラーを確認
2. **修正実装** - 上記の修正パターンを適用
3. **ローカルテスト** - `npm run lint`でエラー解消確認  
4. **動作テスト** - `npm run dev`で動作確認
5. **コミット** - 修正内容を適切にコミット

### 修正時の基本方針
- **段階的修正**: 一度に全て修正せず、フェーズ毎に進行
- **動作確認必須**: 各修正後に`/training`ページの動作確認
- **型安全性重視**: `any`を使わず、適切な型定義を作成
- **既存動作維持**: 機能の動作は変更しない

## 📂 修正対象ファイル一覧

### Critical修正対象
- `src/components/subscription/ContentGuard.tsx`
- `src/pages/Training/TaskDetailPage.tsx`  
- `src/pages/TrainingDetail.tsx`

### High修正対象（一部）
- `src/components/training/ContentSection.tsx`
- `src/components/training/MarkdownRenderer.tsx`
- `src/components/training/MdxPreview.tsx`
- `src/services/auth.ts`
- `src/services/training/error-handlers.ts`
- `supabase/functions/get-training-list/index.ts`

## 🎯 修正完了の判定基準

### 各フェーズの完了条件
- **Phase 1完了**: React Hooks関連エラー 0件
- **Phase 2完了**: `@typescript-eslint/no-explicit-any`エラー < 10件
- **Phase 3完了**: 警告を除く全エラー 0件  
- **Phase 4完了**: 全警告 0件

### 最終目標
```bash
npm run lint
# 期待される結果
✨ All files pass linting! ✨
```

## ⚠️ 注意事項

### 修正時の注意点
- **バックアップ**: 大きな変更前はブランチを作成
- **テスト重視**: 各修正後に`/training`ページの動作確認
- **段階的コミット**: 修正内容毎にコミットを分ける
- **ペアレビュー**: 大きな型変更は他の開発者と相談

### 影響確認が必要な箇所
- `/training`ページの表示・動作
- Edge Functionsの動作（データ取得）
- 認証・サブスクリプション機能

---
**優先度**: 🟡 Medium（ただし段階的に対応）  
**推定工数**: 2-3日  
**担当者**: きかく  
**ステータス**: 🟡 対応待ち

**依存関係**: Jest環境修正後に実施