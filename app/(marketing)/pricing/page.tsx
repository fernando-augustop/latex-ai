"use client";

import { motion } from "framer-motion";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { FeatureComparison } from "@/components/pricing/feature-comparison";
import { fadeInUp, fadeIn } from "@/lib/motion";

export default function PricingPage() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/18 blur-3xl" />
      <div className="absolute -right-28 top-48 h-80 w-80 rounded-full bg-sky-400/18 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="font-serif text-5xl font-semibold sm:text-6xl"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            Preços simples e transparentes
          </motion.h1>
          <motion.p
            className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground"
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
