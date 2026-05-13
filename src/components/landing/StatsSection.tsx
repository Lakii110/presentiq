const stats = [
  { value: "30K+", label: "Training Samples" },
  { value: "7", label: "Languages Supported" },
  { value: "67", label: "Acoustic Features Analyzed" },
  { value: "0.87", label: "AI Accuracy (Pearson r)" },
];

const StatsSection = () => {
  return (
    <section className="border-y border-border bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">{stat.value}</div>
              <div className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
