import React, { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { ArrowUp, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIChat } from '@/hooks/useAIChat';
import ChatMessage from './ChatMessage';

const SUGGESTED_QUESTIONS = [
  'UIデザインを学び始めるには何から始めればいいですか？',
  'ポートフォリオ制作で気をつけることは何ですか？',
  'デザイナーに転職するためのロードマップを教えてください',
  'Figmaの次に学ぶべきスキルは何ですか？',
];

const ChatInterface = () => {
  const { messages, isLoading, error, sendMessage, clearMessages } = useAIChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = messages.length === 0;

  // 新しいメッセージが来たら末尾にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // textareaの高さを自動調整
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {isEmpty ? (
          /* 初期状態 */
          <div className="flex flex-col items-center justify-center h-full gap-8 max-w-xl mx-auto text-center">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
                AI
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                学習アシスタント
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                学習の悩みや疑問を自由に書いてください。<br />
                BONOのコンテンツをもとに最適な学習パスを提案します。
              </p>
            </div>

            {/* サジェスト質問 */}
            <div className="w-full space-y-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    textareaRef.current?.focus();
                  }}
                  className="w-full text-left text-sm px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* メッセージ一覧 */
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 入力エリア */}
      <div className="border-t border-border px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {!isEmpty && (
            <button
              onClick={clearMessages}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              会話をリセット
            </button>
          )}

          <div className="relative flex items-end gap-2 bg-muted rounded-2xl px-4 py-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="学習の悩みや疑問を書いてください..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed min-h-[24px]"
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                input.trim() && !isLoading
                  ? 'bg-foreground text-background'
                  : 'bg-muted-foreground/20 text-muted-foreground cursor-not-allowed'
              )}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            Enterで送信・Shift+Enterで改行
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
