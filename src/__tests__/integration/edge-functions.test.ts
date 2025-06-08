
import { supabase } from '@/integrations/supabase/client';

describe('Edge Functions Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('get-training-list returns expected structure', async () => {
    const mockData = {
      success: true,
      data: [
        {
          id: 'test-1',
          slug: 'test-training',
          title: 'Test Training',
          type: 'challenge',
          difficulty: 'normal'
        }
      ]
    };

    const mockInvoke = supabase.functions.invoke as unknown as jest.Mock;
    mockInvoke.mockResolvedValue({ data: mockData, error: null });

    const { data, error } = await supabase.functions.invoke('get-training-list', {
      body: {}
    });

    expect(error).toBeNull();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(mockInvoke).toHaveBeenCalledWith('get-training-list', { body: {} });
  });

  test('get-training-detail handles missing training', async () => {
    const mockError = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Training not found' }
    };

    const mockInvoke = supabase.functions.invoke as unknown as jest.Mock;
    mockInvoke.mockResolvedValue({ data: mockError, error: null });

    const { data } = await supabase.functions.invoke('get-training-detail', {
      body: { slug: 'non-existent' }
    });

    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NOT_FOUND');
  });

  test('get-training-content validates premium access', async () => {
    const mockData = {
      success: true,
      data: {
        title: 'Premium Task',
        content: 'Limited content for free users',
        is_premium: true
      }
    };

    const mockInvoke = supabase.functions.invoke as unknown as jest.Mock;
    mockInvoke.mockResolvedValue({ data: mockData, error: null });

    const { data } = await supabase.functions.invoke('get-training-content', {
      body: { trainingSlug: 'test', taskSlug: 'premium-task' }
    });

    expect(data.success).toBe(true);
    expect(data.data.is_premium).toBe(true);
  });
});
