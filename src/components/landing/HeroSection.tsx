"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroBotAnimation from "./HeroBotAnimation";

const HeroSection = () => {
  return (
    <section className="gradient-hero overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1320 }}>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="max-w-xl">
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs sm:text-sm text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Practice smarter, present better
            </div>
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-foreground">
              Master Every Presentation with{" "}
              <span className="text-gradient">AI-Powered</span>{" "}
              Feedback
            </h1>
            <p className="mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed text-muted-foreground">
              Get instant feedback on your pacing, filler words, confidence, and clarity. Practice privately and deliver perfectly when it matters most.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 px-6 sm:px-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                  Start Analyzing Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-3 sm:mt-4 text-xs text-muted-foreground/70">Free to use. No sign-up required.</p>
          </div>
          <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
            <HeroBotAnimation />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
