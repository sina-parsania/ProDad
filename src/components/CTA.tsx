'use client';

import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-background"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-background"></div>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join the ProDad Community?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Connect with like-minded fathers, access exclusive resources, and become the best dad
              you can be.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
