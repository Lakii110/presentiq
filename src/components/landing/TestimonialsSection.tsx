"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getPublicFeedback, type FeedbackOut } from "@/lib/api";

const FALLBACK = [
  { id: -1, rating: 5, display_name: "Sarah Jenkins", job_title: "Marketing Director", message: "PresentIQ completely changed how I prepare for board meetings. The filler word detection alone made me sound 10x more professional.", created_at: "" },
  { id: -2, rating: 5, display_name: "David Chen",   job_title: "Software Engineer",  message: "As a non-native English speaker, the pacing feedback was invaluable. I finally know when I'm rushing and how to pause effectively.", created_at: "" },
  { id: -3, rating: 5, display_name: "Dr. Emily Carter", job_title: "University Professor", message: "I recommend this to all my students. It's like having a personal public speaking coach available 24/7. The progress tracking is fantastic.", created_at: "" },
];

const AVATAR_COLORS = [
  "bg-primary", "bg-success", "bg-accent",
  "bg-info", "bg-warning", "bg-destructive",
];

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const TestimonialsSection = () => {
  const [items, setItems] = useState<FeedbackOut[]>([]);

  useEffect(() => {
    getPublicFeedback()
      .then((data) => { if (data.length > 0) setItems(data); })
      .catch(() => { /* silently fall back */ });
  }, []);

  const display = items.length >= 3 ? items.slice(0, 3) : FALLBACK;

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Loved by Speakers Worldwide
          </h2>
          <p className="text-muted-foreground">
            Don't just take our word for it. See how PresentIQ is helping professionals communicate better.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {display.map((t, i) => (
            <div
              key={t.id}
              className={`rounded-xl border border-border bg-card p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${i === 1 ? "md:-translate-y-2" : ""}`}
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">"{t.message}"</p>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-sm font-bold text-primary-foreground`}>
                  {initials(t.display_name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.display_name}</p>
                  {t.job_title && <p className="text-xs text-muted-foreground">{t.job_title}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
