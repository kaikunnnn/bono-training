import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import TrainingHome from '@/pages/Training';
import TaskDetailPage from '@/pages/Training/TaskDetailPage';

const MockProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            {children}
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Training Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders training home page without errors', async () => {
    render(
      <MockProviders>
        <TrainingHome />
      </MockProviders>
    );

    await waitFor(() => {
      expect(screen.getByText(/トレーニング/i)).toBeInTheDocument();
    });
  });

  test('handles task detail page loading states', async () => {
    render(
      <MockProviders>
        <TaskDetailPage />
      </MockProviders>
    );

    await waitFor(() => {
      expect(screen.getByText(/読み込み中/i)).toBeInTheDocument();
    });
  });

  test('displays error boundary when task not found', async () => {
    const mockInvoke = require('@/integrations/supabase/client').supabase.functions.invoke;
    mockInvoke.mockRejectedValue(new Error('Task not found'));

    render(
      <MockProviders>
        <TaskDetailPage />
      </MockProviders>
    );

    await waitFor(() => {
      expect(screen.getByText(/エラー/i)).toBeInTheDocument();
    });
  });
});
