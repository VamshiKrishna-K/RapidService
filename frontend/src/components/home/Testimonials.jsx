import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Johnson",
    service: "Expert Plumbing",
    text: "RapidService made it so easy to find a plumber during an emergency. The service was professional and the booking was seamless!",
    rating: 5
  },
  {
    name: "Sarah Miller",
    service: "Interior Painting",
    text: "I'm thrilled with the results of my home renovation. The professional I found through this platform was punctual and highly skilled.",
    rating: 5
  },
  {
    name: "David Chen",
    service: "Garden Maintenance",
    text: "Great experience! The transparent pricing and verified reviews gave me peace of mind. Highly recommended for any household task.",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-foreground uppercase tracking-tight mb-4">Customer Stories</h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-medium">
            Real feedback from our trusted service community.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-card border-2 border-border rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-up"
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-accent text-accent"
                  />
                ))}
              </div>
              <p className="text-foreground mb-8 leading-relaxed font-medium italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4 border-t border-border pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-foreground uppercase tracking-tight">{t.name}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t.service}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

