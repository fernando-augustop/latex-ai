"use client";

import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion";

interface FeatureRow {
  feature: string;
  free: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

const features: FeatureRow[] = [
  { feature: "Projetos", free: "3", pro: "Ilimitados", enterprise: "Ilimitados" },
  { feature: "Mensagens de IA", free: false, pro: "50/dia", enterprise: "Ilimitadas" },
  { feature: "Modelos de IA", free: false, pro: "Haiku, GPT-4o-mini", enterprise: "Todos os modelos" },
  { feature: "Compilação PDF", free: "Servidor (15/min)", pro: "Servidor (ilimitada)", enterprise: "Servidor (ilimitada)" },
  { feature: "Armazenamento", free: "50MB", pro: "5GB", enterprise: "Ilimitado" },
  { feature: "Destaque de Sintaxe", free: true, pro: true, enterprise: true },
  { feature: "Preview em Tempo Real", free: true, pro: true, enterprise: true },
  { feature: "Suporte Prioritário", free: false, pro: false, enterprise: true },
  { feature: "Acesso à API", free: false, pro: false, enterprise: true },
];

function CellContent({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="mx-auto h-4 w-4 text-primary" />;
  }
  if (value === false) {
    return <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />;
  }
  return (
    <span className="text-sm text-muted-foreground">{value}</span>
  );
}

export function FeatureComparison() {
  return (
    <div className="mt-20">
      <h3 className="mb-8 text-center font-serif text-4xl font-semibold">
        Comparação de Recursos
      </h3>
      <div className="overflow-x-auto rounded-3xl border border-border/55 bg-card/75 p-2 backdrop-blur-md">
        <table className="w-full border-collapse overflow-hidden rounded-2xl">
          <thead>
            <tr className="border-b border-border/40">
              <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground">
                Recurso
              </th>
              <th className="px-4 py-4 text-center text-sm font-medium">
                Free
              </th>
              <th className="bg-primary/10 px-4 py-4 text-center text-sm font-medium text-primary">
                Pro
              </th>
              <th className="px-4 py-4 text-center text-sm font-medium">
                Enterprise
              </th>
            </tr>
          </thead>
          <motion.tbody
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((row) => (
              <motion.tr
                key={row.feature}
                variants={fadeInUp}
                className="border-b border-border/20 transition-colors hover:bg-muted/20"
              >
                <td className="px-4 py-3 text-sm">{row.feature}</td>
                <td className="px-4 py-3 text-center">
                  <CellContent value={row.free} />
                </td>
                <td className="bg-primary/10 px-4 py-3 text-center">
                  <CellContent value={row.pro} />
                </td>
                <td className="px-4 py-3 text-center">
                  <CellContent value={row.enterprise} />
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
