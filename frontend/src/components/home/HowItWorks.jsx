import { Search, Calendar, CheckCircle, ArrowRight, Shield, Star, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Your Pro",
    description: "Browse detailed profiles of top-rated professionals. Compare prices, reviews, and verified credentials.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Calendar,
    title: "Instant Booking",
    description: "Simply choose a date and time that fits your schedule, and book in seconds. No phone calls needed.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: CheckCircle,
    title: "Get Job Done",
    description: "Our professionals show up on time and ready to work. Pay securely through our platform only when satisfied.",
    color: "bg-[#10b981]/10 text-[#10b981]",
  },
];

const features = [
  { icon: Shield, title: "Verified Pros", desc: "Every professional undergoes a background check and identity verification." },
  { icon: Star, title: "Top-Rated Quality", desc: "View detailed ratings and feedback from our community of satisfied customers." },
  { icon: MessageSquare, title: "Easy Chat", desc: "Communicate directly with your pro through our secure messaging system." },
];

const HowItWorks = ({ showFeatures = true }) => {
  return (
    <section className="py-24 bg-background">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-tight mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium uppercase tracking-widest text-[10px]">Three simple steps to transform your home with professional help.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center group">
              <div className={`w-20 h-20 ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-8 transform group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-black/5`}>
                <step.icon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black mb-3 text-foreground uppercase tracking-tight">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                {step.description}
              </p>
              {i < 2 && (
                <div className="hidden md:block absolute top-10 left-[66%] w-full h-[2px] bg-border/40">
                  <ArrowRight className="absolute -right-4 -top-4 w-8 h-8 text-border/40" />
                </div>
              )}
            </div>
          ))}
        </div>

        {showFeatures && (
          <div className="mt-32 p-12 bg-card border-2 border-border/50 rounded-[3rem] overflow-hidden relative shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
              {features.map((f) => (
                <div key={f.title}>
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-inner">
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h4 className="font-black text-foreground mb-2 uppercase tracking-tight">{f.title}</h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HowItWorks;

