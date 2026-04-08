import {
  Wrench,
  Sparkles,
  Zap,
  Paintbrush,
  Scissors,
  Truck,
  TreePine,
  ShieldCheck,
} from "lucide-react";

const categories = [
  { icon: Sparkles, name: "Cleaning" },
  { icon: Wrench, name: "Repair" },
  { icon: Paintbrush, name: "Painting" },
  { icon: Zap, name: "Electrician" },
  { icon: Scissors, name: "Salon" },
  { icon: Truck, name: "Moving" },
  { icon: TreePine, name: "Gardening" },
  { icon: ShieldCheck, name: "Security" },
];

const Categories = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">
            Service Spectrum
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-medium">
            Explore our wide range of professional services available in your
            area
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="group bg-card border-2 border-border/50 rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all">
                <cat.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-black text-foreground uppercase tracking-tight text-lg mb-2">
                {cat.name}
              </h3>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Explore Now →
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;

