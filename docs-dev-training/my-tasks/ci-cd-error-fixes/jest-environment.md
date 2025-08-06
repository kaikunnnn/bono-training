# Jest環境修正チケット

## 🚨 問題

Jest実行時に以下のエラーが発生：

```
● Validation Error:
Test environment jest-environment-jsdom cannot be found. Make sure the testEnvironment configuration option points to an existing node module.

As of Jest 28 "jest-environment-jsdom" is no longer shipped by default, make sure to install it separately.
```

## 🔍 原因分析

### Jest 28の仕様変更
- Jest 28以降、`jest-environment-jsdom`が別パッケージに分離
- デフォルトでは`jest-environment-node`のみ提供
- React/DOM関連テストには明示的なインストールが必要

### 現在の設定状況

#### jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',  // ← ここでjsdomを指定しているが依存関係なし
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx}',
    '<rootDir>/src/__tests__/**/*.{ts,tsx}'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
```

#### package.json（現在の状態）
- `jest`: インストール済み
- `jest-environment-jsdom`: **未インストール** ← 問題の原因

## 🛠️ 修正手順

### Step 1: 依存関係の追加

```bash
npm install --save-dev jest-environment-jsdom
```

### Step 2: package.jsonの確認
修正後、以下の依存関係が追加されることを確認：

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",  // ← 追加される
    // ... 他の依存関係
  }
}
```

### Step 3: jest.config.jsの明示的設定（オプション）
より明確にするため、以下のように変更も検討：

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',  // 明示的な指定
  // または
  // testEnvironment: 'jsdom',  // 短縮形でも動作
  // ... 他の設定
};
```

### Step 4: 動作確認

```bash
# テスト実行
npm test

# 特定のテストファイル実行
npx jest src/__tests__/edge-functions/ --passWithNoTests --verbose
```

## ✅ 期待される結果

### Before（エラー状態）
```
● Validation Error:
Test environment jest-environment-jsdom cannot be found.
Error: Process completed with exit code 1.
```

### After（修正後）
```
Test Suites: X passed, X total
Tests: X passed, X total
Snapshots: X total
Time: Xs
Ran all test suites.
```

## 🧪 テスト項目

### 必須確認項目
- [ ] `npm install --save-dev jest-environment-jsdom` の実行
- [ ] package.jsonに依存関係が追加されたか確認
- [ ] `npm test` でエラーが解消されるか確認
- [ ] 既存テストが正常に実行されるか確認

### 追加確認項目
- [ ] CI/CDパイプライン（GitHub Actions）でテストが通るか
- [ ] Edge Functionsテストが実行されるか
- [ ] React コンポーネントテストが実行されるか

## 📝 関連ファイル

### 修正対象
- `package.json` - 依存関係追加
- `jest.config.js` - 設定確認（必要に応じて更新）

### 確認対象
- `.github/workflows/ci.yml` - CIでのテスト実行
- `src/__tests__/` - 既存テストファイル群

## ⚠️ 注意事項

### バージョン互換性
- Jest本体とjest-environment-jsdomのバージョンを合わせる
- 現在のJestバージョン: `^29.7.0`
- 推奨jest-environment-jsdom: `^29.7.0`

### 他の環境への影響
- ローカル開発環境: `npm ci` で自動インストール
- CI/CD環境: package.jsonの更新で自動対応
- 本番環境: devDependenciesのため影響なし

## 🔗 参考資料

- [Jest公式ドキュメント - Configuring Jest](https://jestjs.io/docs/configuration)
- [jest-environment-jsdom NPMページ](https://www.npmjs.com/package/jest-environment-jsdom)
- [Jest 28 Breaking Changes](https://jestjs.io/blog/2022/04/25/jest-28)

---
**優先度**: 🔴 High  
**推定工数**: 0.5日  
**担当者**: きかく  
**ステータス**: 🟡 対応待ち