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

interface ChatInterfaceProps {
  /** 履歴なし・入力空のときに一度だけ入力欄へプリフィルされる初期値（自動送信はしない） */
  initialInput?: string;
}

const ChatInterface = ({ initialInput }: ChatInterfaceProps) => {
  const { messages, isLoading, error, sendMessage, clearMessages } = useAIChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    if (!initialInput) return;
    if (messages.length > 0) return;
    if (input !== '') return;
    setInput(initialInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInput]);

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
    // IME 変換中の Enter は無視（日本語変換確定の Enter で誤送信されないように）
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    // Cmd+Enter (Mac) / Ctrl+Enter (Win) で送信。素の Enter は改行
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
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

      {/* 入力エリア（Figma 19:1675 準拠：白ボックス + 影 + 内側右下に送信） */}
      <div className="px-4 py-4">
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

          <div className="bg-white border border-gray-200 shadow-[0_4px_8px_rgba(0,0,0,0.06)] rounded-3xl px-6 pt-5 pb-2.5">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="学習の悩みや疑問を書いてください..."
              rows={1}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-slate-500 resize-none outline-none leading-[1.625] min-h-[24px]"
              disabled={isLoading}
            />
            <div className="flex items-center justify-end gap-2.5 mt-1">
              <span className="text-[11px] text-slate-500 tracking-wide">
                Cmd+Enterで送信
              </span>
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                aria-label="送信"
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                  input.trim() && !isLoading
                    ? 'bg-foreground text-background hover:bg-foreground/90'
                    : 'bg-muted-foreground/15 text-muted-foreground cursor-not-allowed'
                )}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
