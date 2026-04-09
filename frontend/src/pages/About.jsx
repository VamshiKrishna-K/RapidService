import { Users, Globe, ShieldCheck, Mail, MapPin, Sparkles, Building2, Target } from "lucide-react";

const About = () => {
  const stats = [
    { label: "Active Users", value: "240k+" },
    { label: "Partner Professionals", value: "15,000+" },
    { label: "Bookings Completed", value: "1.2M+" },
    { label: "Cities Covered", value: "45+" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent/20 opacity-50" />
        <div className="container max-w-4xl mx-auto relative z-10 text-center animate-fade-up">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-3xl border border-white/10 shadow-2xl">
             <Building2 className="w-8 h-8 text-accent" />
          </div>
          <span className="text-accent font-black tracking-[0.3em] uppercase text-xs mb-4 block">Corporate Identity</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8">Local Service Marketplace</h1>
          <p className="text-xl text-primary-foreground/70 leading-relaxed font-medium max-w-2xl mx-auto italic">
            "Eliminating friction between project needs and elite professional execution since 2026."
          </p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="container max-w-6xl mx-auto py-24 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="animate-fade-right">
            <h2 className="text-4xl font-black text-foreground uppercase tracking-tight mb-8 leading-none">The Genesis of <br/>RapidService</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed font-medium text-lg">
              We observed a critical fracture in the local economy: high-demand homeowners struggling with visibility, and top-tier professionals fighting for discovery. RapidService was engineered to bridge this gap through technology, transparency, and trust.
            </p>
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, title: "RIGOROUS VERIFICATION", desc: "Every professional undergoes a 12-point background check." },
                { icon: Globe, title: "ELITE ACCESSIBILITY", desc: "Access the top 1% of local talent with single-tap booking." },
                { icon: Target, title: "PRECISION MATCHING", desc: "Our AI maps the perfect pro to your specific project needs." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 group">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground text-xs uppercase tracking-widest mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative group animate-fade-left">
            <div className="absolute -inset-4 bg-accent/20 rounded-[3rem] blur-2xl group-hover:opacity-40 transition duration-700"></div>
            <div className="relative rounded-[3rem] overflow-hidden border-4 border-border shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800" 
                alt="Our high-performance team" 
                className="w-full object-cover h-[500px] transform group-hover:scale-105 transition duration-1000" 
              />
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-24 mt-12 border-y border-border">
          {stats.map((s) => (
            <div key={s.label} className="text-center group">
              <div className="text-4xl font-black text-primary mb-2 tracking-tighter group-hover:scale-110 transition-transform">{s.value}</div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Global Support */}
        <div className="mt-24 bg-card border-2 border-border rounded-[3rem] p-12 lg:p-20 text-center animate-fade-up shadow-sm">
           <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8">
              <Users className="w-8 h-8 text-primary" />
           </div>
           <h2 className="text-4xl font-black text-foreground uppercase tracking-tight mb-4">Global Network Support</h2>
           <p className="text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed text-lg">Whether you are looking to secure elite services or expand your professional presence, our support team is active 24/7 across the continent.</p>
           <div className="flex flex-wrap justify-center gap-10">
             <div className="flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">
               <Mail className="w-5 h-5 text-primary" /> HQ@rapidservice.com
             </div>
             <div className="flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">
               <MapPin className="w-5 h-5 text-primary" /> Global Operations
             </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default About;

