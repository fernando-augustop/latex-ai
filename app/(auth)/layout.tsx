import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid-overlay relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-14">
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/18 blur-3xl" />
      <div className="absolute -right-28 bottom-20 h-80 w-80 rounded-full bg-sky-400/18 blur-3xl" />

      <div className="relative flex w-full flex-col items-center">
        <Link href="/" className="mb-9 font-serif text-4xl font-semibold tracking-tight">
          Tex<span className="text-gradient">AI</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
