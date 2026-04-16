import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/hooks/useAIChat';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-foreground text-background rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-3">
      {/* アバター */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold mt-0.5">
        AI
      </div>

      {/* メッセージ本文 */}
      <div className="max-w-[85%] min-w-0">
        <div
          className={cn(
            'text-sm leading-relaxed text-foreground',
            '[&>*+*]:mt-3',
            '[&_p]:leading-relaxed',
            '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1',
            '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1',
            '[&_li]:leading-relaxed',
            '[&_strong]:font-bold',
            '[&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-blue-700',
            '[&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-4',
            '[&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-3',
            '[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs',
          )}
        >
          {message.content ? (
            <ReactMarkdown
              components={{
                a: ({ href, children }) => (
                  <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : null}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-foreground/40 rounded-sm animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
