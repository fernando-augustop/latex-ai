"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NewProjectDialog } from "@/components/editor/new-project-dialog";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import { FileText, Clock, AlertTriangle, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TIER_LIMITS } from "@/lib/tier-limits";

function ProjectCardSkeleton() {
  return (
    <Card className="border-border/55 bg-card/70">
      <CardContent className="p-6">
        <Skeleton className="mb-4 h-32 w-full rounded-md" />
        <Skeleton className="h-5 w-3/4" />
        <div className="mt-2 flex items-center gap-1.5">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const { isAuthenticated } = useConvexAuth();
  const [user, setUser] = useState<Doc<"users"> | null>(null);
  const getOrCreate = useMutation(api.users.getOrCreateCurrentUser);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getOrCreate()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, getOrCreate]);

  const projects = useQuery(
    api.projects.listByUser,
    user ? { userId: user._id } : "skip"
  );

  const isLoading = !user || projects === undefined;
  const usedProjects = projects?.length ?? 0;
  const tierLimits = TIER_LIMITS[user?.tier ?? "free"];
  const maxProjects = tierLimits.maxProjects;
  const isUnlimited = maxProjects === Infinity;
  const isAtLimit = !isUnlimited && usedProjects >= maxProjects;
  const usagePercent = isUnlimited ? 0 : (usedProjects / maxProjects) * 100;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-semibold sm:text-5xl">Projetos</h1>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {isUnlimited
                  ? `${usedProjects} projetos`
                  : `${usedProjects}/${maxProjects} projetos usados`}
              </span>
            </div>
            {!isUnlimited && (
              <div className="h-2 w-52 overflow-hidden rounded-full border border-border/60 bg-muted/25 p-[2px]">
                <motion.div
                  className={`h-full rounded-full ${
                    isAtLimit
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            )}
          </div>
        </div>
        {user && <NewProjectDialog userId={user._id} />}
      </div>

      {/* Upgrade banner */}
      {isAtLimit && (
        <motion.div
          className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Limite de projetos atingido</p>
            <p className="text-xs text-muted-foreground">
              Faça upgrade para o Pro e tenha projetos ilimitados e assistência de IA.
            </p>
          </div>
          <Link
            href="/pricing"
            className="text-sm font-medium text-primary hover:text-primary/85"
          >
            Upgrade
          </Link>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      )}

      {/* Projects grid */}
      {!isLoading && (
        <motion.div
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {projects.map((project) => (
            <motion.div key={project._id} variants={fadeInUp}>
              <Link href={`/projects/${project._id}`}>
                <Card className="card-hover-glow group h-full border-border/55 bg-card/75 transition-colors hover:border-primary/40 hover:bg-card/95">
                  <CardContent className="p-6">
                    {/* Thumbnail placeholder */}
                    <div className="mb-4 flex h-32 items-center justify-center rounded-xl border border-border/40 bg-muted/25">
                      <FileText className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                    <h3 className="truncate font-serif text-xl group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(project.updatedAt, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}

          {/* Empty state if no projects */}
          {projects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/35 bg-primary/12">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-2 font-serif text-3xl">Nenhum projeto ainda</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Crie seu primeiro projeto para começar a escrever em LaTeX com assistência de IA.
              </p>
              {user && (
                <div className="mt-6">
                  <NewProjectDialog userId={user._id} />
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
