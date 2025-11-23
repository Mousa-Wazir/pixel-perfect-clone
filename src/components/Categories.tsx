import { Code, Palette, TrendingUp, Shield, Cloud, Cpu, Gamepad2, Camera } from "lucide-react";

const categories = [
  { name: "Web Development", icon: Code, count: 45, color: "from-primary to-primary/80" },
  { name: "Design", icon: Palette, count: 32, color: "from-secondary to-secondary/80" },
  { name: "Marketing", icon: TrendingUp, count: 28, color: "from-accent to-accent/80" },
  { name: "Security", icon: Shield, count: 18, color: "from-success to-success/80" },
  { name: "Cloud Computing", icon: Cloud, count: 24, color: "from-primary to-secondary" },
  { name: "AI & ML", icon: Cpu, count: 15, color: "from-secondary to-accent" },
  { name: "Game Dev", icon: Gamepad2, count: 22, color: "from-accent to-primary" },
  { name: "Creative", icon: Camera, count: 19, color: "from-success to-primary" },
];

const Categories = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Explore By Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover courses across multiple disciplines and find your passion
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-1 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 transition-opacity group-hover:opacity-10`} />
                <div className="relative space-y-3">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${category.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} courses</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
