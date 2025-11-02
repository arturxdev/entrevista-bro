"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === "/"
                  ? "text-secondary-foreground"
                  : "text-gray-600 hover:text-black"
              )}
            >
              Entrevista
            </Link>
            <Link
              href="/preguntas"
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === "/preguntas"
                  ? "text-secondary-foreground"
                  : "text-gray-600 hover:text-black"
              )}
            >
              Preguntas
            </Link>
            <Button
              variant="ghost"
              className="text-sm font-medium text-secondary-foreground"
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
