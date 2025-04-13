'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Expert Advice',
    description: 'Access a wealth of knowledge from experienced dads and parenting experts.',
    icon: '👨‍👧‍👦',
  },
  {
    title: 'Supportive Community',
    description: 'Connect with other dads who understand the joys and challenges of fatherhood.',
    icon: '🤝',
  },
  {
    title: 'Resource Library',
    description:
      'Browse our curated collection of articles, videos, and tools for dads at any stage.',
    icon: '📚',
  },
  {
    title: 'Events & Workshops',
    description: 'Participate in virtual and in-person events designed specifically for dads.',
    icon: '🗓️',
  },
  {
    title: 'Dad Skills Mastery',
    description: 'Learn practical skills from diaper changing to handling difficult conversations.',
    icon: '🛠️',
  },
  {
    title: 'Work-Life Balance',
    description: 'Find strategies for balancing your career with your family responsibilities.',
    icon: '⚖️',
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Everything You Need to Thrive as a Dad
          </h2>
          <p className="text-foreground/70 text-lg">
            ProDad provides the tools, resources, and community to help you be the best father you
            can be.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>{/* Placeholder for additional content if needed */}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
