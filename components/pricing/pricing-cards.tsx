"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { cardHover } from "@/lib/motion";

interface PricingTier {
  name: string;
  label: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    label: "Para experimentar",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "3 projetos",
      "Preview no navegador",
      "Destaque de sintaxe",
      "Recursos básicos do editor",
      "50MB de armazenamento",
    ],
    cta: "Começar grátis",
    href: "/register",
  },
  {
    name: "Pro",
    label: "Mais popular",
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      "Projetos ilimitados",
      "Assistente de IA (50 msgs/dia)",
      "Compilação PDF no servidor",
      "Claude Haiku + GPT-4o-mini",
      "Histórico de versões",
      "Exportação PDF",
      "5GB de armazenamento",
    ],
    cta: "Assinar Pro",
    href: "/register?plan=pro",
    popular: true,
  },
  {
    name: "Enterprise",
    label: "Para profissionais",
    monthlyPrice: 149,
    annualPrice: 119,
    features: [
      "Tudo do Pro",
      "Mensagens de IA ilimitadas",
      "Todos os modelos de IA (Sonnet, Opus, GPT-4o)",
      "Compilação prioritária",
      "Armazenamento ilimitado",
      "Suporte prioritário",
      "Acesso à API",
    ],
    cta: "Assinar Enterprise",
    href: "/register?plan=enterprise",
  },
];

export function PricingCards() {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <Label
          htmlFor="billing"
          className={annual ? "text-muted-foreground" : "text-foreground"}
        >
          Mensal
        </Label>
        <Switch
          id="billing"
          checked={annual}
          onCheckedChange={setAnnual}
        />
        <Label
          htmlFor="billing"
          className={annual ? "text-foreground" : "text-muted-foreground"}
        >
          Anual
          <Badge
            variant="secondary"
            className="ml-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          >
            Economize 20%
          </Badge>
        </Label>
      </div>

      {/* Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card
              className={`relative h-full flex flex-col ${
                tier.popular
                  ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                  : "border-border/40"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 animate-shimmer">
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.label}</p>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    R${annual ? tier.annualPrice : tier.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                {annual && tier.monthlyPrice > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Cobrado anualmente (R$
                    {tier.annualPrice * 12}/ano)
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`mt-8 w-full btn-press ${
                    tier.popular
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : ""
                  }`}
                  variant={tier.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
