"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fadeIn, fadeInUp, staggerContainer } from "@/lib/motion";
import { Check, AlertTriangle, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <motion.div
      className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={fadeIn} className="mb-6 font-serif text-4xl font-semibold">
        Configurações
      </motion.h1>

      <div className="space-y-6">
        {/* Profile */}
        <motion.div variants={fadeInUp}>
          <Card className="border-border/55 bg-card/75">
            <CardHeader>
              <h2 className="font-serif text-3xl">Perfil</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPending ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-primary/35">
                  {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
                  <AvatarFallback className="bg-primary/15 text-primary text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.name ?? "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email ?? ""}
                  </p>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" defaultValue={user?.name ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" defaultValue={user?.email ?? ""} disabled />
              </div>
              <Button size="sm" className="btn-press">
                Salvar Alterações
              </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription */}
        <motion.div variants={fadeInUp}>
          <Card className="border-border/55 bg-card/75">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-3xl">Assinatura</h2>
                <Badge
                  variant="secondary"
                  className="border-primary/35 bg-primary/15 text-primary"
                >
                  Gratuito
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Você está no plano Gratuito. Faça upgrade para acessar recursos de IA e projetos ilimitados.
              </p>

              {/* Current plan features */}
              <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Seu plano inclui
                </p>
                <ul className="space-y-2">
                  {[
                    "3 projetos",
                    "Visualização no navegador",
                    "50 MB de armazenamento",
                    "Editor colaborativo básico",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                size="sm"
                className="btn-press rounded-full"
              >
                Fazer Upgrade para Pro
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={fadeInUp}>
          <Card className="border-destructive/45 bg-card/75">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h2 className="text-lg font-semibold text-destructive">
                  Zona de Perigo
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Excluir conta</p>
                  <p className="text-xs text-muted-foreground">
                    Exclua permanentemente sua conta e todos os seus dados. Esta ação é irreversível.
                  </p>
                </div>
                <Button variant="destructive" size="sm" className="btn-press shrink-0">
                  Excluir Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
