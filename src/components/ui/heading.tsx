'use client';

import React, { JSX, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  description?: string;
}

export const Heading = ({ level = 1, children, className, description }: HeadingProps) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <div className="mb-6">
      <HeadingTag
        className={cn(
          'font-bold text-gray-900 dark:text-white',
          level === 1 && 'text-2xl md:text-3xl',
          level === 2 && 'text-xl md:text-2xl',
          level === 3 && 'text-lg md:text-xl',
          level === 4 && 'text-base md:text-lg',
          level === 5 && 'text-sm md:text-base',
          level === 6 && 'text-xs md:text-sm',
          className,
        )}
      >
        {children}
      </HeadingTag>
      {description && <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>}
    </div>
  );
};
