"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  WandSparkles,
} from "lucide-react";

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
      "Receba sugestões inteligentes de LaTeX, auto-complete comandos e correções instantâneas de sintaxe.",
  },
  {
    icon: Eye,
    title: "Preview em Tempo Real",
    description:
      "Acompanhe o documento renderizado enquanto escreve com feedback visual contínuo e sem fricção.",
  },
  {
    icon: FileText,
    title: "Templates Profissionais",
    description:
      "Comece com bases sólidas para artigos, relatórios, currículos e apresentações acadêmicas.",
  },
  {
    icon: Users,
    title: "Feito para Todos",
    description:
      "De estudantes a pesquisadores, o fluxo se adapta ao seu nível sem sacrificar poder técnico.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const titlePhrases = ["TexAI", "artigos", "teses", "ideias"];

export default function LandingPage() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % titlePhrases.length);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section className="relative flex flex-col justify-center overflow-hidden px-4 pb-14 pt-12 sm:px-6 lg:min-h-[calc(100vh-80px)] lg:px-8 lg:pt-0">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 top-28 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />

        <motion.div
          className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-stretch"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeUp} className="flex flex-col">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/35 bg-primary/15 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary">
              <WandSparkles className="h-3.5 w-3.5" />
              Workspace LaTeX com IA
            </div>

            <h1 className="whitespace-nowrap font-mono text-[2.2rem] leading-[0.95] tracking-[-0.04em] sm:text-[3.3rem] lg:text-[4rem]">
              <span className="text-primary drop-shadow-[0_0_16px_rgba(42,213,157,0.35)]">
                \begin
              </span>
              <span className="text-[#b5d8ba]">{"{"}</span>
              <span className="inline-block align-baseline text-slate-100">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={titlePhrases[phraseIndex]}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="inline-block"
                  >
                    {titlePhrases[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="text-[#b5d8ba]">{"}"}</span>
            </h1>

            <p className="mt-4 max-w-xl text-xs uppercase tracking-[0.22em] text-muted-foreground/90 sm:text-sm md:mt-5">
              da ideia ao latex pronto para publicação
            </p>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl md:mt-6">
              Um editor pensado para ritmo real de produção: IA para acelerar,
              preview para validar e templates para começar em segundos.
            </p>

            <p className="mt-auto pt-4 font-mono text-[1.6rem] tracking-[-0.04em] sm:text-[2.2rem] lg:text-[2.8rem]">
              <span className="text-primary/70 drop-shadow-[0_0_12px_rgba(42,213,157,0.25)]">
                \end
              </span>
              <span className="text-[#b5d8ba]/70">{"{"}</span>
              <span className="inline-block align-baseline text-slate-100/70">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`end-${titlePhrases[phraseIndex]}`}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="inline-block"
                  >
                    {titlePhrases[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="text-[#b5d8ba]/70">{"}"}</span>
            </p>

            <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
              <Button size="lg" className="btn-press gap-2 rounded-full px-8 text-base" asChild>
                <Link href="/register">
                  Comece Grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="btn-press rounded-full px-8 text-base" asChild>
                <Link href="/pricing">Ver Planos</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="relative flex flex-col">
            <div className="panel-glass animate-emerald-glow flex flex-col overflow-hidden rounded-3xl">
              <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
                </div>
                <span className="ml-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  main.tex
                </span>
              </div>

              <div className="grid gap-0 md:grid-cols-2">
                <div className="border-b border-border/50 p-5 md:border-b-0 md:border-r">
                  <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    <Code2 className="h-3.5 w-3.5 text-primary" />
                    Editor
                  </div>
                  <pre className="text-xs leading-relaxed text-muted-foreground">
                    <code>{sampleLatex}</code>
                  </pre>
                </div>

                <div className="flex flex-col bg-card/40 p-5">
                  <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    Preview
                  </div>
                  <div className="relative flex-1 rounded-sm bg-white px-7 py-6 text-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_20px_40px_rgba(0,0,0,0.15)]">
                    {/* Page shadow left edge */}
                    <div className="absolute inset-y-0 left-0 w-px bg-zinc-300/60" />

                    <h2 className="text-center font-serif text-[15px] font-bold leading-snug tracking-tight">
                      Meu Artigo de Pesquisa
                    </h2>
                    <p className="mt-1.5 text-center text-[10px] text-zinc-600">Maria Silva</p>
                    <div className="mx-auto mt-1 h-px w-16 bg-zinc-200" />

                    <div className="mt-4 space-y-2.5 text-[10px] leading-[1.65] text-zinc-700">
                      <div>
                        <h3 className="text-[11px] font-bold text-zinc-900">
                          <span className="mr-1.5">1</span>Introdução
                        </h3>
                        <p className="mt-1 text-justify">
                          A equação <em className="font-serif">E</em> = <em className="font-serif">mc</em>
                          <sup className="text-[7px]">2</sup> transformou nossa compreensão da física moderna
                          e estabeleceu as bases da relatividade especial.
                        </p>
                      </div>

                      <div className="my-2 rounded border border-zinc-100 bg-zinc-50/80 px-3 py-2.5 text-center">
                        <span className="font-serif text-[13px] italic leading-none tracking-tight text-zinc-800">
                          <span className="relative mr-0.5 inline-block text-[20px] leading-none not-italic" style={{ verticalAlign: "-7px" }}>∫</span>
                          <span className="relative inline-block w-2">
                            <span className="absolute -top-2 left-0.5 text-[7px] not-italic">∞</span>
                            <span className="absolute -bottom-0.5 left-0.5 text-[7px] not-italic">0</span>
                          </span>
                          <span className="ml-0.5">e</span>
                          <sup className="text-[7px]">−x²</sup>
                          <span className="ml-0.5 not-italic">d</span>x
                          <span className="mx-1.5 not-italic">=</span>
                          <span className="inline-flex flex-col items-center align-middle">
                            <span className="border-b border-zinc-400 px-1 text-[9px] leading-tight">
                              <span className="not-italic">√</span>π
                            </span>
                            <span className="text-[9px] not-italic leading-tight">2</span>
                          </span>
                        </span>
                        <span className="ml-4 text-[8px] not-italic text-zinc-400">(1)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section id="features" className="scroll-mt-10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            variants={fadeUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl font-semibold sm:text-5xl">
              Ferramentas que respeitam seu fluxo
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Design limpo para foco, IA para tração e recursos avançados para entregar documentos profissionais.
            </p>
          </motion.div>

          <motion.div
            className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="card-hover-glow h-full border-border/55 bg-card/75">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/40 bg-primary/12">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-2xl leading-tight">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-16 rounded-3xl border border-border/55 bg-card/70 px-6 py-10 text-center backdrop-blur-lg sm:px-12"
            variants={fadeUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h3 className="font-serif text-3xl sm:text-4xl">Transforme ideias em PDF pronto para publicação</h3>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Monte seu próximo paper, relatório ou currículo com um ambiente que combina performance técnica e refinamento visual.
            </p>
            <Button className="mt-7 btn-press rounded-full px-8" size="lg" asChild>
              <Link href="/register">
                Criar Conta Agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
