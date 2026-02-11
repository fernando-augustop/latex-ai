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
  { feature: "Compilação PDF", free: "No navegador", pro: "No servidor", enterprise: "Prioritária" },
  { feature: "Armazenamento", free: "50MB", pro: "5GB", enterprise: "Ilimitado" },
  { feature: "Destaque de Sintaxe", free: true, pro: true, enterprise: true },
  { feature: "Preview em Tempo Real", free: true, pro: true, enterprise: true },
  { feature: "Exportação PDF", free: false, pro: true, enterprise: true },
  { feature: "Histórico de Versões", free: false, pro: true, enterprise: true },
  { feature: "Suporte Prioritário", free: false, pro: false, enterprise: true },
  { feature: "Acesso à API", free: false, pro: false, enterprise: true },
];

function CellContent({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="h-4 w-4 text-emerald-400 mx-auto" />;
  }
  if (value === false) {
    return <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  }
  return (
    <span className="text-sm text-muted-foreground">{value}</span>
  );
}

export function FeatureComparison() {
  return (
    <div className="mt-20">
      <h3 className="text-center font-serif text-2xl font-bold mb-8">
        Comparação de Recursos
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border/40">
              <th className="py-4 px-4 text-left text-sm font-medium text-muted-foreground">
                Recurso
              </th>
              <th className="py-4 px-4 text-center text-sm font-medium">
                Free
              </th>
              <th className="py-4 px-4 text-center text-sm font-medium text-emerald-400 bg-emerald-500/5">
                Pro
              </th>
              <th className="py-4 px-4 text-center text-sm font-medium">
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
                className="border-b border-border/20 hover:bg-muted/20 transition-colors"
              >
                <td className="py-3 px-4 text-sm">{row.feature}</td>
                <td className="py-3 px-4 text-center">
                  <CellContent value={row.free} />
                </td>
                <td className="py-3 px-4 text-center bg-emerald-500/5">
                  <CellContent value={row.pro} />
                </td>
                <td className="py-3 px-4 text-center">
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
