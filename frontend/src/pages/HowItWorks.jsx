import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HowItWorksComponent from "@/components/home/HowItWorks";
import { Sparkles, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Page Header */}
      <section className="bg-primary text-primary-foreground py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent/20 opacity-30" />
        <div className="container max-w-4xl mx-auto text-center relative z-10 animate-fade-up">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-3xl border border-white/10 shadow-2xl">
             <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <span className="text-accent font-black tracking-[0.3em] uppercase text-xs mb-4 block">Operational Guide</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-12">The Efficiency <br/><span className="underline decoration-4 underline-offset-8">Protocol</span></h1>
          <p className="text-xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto font-medium">
            Discover the streamlined architecture of how we connect elite professionals with project requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/" className="bg-accent text-accent-foreground px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20">
              Start Exploring
            </Link>
            <Link to="/register" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all">
              Join Network
            </Link>
          </div>
        </div>
      </section>

      {/* Main Component Injection */}
      <div className="py-20">
        <HowItWorksComponent />
      </div>

      {/* Final Call to Action */}
      <section className="container max-w-4xl mx-auto py-24 px-6 text-center">
         <div className="bg-card border-2 border-border rounded-[3.5rem] p-12 lg:p-20 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
            <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter">Ready to Execute?</h3>
            <p className="text-muted-foreground mb-12 font-medium text-lg max-w-lg mx-auto">Join thousands of verified homeowners and elite specialists growing their local presence together.</p>
            <Link to="/register" className="inline-flex items-center gap-4 bg-primary text-primary-foreground px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all">
              Initialize Your Account <ArrowRight className="w-4 h-4" />
            </Link>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;

