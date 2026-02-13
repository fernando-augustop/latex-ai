"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FolderOpen, Settings, LogOut } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/projects", label: "Projetos", icon: FolderOpen },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="grid-overlay flex min-h-screen flex-col">
      {/* Dashboard Navbar */}
      <header className="sticky top-0 z-50 w-full px-3 pt-2 sm:px-5 sm:pt-2">
        <nav className="panel-glass relative mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-serif text-xl font-semibold">
            Tex<span className="text-gradient">AI</span>
          </Link>

          {/* Nav tabs — absolutely centered */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 sm:flex">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${
                    isActive
                      ? "border-primary/45 bg-primary/15 text-foreground"
                      : "text-muted-foreground"
                  }`}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full border border-border/55 bg-card/35">
                <Avatar className="h-8 w-8">
                  {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
                  <AvatarFallback className="bg-primary/15 text-primary text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
