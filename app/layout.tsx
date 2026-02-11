import type { Metadata } from "next";
import { Bodoni_Moda, IBM_Plex_Mono, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Agentation } from "agentation";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { getToken } from "@/lib/auth-server";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TexAI - Editor LaTeX com Inteligência Artificial",
  description:
    "Escreva documentos LaTeX com assistência de IA. Pré-visualização em tempo real, sugestões inteligentes e templates profissionais.",
  keywords: ["LaTeX", "editor", "IA", "acadêmico", "escrita", "PDF"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${bodoni.variable} ${ibmPlexMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ConvexClientProvider initialToken={token}>
          {children}
        </ConvexClientProvider>
        <Toaster />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
