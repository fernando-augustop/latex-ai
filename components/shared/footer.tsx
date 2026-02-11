import Link from "next/link";

const footerLinks = {
  product: [
    { href: "/#features", label: "Recursos" },
    { href: "/pricing", label: "Planos" },
    { href: "/login", label: "Entrar" },
  ],
  resources: [
    { href: "#", label: "Documentação" },
    { href: "#", label: "Modelos" },
    { href: "#", label: "Guia LaTeX" },
  ],
};

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="font-serif text-2xl font-semibold">
              Tex<span className="text-gradient">AI</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Edição profissional de LaTeX com assistência de IA. Escreva
              documentos melhores, mais rápido.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Produto
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Recursos
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-2 border-t border-border/40 pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TexAI. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground/90">
            Feito com Next.js + IA
          </p>
        </div>
      </div>
    </footer>
  );
}
