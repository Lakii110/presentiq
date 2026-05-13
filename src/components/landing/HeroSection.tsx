"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroBotAnimation from "./HeroBotAnimation";

const HeroSection = () => {
  return (
    <section className="gradient-hero overflow-hidden py-20 lg:py-28">
      <div className="container mx-auto px-4" style={{ maxWidth: 1320 }}>
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Practice smarter, present better
            </div>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Master Every Presentation with{" "}
              <span className="text-gradient">AI-Powered</span>{" "}
              Feedback
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Get instant feedback on your pacing, filler words, confidence, and clarity. Practice privately and deliver perfectly when it matters most.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2 px-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                  Start Analyzing Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground/70">Free to use. No sign-up required.</p>
            <div className="mt-10">
              <p className="mb-3 text-xs text-muted-foreground/60">Trusted by teams and students at</p>
              <div className="flex flex-wrap items-center gap-8 text-sm font-semibold text-muted-foreground/40">
                <span>Google</span>
                <span>Microsoft</span>
                <span>Stanford</span>
                <span>TED</span>
                <span>Deloitte</span>
                <span>Salesforce</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroBotAnimation />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
