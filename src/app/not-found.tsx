'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.div
            className="absolute -z-10 bg-primary/5 dark:bg-primary/10 rounded-full w-[200px] h-[200px] left-1/2 -translate-x-1/2 top-20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          />

          <motion.h1
            className="font-bold text-9xl text-primary/80"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 15,
              delay: 0.1,
            }}
          >
            404
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mt-4 mb-2">Oops! Page not found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <motion.div
            className="inline-block"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/">
              <Button size="lg" className="min-w-[150px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Go Back Home
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="text-4xl"
            animate={{
              y: [0, -7, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              repeatType: 'reverse',
            }}
          >
            👋
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
