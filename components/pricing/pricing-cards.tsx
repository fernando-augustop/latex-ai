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
      "Compilação no servidor (15/min)",
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
      "Compilação no servidor (ilimitada)",
      "Claude Haiku + GPT-4o-mini",
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
      "Compilação no servidor (ilimitada)",
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
      <div className="mb-12 flex items-center justify-center gap-3">
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
            className="ml-2 border-primary/35 bg-primary/15 text-primary"
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
            className="flex flex-col"
          >
            {tier.popular ? (
              <div className="mb-3 flex justify-center">
                <Badge className="animate-shimmer border-primary/45 bg-primary/20 text-primary hover:bg-primary/20">
                  Mais Popular
                </Badge>
              </div>
            ) : (
              <div className="mb-3 h-[22px]" />
            )}
            <Card
              className={`relative flex flex-1 flex-col ${
                tier.popular
                  ? "border-primary/55 bg-card/90 shadow-[0_26px_40px_oklch(0.06_0.012_230/55%)]"
                  : "border-border/55 bg-card/75"
              }`}
            >

              <CardHeader className="pb-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-3xl font-semibold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.label}</p>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-serif text-5xl font-semibold">
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
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`mt-8 w-full btn-press ${
                    tier.popular
                      ? "rounded-full"
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
