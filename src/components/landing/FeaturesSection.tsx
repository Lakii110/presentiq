import { Mic, Search, Activity, TrendingUp, AudioWaveform, Lightbulb } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "AI Speech Analysis",
    description: "Record or upload your speech and get deep AI-powered analysis covering fluency, tone, grammar, and delivery quality.",
    highlight: true,
  },
  {
    icon: Search,
    title: "Filler Word Detection",
    description: 'Automatically identify and track "um", "uh", "like", and other filler words with exact counts and rate percentage.',
  },
  {
    icon: Activity,
    title: "Pacing & Rhythm Feedback",
    description: "Measure your words-per-minute, detect pace inconsistencies, and get targeted advice to hit the ideal 130–160 WPM range.",
  },
  {
    icon: TrendingUp,
    title: "Confidence Score",
    description: "Our AI evaluates your delivery consistency, pace control, and vocal steadiness to measure how confident you sound.",
    highlight: true,
  },
  {
    icon: AudioWaveform,
    title: "Vocal Variety Analysis",
    description: "Analyze tone variation, energy levels, and engagement indicators to ensure your delivery keeps your audience interested.",
  },
  {
    icon: Lightbulb,
    title: "AI-Powered Suggestions",
    description: "Receive a personalized improvement plan with prioritized, actionable steps targeting your specific weak points.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-card py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Everything You Need to Present with Confidence
          </h2>
          <p className="text-muted-foreground">
            Our comprehensive suite of AI tools breaks down every aspect of your presentation, giving you the insights needed to become a master communicator.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group rounded-xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 ${
                feature.highlight
                  ? "border-primary/20 shadow-sm shadow-primary/5"
                  : "border-border"
              }`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
