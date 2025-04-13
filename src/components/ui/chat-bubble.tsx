'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatBubbleProps {
  message: string;
  isAi: boolean;
  timestamp: Date;
  className?: string;
}

export function ChatBubble({ message, isAi, timestamp, className }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        'flex flex-col max-w-[80%] rounded-lg p-4',
        isAi
          ? 'bg-muted self-start rounded-bl-none'
          : 'bg-primary text-primary-foreground self-end rounded-br-none',
        className,
      )}
    >
      <div className="text-sm">{message}</div>
      <div
        className={cn(
          'text-xs mt-2 self-end',
          isAi ? 'text-muted-foreground' : 'text-primary-foreground/80',
        )}
      >
        {format(timestamp, 'h:mm a')}
      </div>
    </div>
  );
}
