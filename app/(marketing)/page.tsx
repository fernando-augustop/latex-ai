"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Eye,
  FileText,
  Users,
  ArrowRight,
  Code2,
  BookOpen,
} from "lucide-react";
import { fadeInUp, staggerContainer, cardHover } from "@/lib/motion";

const sampleLatex = `\\documentclass{article}
\\usepackage{amsmath}
\\title{Meu Artigo de Pesquisa}
\\author{Maria Silva}
\\begin{document}
\\maketitle

\\section{Introdução}
A equação $E = mc^2$ transformou
nossa compreensão da física.

\\begin{equation}
  \\int_0^\\infty e^{-x^2} dx
  = \\frac{\\sqrt{\\pi}}{2}
\\end{equation}

\\end{document}`;

const features = [
  {
    icon: Sparkles,
    title: "Assistente de IA",
    description:
      "Receba sugestões inteligentes de LaTeX, auto-complete comandos e corrija erros de compilação com IA.",
  },
  {
    icon: Eye,
    title: "Preview em Tempo Real",
    description:
      "Veja seu documento renderizado enquanto digita. Compilação automática com feedback visual instantâneo.",
  },
  {
    icon: FileText,
    title: "Templates Profissionais",
    description:
      "Comece com templates para artigos, relatórios, currículos e apresentações. Prontos para usar.",
  },
  {
    icon: Users,
    title: "Feito para Todos",
    description:
      "De estudantes escrevendo seu primeiro artigo a pesquisadores publicando em revistas. O TexAI se adapta a você.",
  },
];

const stats = [
  { value: "5.000+", label: "Usuários" },
  { value: "50.000+", label: "Documentos" },
  { value: "99.9%", label: "Uptime" },
];

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeInUpLocal = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-background to-background" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Editor LaTeX com IA
            </motion.div>

            <h1 className="mx-auto max-w-4xl font-serif text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Escreva LaTeX,
              <br />
              <span className="text-gradient">com o Poder da IA</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              O editor LaTeX moderno com assistência inteligente de IA.
              Escreva, compile e visualize seus documentos em tempo real.
            </p>

            <motion.div
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                className="bg-emerald-500 text-white hover:bg-emerald-600 gap-2 text-base px-8 btn-press"
                asChild
              >
                <Link href="/register">
                  Comece Grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base px-8 btn-press"
                asChild
              >
                <Link href="/pricing">Ver Preços</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Animated Demo */}
          <motion.div
            className="mx-auto mt-16 max-w-5xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl shadow-emerald-500/5">
              <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  main.tex
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Code side */}
                <div className="border-r border-border/60 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Editor
                    </span>
                  </div>
                  <pre className="text-sm font-mono text-muted-foreground leading-relaxed overflow-x-auto">
                    <code>{sampleLatex}</code>
                  </pre>
                </div>
                {/* Preview side */}
                <div className="p-6 bg-white dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Preview
                    </span>
                  </div>
                  <div className="space-y-4 text-sm text-foreground">
                    <h2 className="text-center text-lg font-serif font-bold">
                      Meu Artigo de Pesquisa
                    </h2>
                    <p className="text-center text-xs text-muted-foreground">
                      Maria Silva
                    </p>
                    <div className="pt-2">
                      <h3 className="text-base font-serif font-semibold mb-2">
                        1 Introdução
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        A equação <em>E = mc</em>
                        <sup>2</sup> transformou nossa compreensão da física.
                      </p>
                    </div>
                    <div className="flex items-center justify-center py-4">
                      <div className="rounded bg-muted/50 px-6 py-3 font-mono text-sm text-center">
                        <span className="text-muted-foreground">
                          &int;<sub>0</sub>
                          <sup>&infin;</sup> e<sup>-x&sup2;</sup> dx =
                          &radic;&pi; / 2
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              Tudo que você precisa para escrever LaTeX
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Um ambiente completo para documentos acadêmicos e profissionais.
            </p>
          </motion.div>

          <motion.div
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUpLocal}
                whileHover={{ y: -2 }}
              >
                <Card className="group h-full border-border/40 bg-card/50 transition-colors hover:border-emerald-500/30 hover:bg-card">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <feature.icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="border-y border-border/40 bg-muted/20 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">
              Confiado por
            </p>
            <h2 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
              Pesquisadores, estudantes e profissionais
            </h2>
            <p className="mt-4 text-muted-foreground">
              Junte-se a milhares que escrevem documentos melhores com o TexAI.
            </p>
          </motion.div>

          <motion.div
            className="mt-10 grid grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-emerald-400 sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              Pronto para começar?{" "}
              <span className="text-gradient">É grátis.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Sem cartão de crédito. Comece a escrever LaTeX com IA hoje.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                className="bg-emerald-500 text-white hover:bg-emerald-600 gap-2 text-base px-8 btn-press"
                asChild
              >
                <Link href="/register">
                  Comece Grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
