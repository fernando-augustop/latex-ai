"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const navLinks = [
  { href: "/", label: "Início", scrollToTop: true },
  { href: "/#features", label: "Recursos", scrollTo: "features" },
  { href: "/pricing", label: "Planos" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleScrollLink = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, scrollTo: string) => {
      if (pathname === "/") {
        e.preventDefault();
        const el = document.getElementById(scrollTo);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    },
    [pathname]
  );

  const handleScrollToTop = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pathname]
  );

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-5 sm:pt-4">
      <nav className="panel-glass relative mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-semibold tracking-tight">
            Tex<span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop nav — absolutely centered */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-[0.22em] text-muted-foreground/90 transition-colors hover:text-foreground"
              onClick={link.scrollTo ? (e) => handleScrollLink(e, link.scrollTo) : link.scrollToTop ? handleScrollToTop : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {session?.user ? (
            <Button
              size="sm"
              className="btn-press rounded-full px-5"
              asChild
            >
              <Link href="/projects">Meus Projetos</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button
                size="sm"
                className="btn-press rounded-full px-5"
                asChild
              >
                <Link href="/register">Começar</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Alternar menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-border/50 bg-popover/95">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <div className="flex flex-col gap-6 pt-6">
              <Link
                href="/"
                className="font-serif text-xl font-semibold"
                onClick={() => setOpen(false)}
              >
                Tex<span className="text-primary">AI</span>
              </Link>
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                    onClick={(e) => {
                      setOpen(false);
                      if (link.scrollTo) handleScrollLink(e, link.scrollTo);
                      else if (link.scrollToTop) handleScrollToTop(e);
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-2 border-t border-border/50 pt-4">
                {session?.user ? (
                  <Button className="rounded-full" asChild>
                    <Link href="/projects" onClick={() => setOpen(false)}>
                      Meus Projetos
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/login" onClick={() => setOpen(false)}>
                        Entrar
                      </Link>
                    </Button>
                    <Button className="rounded-full" asChild>
                      <Link href="/register" onClick={() => setOpen(false)}>
                        Começar
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
