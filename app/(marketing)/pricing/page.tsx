"use client";

import { motion } from "framer-motion";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { FeatureComparison } from "@/components/pricing/feature-comparison";
import { fadeInUp, fadeIn } from "@/lib/motion";

export default function PricingPage() {
  return (
    <section
      className="relative py-24 sm:py-32"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at top, rgba(16,185,129,0.05), transparent 70%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="font-serif text-4xl font-bold sm:text-5xl"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            Preços simples e transparentes
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            Escolha o plano ideal para seu fluxo de trabalho. Faça upgrade a qualquer momento.
          </motion.p>
        </motion.div>

        <PricingCards />
        <FeatureComparison />
      </div>
    </section>
  );
}
