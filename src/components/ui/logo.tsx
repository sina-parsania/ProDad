'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'horizontal' | 'stacked';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function ProDadLogo({
  variant = 'horizontal',
  size = 'md',
  animated = false,
  className,
}: LogoProps) {
  // Size mappings
  const sizes = {
    sm: { icon: 24, fontSize: 'text-sm font-medium', gap: 'gap-1' },
    md: { icon: 32, fontSize: 'text-lg font-semibold', gap: 'gap-2' },
    lg: { icon: 48, fontSize: 'text-2xl font-bold', gap: 'gap-3' },
  };

  const { icon, fontSize, gap } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex items-center',
          variant === 'stacked' ? 'flex-col' : 'flex-row',
          gap,
          className,
        )}
      >
        <motion.div
          className="relative"
          initial={animated ? { scale: 0.8 } : {}}
          animate={
            animated
              ? {
                  scale: [0.8, 1.05, 1],
                }
              : {}
          }
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          <svg
            width={icon}
            height={icon}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative"
          >
            {/* Large circle (father) with gap */}
            <motion.path
              initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
              animate={animated ? { pathLength: 1 } : {}}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              d="M60 10c27.614 0 50 22.386 50 50s-22.386 50-50 50-50-22.386-50-50 22.386-50 50-50z"
              fill="var(--primary)"
              fillOpacity="0.15"
            />
            <motion.path
              initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
              animate={animated ? { pathLength: 1 } : {}}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
              d="M110 60c0 27.614-22.386 50-50 50S10 87.614 10 60 32.386 10 60 10s50 22.386 50 50z M60 110V85"
              stroke="var(--primary)"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="275"
              strokeDashoffset="60"
            />

            {/* Small circle (child) */}
            <motion.circle
              initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              animate={animated ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
              cx="60"
              cy="55"
              r="15"
              fill="var(--primary)"
            />
          </svg>

          {/* Heart pulse animation (only visible when animated) */}
          {animated && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: [0.5, 1.3, 1.4],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 1.8,
                times: [0, 0.4, 1],
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          )}
        </motion.div>

        <div className={cn('flex items-center flex-row', fontSize)}>
          <span className="text-foreground font-normal">Pro</span>
          <span className="text-primary font-bold">Dad</span>
        </div>
      </div>
    </div>
  );
}
