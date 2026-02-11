"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Github, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { fadeInUp, fadeIn, staggerContainer } from "@/lib/motion";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(
    null
  );
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "E-mail ou senha incorretos.");
      } else {
        router.push("/projects");
      }
    } catch {
      setError("Erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    setError("");
    setOauthLoading(provider);

    try {
      await signIn.social({
        provider,
        callbackURL: "/projects",
      });
    } catch {
      setError(`Erro ao conectar com ${provider === "google" ? "Google" : "GitHub"}. Tente novamente.`);
      setOauthLoading(null);
    }
  }

  const isDisabled = loading || oauthLoading !== null;

  return (
    <motion.div
      className="w-full max-w-[560px] px-4"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      <Card className="w-full border-border/55 bg-card/80 shadow-[0_30px_60px_oklch(0.07_0.01_230/55%)] backdrop-blur-xl">
        <CardHeader className="text-center pb-2 pt-8 px-8 sm:px-12">
          <motion.h1
            className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            Bem-vindo de volta
          </motion.h1>
          <motion.p
            className="mt-2 text-sm uppercase tracking-[0.18em] text-muted-foreground"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08 }}
          >
            Entre na sua conta TexAI
          </motion.p>
        </CardHeader>

        <CardContent className="space-y-5 px-8 sm:px-12 pt-4">
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* OAuth */}
          <motion.div
            className="grid grid-cols-2 gap-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp}>
              <Button
                variant="outline"
                className="h-11 w-full gap-2.5 rounded-full text-sm"
                onClick={() => handleOAuth("google")}
                disabled={isDisabled}
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Google
              </Button>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Button
                variant="outline"
                className="h-11 w-full gap-2.5 rounded-full text-sm"
                onClick={() => handleOAuth("github")}
                disabled={isDisabled}
              >
                {oauthLoading === "github" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Github className="h-4 w-4" />
                )}
                GitHub
              </Button>
            </motion.div>
          </motion.div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              ou
            </span>
          </div>

          {/* Email/Password */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="space-y-2" variants={fadeInUp}>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="você@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isDisabled}
                className="h-11"
                required
              />
            </motion.div>
            <motion.div className="space-y-2" variants={fadeInUp}>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isDisabled}
                  className="h-11 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="pt-1">
              <Button
                type="submit"
                className="btn-press h-11 w-full rounded-full font-medium"
                disabled={isDisabled}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </motion.div>
          </motion.form>
        </CardContent>

        <CardFooter className="justify-center pb-8">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="font-medium text-primary transition-colors hover:text-primary/85"
            >
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
