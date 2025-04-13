'use client';

import { ProDadLogo } from '@/components/ui/logo';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <ProDadLogo size="md" variant="stacked" />
      </motion.div>
      <div className="mt-6 flex items-center justify-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
      </div>
    </div>
  );
}
