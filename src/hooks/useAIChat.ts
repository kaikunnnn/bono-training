import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput.trim(),
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    // APIに送るメッセージ履歴（新しいユーザーメッセージを含む）
    const historyForApi = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userInput.trim() },
    ];

    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForApi }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const status = response.status;
        console.error(`[BONO AI] /api/ai-chat エラー status=${status}`);
        if (status === 500) {
          console.error('[BONO AI] 原因候補: GROQ_API_KEY が Vercel のプレビュー環境に設定されていない');
          console.error('[BONO AI] 確認: Vercel Dashboard → Settings → Environment Variables → GROQ_API_KEY の "Preview" チェックを確認');
        } else if (status === 404) {
          console.error('[BONO AI] /api/ai-chat が見つかりません。Vercel にデプロイされていない可能性があります');
        } else if (status === 405) {
          console.error('[BONO AI] Method Not Allowed — POST 以外のリクエストが送られています');
        }
        throw new Error(`APIエラー (${status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('ストリームの読み取りに失敗しました');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, content: m.content + parsed.text }
                    : m
                )
              );
            }
          } catch {
            // parse error - skip
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('[BONO AI] 送信エラー:', err);
      setError(`回答の取得に失敗しました（${err.message}）。コンソールを確認してください。`);
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
    } finally {
      // ストリーミング完了
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id ? { ...m, isStreaming: false } : m
        )
      );
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages };
}
