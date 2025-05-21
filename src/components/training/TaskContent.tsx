import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';

interface TaskContentProps {
  content: string;
  isPremium?: boolean;
  hasPremiumAccess?: boolean;
  className?: string;
  taskId?: string;
  userId?: string;
  isCompleted?: boolean;
  onProgressUpdate?: () => void;
}

const TaskContent: React.FC<TaskContentProps> = ({
  content,
  isPremium = false,
  hasPremiumAccess = false,
  className,
  taskId,
  userId,
  isCompleted = false,
  onProgressUpdate
}) => {
  return (
    <div className={cn('prose prose-slate dark:prose-invert max-w-none', className)}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({node, ...props}) => (
            <a 
              className="text-blue-600 hover:text-blue-800 underline" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          code: ({node, inline, className, children, ...props}: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && inline;
            
            if (isInline) {
              return (
                <code className="bg-gray-100 text-red-500 px-1 py-0.5 rounded" {...props}>
                  {children}
                </code>
              );
            }
            
            return (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto">
                <code className={`${className || ''} block p-4`} {...props}>
                  {children}
                </code>
              </div>
            );
          },
          h1: ({node, ...props}) => (
            <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
          ),
          h2: ({node, ...props}) => (
            <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />
          ),
          h3: ({node, ...props}) => (
            <h3 className="text-xl font-medium mt-4 mb-2" {...props} />
          ),
          ul: ({node, ...props}) => (
            <ul className="list-disc pl-6 my-4 space-y-2" {...props} />
          ),
          ol: ({node, ...props}) => (
            <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default TaskContent;