"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-20 bg-background border-b border-gray-200">
      <div className="w-3/4 mx-auto">
        <div className="flex items-center justify-between py-4">
          {/* Left side: Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-secondary-foreground"
          >
            Interview AI
          </Link>

          {/* Right side: Navigation links and Login button */}
          <div className="flex items-center gap-8">
            <Link href="/">Entrevista</Link>
            <Link href="/preguntas">Preguntas</Link>
            <Link href="/https://insigh.to/b/mikui" target="_blank_">
              Sugieres cambio?
            </Link>
            <SignedOut>
              <SignInButton>
                <Button>Iniciar sesion</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}
