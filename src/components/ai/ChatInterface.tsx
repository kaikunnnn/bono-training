"use client";

import React, { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { ArrowUp, RotateCcw, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIChat } from '@/hooks/useAIChat';
import { SLACK_QUESTIONS_URL } from '@/lib/external-links';
import ChatMessage from './ChatMessage';
import { AIAvatar } from './AIAvatar';

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
  const emptyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = messages.length === 0;
  const activeTextareaRef = isEmpty ? emptyTextareaRef : bottomTextareaRef;

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

  // textareaの高さを自動調整（active な側だけ動かす）
  useEffect(() => {
    const el = activeTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input, isEmpty, activeTextareaRef]);

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

  const sendButtonClass = (active: boolean) =>
    cn(
      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
      active
        ? 'bg-black text-white hover:bg-black/90'
        : 'bg-muted-foreground/15 text-muted-foreground cursor-not-allowed'
    );

  return (
    <div className="flex flex-col h-full">
      {isEmpty ? (
        /* 空状態（Figma 17:1621）: 中央寄せのウェルカム + 大きい入力 + サジェスト2x2 */
        <div className="flex-1 overflow-y-auto px-4 py-12">
          <div className="max-w-2xl mx-auto flex flex-col gap-5">
            {/* ヘッダー（AI アバター + 見出し） */}
            <div className="flex flex-col items-center gap-3 text-center">
              <AIAvatar />
              <div>
                <h2 className="font-noto-sans-jp text-[20px] font-bold leading-[28px] text-[#020817]">
                  AI学習アシスタント
                </h2>
                <p className="pt-2 text-[14px] text-[#64748b] leading-[22.75px] tracking-tight">
                  悩みや疑問を自由に書いてください。
                  <br />
                  BONOのコンテンツをもとに最適な学習パスを提案します。
                </p>
              </div>
            </div>

            {/* 大きい入力フォーム（h-[173px] 相当、白ボックス全体がクリック範囲） */}
            <label className="bg-white border border-gray-200 shadow-[0_1px_6px_rgba(0,0,0,0.08)] rounded-3xl px-[21px] py-[17px] min-h-[173px] flex flex-col justify-between cursor-text">
              <textarea
                ref={emptyTextareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="学習の悩みや疑問を書いてください..."
                rows={1}
                className="w-full bg-transparent text-[16px] text-foreground placeholder:text-[#64748b] resize-none outline-none leading-[1.625] min-h-[24px]"
                disabled={isLoading}
              />
              <div className="flex items-center justify-end gap-2.5">
                <span className="text-[11px] text-slate-500 tracking-wide">
                  Cmd+Enterで送信
                </span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!input.trim() || isLoading}
                  aria-label="送信"
                  className={sendButtonClass(!!input.trim() && !isLoading)}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </label>

            {/* サジェスト質問グリッド（2x2） */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    emptyTextareaRef.current?.focus();
                  }}
                  className="text-left text-[14px] text-[#020817] px-4 h-[46px] rounded-[12px] border border-[#e2e8f0] hover:bg-gray-50 transition-colors leading-5 truncate"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              {!isLoading && (
                <div className="pt-2 text-center">
                  <a
                    href={SLACK_QUESTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    回答に満足できない？カイクンに質問する
                  </a>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 下部固定入力エリア（会話開始後のみ） */}
          <div className="px-4 py-4">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={clearMessages}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                会話をリセット
              </button>

              <label className="bg-white border border-gray-200 shadow-[0_4px_8px_rgba(0,0,0,0.06)] rounded-3xl px-6 pt-5 pb-2.5 flex flex-col cursor-text">
                <textarea
                  ref={bottomTextareaRef}
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
                    type="button"
                    onClick={handleSubmit}
                    disabled={!input.trim() || isLoading}
                    aria-label="送信"
                    className={sendButtonClass(!!input.trim() && !isLoading)}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
