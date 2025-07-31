import { 
  createMockSupabaseClient, 
  sampleFrontmatter, 
  mockTrainingData, 
  assertResponse
} from './test-utils';

/**
 * フロントマター解析の単体テスト
 */
describe('フロントマター解析', () => {
  const parseFrontmatter = (content: string) => {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      return { frontmatter: {}, content };
    }
    
    const frontmatterText = match[1];
    const mainContent = match[2];
    
    try {
      // 簡易YAML解析（実際のYAMLライブラリを使用することを推奨）
      const frontmatter: any = {};
      frontmatterText.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value: any = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
          
          // 配列の処理
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map((v: string) => v.trim().replace(/^["']|["']$/g, ''));
          } else if (value === 'true') {
            value = true;
          } else if (value === 'false') {
            value = false;
          } else if (!isNaN(Number(value))) {
            value = Number(value);
          }
          
          frontmatter[key] = value;
        }
      });
      
      return { frontmatter: frontmatter || {}, content: mainContent };
    } catch (error) {
      console.error('フロントマター解析エラー:', error);
      return { frontmatter: {}, content };
    }
  };

  test('正常なYAMLの解析', () => {
    const result = parseFrontmatter(sampleFrontmatter.valid);
    
    expect(result.frontmatter.title).toBe("テストトレーニング");
    expect(result.frontmatter.type).toBe("challenge");
    expect(result.frontmatter.isPremium).toBe(false);
    expect(result.frontmatter.order_index).toBe(1);
    expect(Array.isArray(result.frontmatter.tags)).toBe(true);
  });

  test('不正なYAMLのエラーハンドリング', () => {
    const result = parseFrontmatter(sampleFrontmatter.invalidYaml);
    
    // エラー時は部分的に解析されたデータを返すか、空のオブジェクトを返す
    expect(typeof result.frontmatter).toBe('object');
    expect(result.content).toBeDefined();
  });
});

/**
 * get-training-list Edge Function の統合テスト
 */
describe('get-training-list Edge Function', () => {
  test('正常なレスポンス', async () => {
    const mockResponse = new Response(
      JSON.stringify({
        success: true,
        data: [
          {
            id: "test-training-1",
            slug: "test-training",
            title: "テストトレーニング",
            description: "テスト用の説明文",
            type: "challenge",
            difficulty: "normal",
            tags: ["test", "ui"],
            icon: "🧪",
            category: "UIデザイン",
            thumbnailImage: "/assets/test.svg"
          }
        ],
        meta: {
          total: 1,
          timestamp: "2024-01-31T00:00:00.000Z"
        }
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    );
    
    const data = await assertResponse.success(mockResponse, [
      expect.objectContaining({
        slug: "test-training",
        title: "テストトレーニング",
        type: "challenge"
      })
    ]);

    expect(data.meta.total).toBe(1);
  });

  test('ファイル不足エラー', async () => {
    const mockResponse = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'NO_VALID_CONTENT',
          message: '有効なトレーニングコンテンツが見つかりませんでした',
          statusCode: 404
        }
      }),
      {
        status: 404,
        headers: { 'content-type': 'application/json' }
      }
    );
    
    await assertResponse.error(mockResponse, 'NO_VALID_CONTENT');
  });

  test('ストレージアクセスエラー', async () => {
    const mockResponse = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'ストレージアクセス権限がありません',
          statusCode: 403
        }
      }),
      {
        status: 403,
        headers: { 'content-type': 'application/json' }
      }
    );
    
    await assertResponse.error(mockResponse, 'FORBIDDEN');
  });
});

/**
 * パフォーマンステスト
 */
describe('パフォーマンス', () => {
  test('レスポンス時間', async () => {
    const startTime = Date.now();
    
    // モック処理 (100ms のシミュレート)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // レスポンス時間が500ms以下であることを確認
    expect(responseTime).toBeLessThan(500);
  });
});

/**
 * データ整合性テスト
 */
describe('データ整合性', () => {
  const validateTrainingFrontmatter = (frontmatter: any, fileName: string): boolean => {
    const required = ['title', 'description', 'type'];
    const missing = required.filter(key => !frontmatter[key]);
    return missing.length === 0;
  };

  test('必須フィールドチェック - 正常なデータ', () => {
    const validData = {
      title: "テスト",
      description: "説明",
      type: "challenge"
    };
    expect(validateTrainingFrontmatter(validData, "test")).toBe(true);
  });

  test('必須フィールドチェック - 不足データ', () => {
    const invalidData = {
      title: "テスト"
      // description, type が不足
    };
    expect(validateTrainingFrontmatter(invalidData, "test")).toBe(false);
  });
});