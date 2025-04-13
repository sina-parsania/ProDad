'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Abstract shapes background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-20 right-32 w-64 h-64 rounded-full bg-primary/5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
        />
        <motion.div
          className="absolute bottom-10 left-20 w-40 h-40 rounded-full bg-primary/10"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.4 }}
        />
        <motion.div
          className="absolute top-40 left-[30%] w-20 h-20 rounded-full bg-primary/5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
        />
      </div>

      <div className="container">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight"
            variants={itemVariants}
          >
            Welcome to <span className="text-primary">ProDad</span>
          </motion.h1>

          <motion.p className="mt-6 text-xl text-foreground/70" variants={itemVariants}>
            Empowering dads with resources, community, and support to be their best for their
            families.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <Button size="lg" asChild>
              <Link href="/join">Join the Community</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/resources">Explore Resources</Link>
            </Button>
          </motion.div>

          <motion.div className="mt-16" variants={itemVariants}>
            <p className="text-sm font-medium text-foreground/60 uppercase tracking-wider mb-4">
              Trusted by dads everywhere
            </p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              {/* These would be replaced with actual logos */}
              <div className="h-8 w-32 bg-foreground/10 rounded-md"></div>
              <div className="h-8 w-32 bg-foreground/10 rounded-md"></div>
              <div className="h-8 w-32 bg-foreground/10 rounded-md"></div>
              <div className="h-8 w-32 bg-foreground/10 rounded-md"></div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
