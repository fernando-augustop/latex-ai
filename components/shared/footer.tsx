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
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="font-serif text-xl font-bold">
              Tex<span className="text-gradient">AI</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Edição profissional de LaTeX com assistência de IA. Escreva
              documentos melhores, mais rápido.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Produto
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recursos
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TexAI. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Feito com Next.js + IA
          </p>
        </div>
      </div>
    </footer>
  );
}
