"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="gradient-cta rounded-2xl px-8 py-16 text-center md:px-16">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            Start Improving Your Speaking Today
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/70">
            Join thousands of professionals who have already mastered their delivery with AI-powered feedback. Completely free.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2 px-8 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                Start Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-primary-foreground/50">Free to use. No sign-up required.</p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
