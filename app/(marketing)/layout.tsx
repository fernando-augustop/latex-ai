import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid-overlay relative flex min-h-screen flex-col overflow-x-clip">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
