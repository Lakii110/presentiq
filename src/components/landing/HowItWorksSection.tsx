import { Upload, Cpu, LineChart } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: 1,
    title: "Record or Upload",
    description: "Speak directly into your microphone or upload a pre-recorded file of your presentation.",
    color: "bg-primary",
  },
  {
    icon: Cpu,
    number: 2,
    title: "Get AI Analysis",
    description: "Our advanced AI processes your speech in seconds, analyzing over 30 different vocal and visual metrics.",
    color: "bg-accent",
  },
  {
    icon: LineChart,
    number: 3,
    title: "Improve & Track",
    description: "Review your personalized feedback, practice specific areas, and watch your scores improve over time.",
    color: "bg-success",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            How PresentIQ Works
          </h2>
          <p className="text-muted-foreground">
            Three simple steps to transform your speaking skills. No setup required.
          </p>
        </div>
        <div className="relative grid gap-10 md:grid-cols-3">
          {/* Connector line between steps */}
          <div className="absolute top-10 left-[20%] right-[20%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                <div className={`absolute inset-0 rounded-2xl ${step.color} opacity-10`} />
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${step.color}`}>
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
                  {step.number}
                </span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
