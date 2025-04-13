'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FiUser, FiZap, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';

interface ChatBubbleProps {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  reactions: {
    liked: boolean | null;
  };
  onReaction: (messageId: string, reaction: 'like' | 'dislike') => void;
}

export function ChatBubble({
  id,
  content,
  isUser,
  timestamp,
  reactions,
  onReaction,
}: ChatBubbleProps) {
  return (
    <div className={cn('flex items-start gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'rounded-full p-2',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
      >
        {isUser ? <FiUser className="h-4 w-4" /> : <FiZap className="h-4 w-4" />}
      </div>

      <div className="max-w-[80%]">
        <div
          className={cn(
            'rounded-xl p-3',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-none'
              : 'bg-muted text-foreground rounded-tl-none',
          )}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>

        <div
          className={cn(
            'flex items-center mt-1 text-xs text-muted-foreground',
            isUser ? 'justify-end' : 'justify-start',
          )}
        >
          <span>{format(timestamp, 'HH:mm')}</span>

          {!isUser && (
            <div className="flex items-center gap-2 ml-3">
              <button
                onClick={() => onReaction(id, 'like')}
                className={cn(
                  'p-1 rounded-full',
                  reactions.liked === true ? 'bg-green-100 text-green-600' : 'hover:bg-muted',
                )}
              >
                <FiThumbsUp className="h-3 w-3" />
              </button>
              <button
                onClick={() => onReaction(id, 'dislike')}
                className={cn(
                  'p-1 rounded-full',
                  reactions.liked === false ? 'bg-red-100 text-red-600' : 'hover:bg-muted',
                )}
              >
                <FiThumbsDown className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
