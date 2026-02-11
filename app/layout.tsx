import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { getToken } from "@/lib/auth-server";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
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
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ConvexClientProvider initialToken={token}>
          {children}
        </ConvexClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
