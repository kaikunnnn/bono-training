// Edge Function テスト用ユーティリティ（Jest対応版）

/**
 * モックSupabaseクライアント
 */
export const createMockSupabaseClient = (mockData: any) => ({
  storage: {
    from: (bucket: string) => ({
      list: (path: string, options?: any) => Promise.resolve({
        data: mockData.files || [],
        error: mockData.listError || null
      }),
      download: (path: string) => {
        const file = mockData.fileContents?.[path];
        if (file) {
          return Promise.resolve({
            data: { text: () => Promise.resolve(file) },
            error: null
          });
        }
        return Promise.resolve({
          data: null,
          error: { message: 'File not found' }
        });
      }
    })
  }
});

/**
 * テスト用フロントマターサンプル
 */
export const sampleFrontmatter = {
  valid: `---
title: "テストトレーニング"
description: "テスト用の説明文"
type: "challenge"
difficulty: "normal"
category: "UIデザイン"
tags: ["test", "ui"]
isPremium: false
order_index: 1
thumbnail: "/assets/test.svg"
icon: "🧪"
skills:
  - "テストスキル1"
  - "テストスキル2"
estimated_total_time: "2時間"
task_count: 3
---

# テストコンテンツ

テスト用のマークダウンコンテンツです。`,

  invalidYaml: `---
title: "無効なYAML"
tags: [invalid yaml
isPremium: "not boolean"
---

コンテンツ`,

  missingRequired: `---
title: "不完全なフロントマター"
description: "必須フィールドが不足"
---

コンテンツ`,

  complexYaml: `---
title: "複雑なYAML構造"
description: "複数行の説明文\\n改行を含む"
type: "challenge"
difficulty: "normal"
category: "UIデザイン"
tags:
  - "複雑"
  - "YAML"
  - "配列"
isPremium: true
order_index: 5
thumbnail: "/assets/complex.svg"
icon: "🔬"
skills:
  - "スキル1: 詳細な説明付き"
  - "スキル2: もう一つの詳細"
  - "スキル3: 最後のスキル"
estimated_total_time: "4-6時間"
task_count: 8
metadata:
  author: "テスト作成者"
  version: "1.0"
  last_updated: "2024-01-31"
---

# 複雑なコンテンツ

複雑なYAML構造のテストです。`
};

/**
 * テスト用モックデータ
 */
export const mockTrainingData = {
  // 正常なファイル構造
  normal: {
    files: [
      { name: 'test-training', id: '1' },
      { name: 'another-training', id: '2' }
    ],
    fileContents: {
      'test-training/index.md': sampleFrontmatter.valid,
      'another-training/index.md': sampleFrontmatter.complexYaml
    }
  },
  
  // ファイル不足
  missingFiles: {
    files: [
      { name: 'incomplete-training', id: '1' }
    ],
    fileContents: {} // index.mdが存在しない
  },
  
  // 不正なYAML
  invalidYaml: {
    files: [
      { name: 'broken-training', id: '1' }
    ],
    fileContents: {
      'broken-training/index.md': sampleFrontmatter.invalidYaml
    }
  },
  
  // ストレージエラー
  storageError: {
    files: [],
    listError: { message: 'Storage access denied' }
  }
};

/**
 * HTTPレスポンスのアサーションヘルパー
 */
export const assertResponse = {
  success: async (response: Response, expectedData?: any) => {
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    if (expectedData) {
      expect(data.data).toEqual(expect.arrayContaining(expectedData));
    }
    return data;
  },
  
  error: async (response: Response, expectedCode?: string) => {
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.headers.get('content-type')).toContain('application/json');
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
    if (expectedCode) {
      expect(data.error.code).toBe(expectedCode);
    }
    return data;
  }
};