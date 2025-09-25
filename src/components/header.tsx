import { Logo } from "@/components/logo";
import Link from "next/link";

export function Header() {
  return (
    <header className="w-full p-4 border-b bg-card shadow-sm">
      <div className="container mx-auto flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3" aria-label="Home">
          <Logo />
          <h1 className="text-2xl font-bold font-headline text-foreground">
            ClassConnect
          </h1>
        </Link>
      </div>
    </header>
  );
}
