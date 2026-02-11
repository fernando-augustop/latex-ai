import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at top, rgba(16,185,129,0.05), transparent 70%)",
      }}
    >
      <Link href="/" className="mb-8 font-serif text-3xl font-bold">
        Tex<span className="text-gradient">AI</span>
      </Link>
      {children}
    </div>
  );
}
