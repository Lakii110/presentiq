"use client";

import Link from "next/link";
import BotLogo from "@/components/BotLogo";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BotLogo size={32} />
          <span className="text-lg font-bold text-foreground">PresentIQ</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-xs font-medium text-muted-foreground/70 transition-colors hover:text-foreground">Features</a>
          <a href="#how-it-works" className="text-xs font-medium text-muted-foreground/70 transition-colors hover:text-foreground">How It Works</a>
          <a href="#faq" className="text-xs font-medium text-muted-foreground/70 transition-colors hover:text-foreground">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              Start Now
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
